/**
 * crypto.ts — Hachage SHA-256 via Web Crypto API (natif, aucune dépendance)
 * Le mot de passe n'est jamais stocké en clair.
 */

export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash par défaut du mot de passe admin "apecdi2024" — à changer avant déploiement.
 */
export const DEFAULT_PASSWORD_HASH = '1c8f5d6ab760ec21e30b497df68ad6f1c196650dbf2847c0dec022c94b0994fd'
// hash de : apecdi2024  — À remplacer avant déploiement

/**
 * Hash par défaut du code développeur "devapecdi2024" — donne accès aux Paramètres.
 * Seul le développeur connaît ce code. À changer avant déploiement.
 */
export const DEFAULT_DEV_CODE_HASH = 'cf9b83f0132017d6bb105ff2f259e78aa370edcc58ad060e9700e4690078f0b0'
// hash de : devapecdi2024  — À remplacer avant déploiement
