/**
 * github-sync.ts — Mode B : synchronisation GitHub via API REST
 *
 * Le PAT est stocké uniquement dans localStorage du navigateur de l'admin.
 * Il n'est jamais commité, jamais envoyé ailleurs qu'à api.github.com.
 *
 * Permissions requises pour le PAT :
 * Fine-grained token → Contents: Read and write
 */

const PAT_KEY = 'apecdi_github_pat'
const REPO_KEY = 'apecdi_github_repo'

// ─── PAT ──────────────────────────────────────────────────────────────────────

export function savePAT(token: string): void {
  localStorage.setItem(PAT_KEY, token)
}

export function getPAT(): string | null {
  return localStorage.getItem(PAT_KEY)
}

export function clearPAT(): void {
  localStorage.removeItem(PAT_KEY)
}

export function saveRepo(repo: string): void {
  localStorage.setItem(REPO_KEY, repo)
}

export function getRepo(): string | null {
  return localStorage.getItem(REPO_KEY)
}

// ─── API GitHub ────────────────────────────────────────────────────────────────

interface GitHubFileResponse {
  sha?: string
  content?: string
  encoding?: string
}

async function githubRequest(path: string, method: string, body?: unknown): Promise<Response> {
  const pat = getPAT()
  if (!pat) throw new Error('Aucun Personal Access Token GitHub configuré.')

  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return res
}

/**
 * Récupère le SHA d'un fichier existant (nécessaire pour le mettre à jour).
 */
async function getFileSHA(repo: string, filePath: string): Promise<string | null> {
  const res = await githubRequest(`/repos/${repo}/contents/${filePath}`, 'GET')
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Erreur GitHub ${res.status}: ${res.statusText}`)
  const data: GitHubFileResponse = await res.json()
  return data.sha || null
}

/**
 * Crée ou met à jour un fichier dans le repo GitHub.
 */
export async function pushFile(filePath: string, content: string, commitMessage: string): Promise<void> {
  const repo = getRepo()
  if (!repo) throw new Error('Aucun dépôt GitHub configuré. Format attendu : owner/repo')

  const sha = await getFileSHA(repo, filePath)
  const encoded = btoa(unescape(encodeURIComponent(content)))

  const body: Record<string, unknown> = {
    message: commitMessage,
    content: encoded,
    branch: 'main',
  }

  if (sha) body.sha = sha

  const res = await githubRequest(`/repos/${repo}/contents/${filePath}`, 'PUT', body)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Erreur GitHub ${res.status}: ${(err as { message?: string }).message || res.statusText}`)
  }
}

/**
 * Pousse une image binaire (blob) vers GitHub.
 */
export async function pushImage(filePath: string, blob: Blob, commitMessage: string): Promise<void> {
  const repo = getRepo()
  if (!repo) throw new Error('Aucun dépôt GitHub configuré.')

  const sha = await getFileSHA(repo, filePath)
  const arrayBuffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const encoded = btoa(binary)

  const body: Record<string, unknown> = {
    message: commitMessage,
    content: encoded,
    branch: 'main',
  }
  if (sha) body.sha = sha

  const res = await githubRequest(`/repos/${repo}/contents/${filePath}`, 'PUT', body)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Erreur GitHub ${res.status}: ${(err as { message?: string }).message || res.statusText}`)
  }
}

/**
 * Vérifie que le PAT est valide et que le repo est accessible.
 */
export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const repo = getRepo()
    if (!repo) return { ok: false, message: 'Aucun dépôt configuré.' }
    const res = await githubRequest(`/repos/${repo}`, 'GET')
    if (res.ok) return { ok: true, message: `Connexion réussie à ${repo}` }
    if (res.status === 401) return { ok: false, message: 'Token invalide ou expiré.' }
    if (res.status === 404) return { ok: false, message: 'Dépôt introuvable. Vérifiez le nom (owner/repo).' }
    return { ok: false, message: `Erreur ${res.status}` }
  } catch (err) {
    return { ok: false, message: `Erreur réseau : ${(err as Error).message}` }
  }
}

/**
 * Récupère le dernier commit du repo.
 */
export async function getLastCommit(): Promise<string | null> {
  try {
    const repo = getRepo()
    if (!repo || !getPAT()) return null
    const res = await githubRequest(`/repos/${repo}/commits/main`, 'GET')
    if (!res.ok) return null
    const data = await res.json()
    return data.sha?.slice(0, 7) || null
  } catch {
    return null
  }
}
