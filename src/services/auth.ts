/**
 * auth.ts — Gestion de session admin
 *
 * Deux niveaux d'accès :
 * - Niveau 1 (mot de passe admin) : accès à la gestion du contenu
 * - Niveau 2 (code développeur)   : accès supplémentaire aux Paramètres
 *
 * Sécurité intentionnellement limitée : protège contre les visiteurs occasionnels.
 * Voir README pour les détails.
 */

import { sha256, DEFAULT_PASSWORD_HASH, DEFAULT_DEV_CODE_HASH } from './crypto'

const SESSION_KEY       = 'apecdi_admin_session'
const DEV_SESSION_KEY   = 'apecdi_dev_session'
const SESSION_DURATION  = 30 * 60 * 1000  // 30 min
const MAX_ATTEMPTS      = 5
const LOCKOUT_DURATION  = 60 * 1000       // 60 s

interface AdminSession {
  timestamp: number
  lastActivity: number
}

interface LockoutState {
  attempts: number
  lockedUntil: number | null
}

// ─── Session ───────────────────────────────────────────────────────────────────

export function isLoggedIn(): boolean {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return false
  try {
    const session: AdminSession = JSON.parse(raw)
    const now = Date.now()
    if (now - session.lastActivity > SESSION_DURATION) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }
    // Mettre à jour l'activité
    updateActivity()
    return true
  } catch {
    return false
  }
}

export function login(): void {
  const now = Date.now()
  const session: AdminSession = { timestamp: now, lastActivity: now }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

function updateActivity(): void {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return
  try {
    const session: AdminSession = JSON.parse(raw)
    session.lastActivity = Date.now()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch { /* ignore */ }
}

// ─── Lockout ───────────────────────────────────────────────────────────────────

function getLockout(): LockoutState {
  const raw = sessionStorage.getItem('apecdi_lockout')
  if (!raw) return { attempts: 0, lockedUntil: null }
  try {
    return JSON.parse(raw) as LockoutState
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

function saveLockout(state: LockoutState): void {
  sessionStorage.setItem('apecdi_lockout', JSON.stringify(state))
}

export function isLockedOut(): boolean {
  const { lockedUntil } = getLockout()
  if (!lockedUntil) return false
  if (Date.now() < lockedUntil) return true
  // Verrou expiré — réinitialiser
  saveLockout({ attempts: 0, lockedUntil: null })
  return false
}

export function getLockoutRemainingSeconds(): number {
  const { lockedUntil } = getLockout()
  if (!lockedUntil) return 0
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
}

function recordFailedAttempt(): void {
  const state = getLockout()
  const attempts = state.attempts + 1
  if (attempts >= MAX_ATTEMPTS) {
    saveLockout({ attempts, lockedUntil: Date.now() + LOCKOUT_DURATION })
  } else {
    saveLockout({ attempts, lockedUntil: null })
  }
}

function resetLockout(): void {
  sessionStorage.removeItem('apecdi_lockout')
}

// ─── Vérification du mot de passe ─────────────────────────────────────────────

export async function checkPassword(password: string): Promise<boolean> {
  if (isLockedOut()) return false

  const storedHash = localStorage.getItem('apecdi_pwd_hash') || DEFAULT_PASSWORD_HASH
  const inputHash = await sha256(password)

  if (inputHash === storedHash) {
    resetLockout()
    return true
  } else {
    recordFailedAttempt()
    return false
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  const hash = await sha256(newPassword)
  localStorage.setItem('apecdi_pwd_hash', hash)
}

// ─── Niveau 2 : accès Paramètres (code développeur) ───────────────────────────

/**
 * Vérifie le code développeur et ouvre une session de niveau 2.
 * La session expire en même temps que la session admin principale.
 */
export async function checkDevCode(code: string): Promise<boolean> {
  const storedHash = localStorage.getItem('apecdi_dev_hash') || DEFAULT_DEV_CODE_HASH
  const inputHash  = await sha256(code)
  if (inputHash === storedHash) {
    sessionStorage.setItem(DEV_SESSION_KEY, '1')
    return true
  }
  return false
}

/** Indique si le code dev a été saisi dans cette session. */
export function isDevUnlocked(): boolean {
  // La session dev ne dure que le temps de la session admin
  return sessionStorage.getItem(DEV_SESSION_KEY) === '1' && isLoggedIn()
}

/** Verrouille de nouveau les Paramètres sans déconnecter l'admin. */
export function lockSettings(): void {
  sessionStorage.removeItem(DEV_SESSION_KEY)
}

/** Permet au développeur de changer le code dev (stocké en localStorage). */
export async function changeDevCode(newCode: string): Promise<void> {
  const hash = await sha256(newCode)
  localStorage.setItem('apecdi_dev_hash', hash)
}
