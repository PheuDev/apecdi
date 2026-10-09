import { useEffect, useState } from 'react'
import { getSiteConfig } from '../services/content'
import { savePAT, getPAT, saveRepo, getRepo, testConnection, clearPAT } from '../services/github-sync'
import { changePassword, checkDevCode, isDevUnlocked, lockSettings, changeDevCode } from '../services/auth'
import { pushFile } from '../services/github-sync'
import Icon from '../components/Icon'
import type { SiteConfig } from '../types'
import { isToValidate } from '../types'

type TabId = 'general' | 'contact' | 'github' | 'security'

// ─── Écran de vérification du code développeur ────────────────────────────────

function DevGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const ok = await checkDevCode(code)
    if (ok) {
      onUnlock()
    } else {
      setError(true)
      setCode('')
    }
    setLoading(false)
  }

  return (
    <div className="dev-gate">
      <div className="dev-gate-box">
        <div className="dev-gate-icon"><Icon name="lock" size={28} /></div>
        <h2>Accès restreint</h2>
        <p>Les paramètres sont protégés par un code développeur.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="dev-code">Code d'accès</label>
            <div style={{ position: 'relative' }}>
              <input
                id="dev-code"
                type={show ? 'text' : 'password'}
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                autoComplete="off"
                disabled={loading}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShow(!show)}
                aria-label={show ? 'Masquer' : 'Afficher'}
              >
                <Icon name="eye" size={16} />
              </button>
            </div>
          </div>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name="x" size={14} /><span>Code incorrect.</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !code.trim()}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Accéder aux paramètres'}
          </button>
        </form>
      </div>
      <style>{`
        .dev-gate {
          display: flex; align-items: center; justify-content: center;
          min-height: 60vh; padding: var(--space-8);
        }
        .dev-gate-box {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-2xl); padding: var(--space-10);
          width: 100%; max-width: 360px; text-align: center;
          box-shadow: var(--shadow-lg);
        }
        .dev-gate-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: var(--primary-subtle); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto var(--space-5);
        }
        .dev-gate-box h2 { font-size: var(--text-xl); margin-bottom: var(--space-2); }
        .dev-gate-box p { color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-6); line-height: var(--leading-relaxed); }
        .dev-gate-box .form-group { text-align: left; }
      `}</style>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function SiteSettings() {
  const [unlocked, setUnlocked] = useState(false)

  // Vérifier si déjà déverrouillé dans cette session
  useEffect(() => { setUnlocked(isDevUnlocked()) }, [])

  if (!unlocked) {
    return <DevGate onUnlock={() => setUnlocked(true)} />
  }

  return <SettingsPanel onLock={() => { lockSettings(); setUnlocked(false) }} />
}

// ─── Panneau paramètres (accessible après code dev) ───────────────────────────

function SettingsPanel({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<TabId>('general')
  const [site, setSite] = useState<SiteConfig | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // GitHub
  const [pat, setPat] = useState('')
  const [repo, setRepo] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  // Password
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  // Code dev
  const [newDevCode, setNewDevCode] = useState('')
  const [newDevCode2, setNewDevCode2] = useState('')

  useEffect(() => {
    getSiteConfig().then(setSite)
    setPat(getPAT() || '')
    setRepo(getRepo() || '')
  }, [])

  const updateContact = (key: string, value: string) => {
    if (!site) return
    setSite({ ...site, contact: { ...site.contact, [key]: value } })
  }

  const updateSocial = (key: string, value: string) => {
    if (!site) return
    setSite({ ...site, social: { ...site.social, [key]: value } })
  }

  const updateSite = (key: keyof SiteConfig, value: unknown) => {
    if (!site) return
    setSite({ ...site, [key]: value })
  }

  const handleSaveGeneral = async () => {
    if (!site) return
    setSaving(true)
    // Mode A : télécharger le JSON
    const json = JSON.stringify(site, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'site.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setMsg({ type: 'success', text: 'site.json téléchargé. Déposez-le dans public/content/ et faites un git push.' })
    setSaving(false)
  }

  const handleSaveModeB = async () => {
    if (!site) return
    setSaving(true)
    try {
      await pushFile('public/content/site.json', JSON.stringify(site, null, 2), 'chore: update site config')
      setMsg({ type: 'success', text: 'site.json mis à jour sur GitHub. Render va redéployer.' })
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    setSaving(false)
  }

  const handleTestGitHub = async () => {
    savePAT(pat)
    saveRepo(repo)
    setTesting(true)
    const result = await testConnection()
    setTestResult(result)
    setTesting(false)
  }

  const handleSaveGitHub = () => {
    savePAT(pat)
    saveRepo(repo)
    setMsg({ type: 'success', text: 'Configuration GitHub enregistrée dans le navigateur.' })
  }

  const handleClearPAT = () => {
    clearPAT()
    setPat('')
    setMsg({ type: 'success', text: 'Token GitHub supprimé.' })
  }

  const handleChangePassword = async () => {
    if (!newPwd || newPwd !== newPwd2) {
      setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (newPwd.length < 8) {
      setMsg({ type: 'error', text: 'Le mot de passe doit faire au moins 8 caractères.' })
      return
    }
    await changePassword(newPwd)
    setNewPwd('')
    setNewPwd2('')
    setMsg({ type: 'success', text: 'Mot de passe mis à jour. Notez-le précieusement.' })
  }

  const handleChangeDevCode = async () => {
    if (!newDevCode || newDevCode !== newDevCode2) {
      setMsg({ type: 'error', text: 'Les codes ne correspondent pas.' })
      return
    }
    if (newDevCode.length < 8) {
      setMsg({ type: 'error', text: 'Le code doit faire au moins 8 caractères.' })
      return
    }
    await changeDevCode(newDevCode)
    setNewDevCode('')
    setNewDevCode2('')
    setMsg({ type: 'success', text: 'Code développeur mis à jour.' })
  }

  const modeBActive = !!getPAT() && !!getRepo()
  const contactStr = (v: unknown) => isToValidate(v) ? '' : String(v)

  if (!site) return <div className="page-loading"><div className="spinner" /></div>

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'general', label: 'Général', icon: 'settings' },
    { id: 'contact', label: 'Contact & Réseaux', icon: 'phone' },
    { id: 'github', label: 'GitHub (Mode B)', icon: 'github' },
    { id: 'security', label: 'Sécurité', icon: 'lock' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Paramètres du site</h1>
        <button className="btn btn-ghost btn-sm" onClick={onLock} title="Verrouiller les paramètres">
          <Icon name="lock" size={16} />
          Verrouiller
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={msg.type === 'success' ? 'check' : 'x'} size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`settings-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Général ── */}
      {tab === 'general' && (
        <div className="settings-panel">
          <div className="form-group">
            <label className="form-label" htmlFor="site-tagline">Accroche éditoriale</label>
            <input id="site-tagline" type="text" className="form-input" value={site.tagline} onChange={(e) => updateSite('tagline', e.target.value)} />
            <span className="form-hint">Affiché dans le héros de l'accueil. Pas un slogan officiel.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-desc">Description</label>
            <textarea id="site-desc" className="form-textarea" rows={4} value={site.description} onChange={(e) => updateSite('description', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-mission">Mission</label>
            <textarea id="site-mission" className="form-textarea" rows={4} value={site.mission} onChange={(e) => updateSite('mission', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="site-vision">Vision</label>
            <textarea id="site-vision" className="form-textarea" rows={3} value={site.vision} onChange={(e) => updateSite('vision', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="seo-desc">Description SEO</label>
            <textarea id="seo-desc" className="form-textarea" rows={3} value={site.seo.description} onChange={(e) => setSite({ ...site, seo: { ...site.seo, description: e.target.value } })} />
          </div>

          <div className="settings-save-row">
            <button className="btn btn-outline" onClick={handleSaveGeneral} disabled={saving}>
              <Icon name="download" size={16} /> Télécharger site.json (Mode A)
            </button>
            {modeBActive && (
              <button className="btn btn-primary" onClick={handleSaveModeB} disabled={saving}>
                <Icon name="github" size={16} /> Publier sur GitHub (Mode B)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Contact ── */}
      {tab === 'contact' && (
        <div className="settings-panel">
          <div className="settings-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="c-email">Email</label>
              <input id="c-email" type="email" className="form-input" value={contactStr(site.contact.email)} onChange={(e) => updateContact('email', e.target.value)} placeholder="contact@apecdi.bj" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-phone">Téléphone</label>
              <input id="c-phone" type="tel" className="form-input" value={contactStr(site.contact.phone)} onChange={(e) => updateContact('phone', e.target.value)} placeholder="+229 …" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-wa">WhatsApp</label>
              <input id="c-wa" type="tel" className="form-input" value={contactStr(site.contact.whatsapp)} onChange={(e) => updateContact('whatsapp', e.target.value)} placeholder="+229 …" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-hours">Horaires</label>
              <input id="c-hours" type="text" className="form-input" value={contactStr(site.contact.hours)} onChange={(e) => updateContact('hours', e.target.value)} placeholder="Lun–Ven 8h–17h" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="c-address">Adresse</label>
            <input id="c-address" type="text" className="form-input" value={contactStr(site.contact.address)} onChange={(e) => updateContact('address', e.target.value)} placeholder="Quartier, rue…" />
          </div>

          <hr className="divider" />
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>Réseaux sociaux</h3>

          <div className="settings-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="s-fb">Facebook</label>
              <input id="s-fb" type="url" className="form-input" value={contactStr(site.social.facebook)} onChange={(e) => updateSocial('facebook', e.target.value)} placeholder="https://facebook.com/apecdi" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-li">LinkedIn</label>
              <input id="s-li" type="url" className="form-input" value={contactStr(site.social.linkedin)} onChange={(e) => updateSocial('linkedin', e.target.value)} placeholder="https://linkedin.com/company/apecdi" />
            </div>
          </div>

          <div className="settings-save-row">
            <button className="btn btn-outline" onClick={handleSaveGeneral} disabled={saving}>
              <Icon name="download" size={16} /> Télécharger site.json
            </button>
            {modeBActive && (
              <button className="btn btn-primary" onClick={handleSaveModeB} disabled={saving}>
                <Icon name="github" size={16} /> Publier (Mode B)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── GitHub Mode B ── */}
      {tab === 'github' && (
        <div className="settings-panel">
          <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
            <Icon name="lock" size={16} />
            <div>
              <strong>Mode B — Sync GitHub directe</strong>
              <p style={{ margin: 0 }}>
                Le token est stocké uniquement dans ce navigateur. Il n'est jamais commité ni envoyé ailleurs qu'à api.github.com.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gh-repo">Dépôt GitHub</label>
            <input id="gh-repo" type="text" className="form-input" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="proprietaire/nom-du-repo" />
            <span className="form-hint">Format : owner/repo (ex: dupont/apecdi-site)</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gh-pat">Personal Access Token (fine-grained)</label>
            <input id="gh-pat" type="password" className="form-input" value={pat} onChange={(e) => setPat(e.target.value)} placeholder="github_pat_…" autoComplete="off" />
            <span className="form-hint">
              Permissions requises : <strong>Contents: Read and write</strong> (fin-grained token, limité à ce seul repo)
            </span>
          </div>

          {testResult && (
            <div className={`alert ${testResult.ok ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name={testResult.ok ? 'check' : 'x'} size={16} />
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="settings-save-row">
            <button className="btn btn-outline" onClick={handleTestGitHub} disabled={testing}>
              <Icon name="github" size={16} />
              {testing ? 'Test en cours…' : 'Tester la connexion'}
            </button>
            <button className="btn btn-primary" onClick={handleSaveGitHub}>
              <Icon name="check" size={16} /> Enregistrer
            </button>
            {getPAT() && (
              <button className="btn btn-ghost" onClick={handleClearPAT} style={{ color: 'var(--error)' }}>
                <Icon name="trash" size={16} /> Supprimer le token
              </button>
            )}
          </div>

          <div className="settings-github-help">
            <h3>Comment créer un fine-grained PAT ?</h3>
            <ol>
              <li>Aller sur <strong>GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</strong></li>
              <li>Cliquer <strong>Generate new token</strong></li>
              <li>Sélectionner le repo APECDI uniquement (<em>Only select repositories</em>)</li>
              <li>Dans <em>Permissions → Repository permissions</em> : <strong>Contents → Read and write</strong></li>
              <li>Copier le token et le coller ci-dessus</li>
            </ol>
            <p>En cas de compromission : révoquez immédiatement le token sur GitHub (Settings → Developer settings → Personal access tokens → Revoke).</p>
          </div>
        </div>
      )}

      {/* ── Sécurité ── */}
      {tab === 'security' && (
        <div className="settings-panel">
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
            <Icon name="lock" size={16} />
            <div>
              <strong>Note de sécurité</strong>
              <p style={{ margin: 0 }}>
                Cette authentification protège l'interface contre les visiteurs occasionnels. Le code source est public — un utilisateur déterminé peut contourner l'écran de connexion. Le seul secret réel est le PAT GitHub (Mode B).
              </p>
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-5)' }}>Changer le mot de passe</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="new-pwd">Nouveau mot de passe</label>
            <input id="new-pwd" type="password" className="form-input" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" minLength={8} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-pwd2">Confirmer le mot de passe</label>
            <input id="new-pwd2" type="password" className="form-input" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} autoComplete="new-password" minLength={8} />
            {newPwd && newPwd2 && newPwd !== newPwd2 && (
              <span className="form-error">Les mots de passe ne correspondent pas.</span>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleChangePassword}
            disabled={!newPwd || !newPwd2 || newPwd !== newPwd2}
          >
            <Icon name="lock" size={16} /> Changer le mot de passe
          </button>

          <p className="form-hint" style={{ marginTop: 'var(--space-4)' }}>
            Le nouveau hash est stocké dans localStorage de ce navigateur. Le mot de passe par défaut est <code>apecdi2024</code> — changez-le avant utilisation.
          </p>

          <hr className="divider" />

          <h3 style={{ marginBottom: 'var(--space-2)' }}>Code développeur (accès Paramètres)</h3>
          <p className="form-hint" style={{ marginBottom: 'var(--space-5)' }}>
            Ce code est distinct du mot de passe admin. Il protège l'accès à cette page de paramètres.
            Seul le développeur doit le connaître. Code par défaut : <code>devapecdi2024</code>.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="new-dev-code">Nouveau code développeur</label>
            <input id="new-dev-code" type="password" className="form-input" value={newDevCode} onChange={(e) => setNewDevCode(e.target.value)} autoComplete="new-password" minLength={8} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-dev-code2">Confirmer le code</label>
            <input id="new-dev-code2" type="password" className="form-input" value={newDevCode2} onChange={(e) => setNewDevCode2(e.target.value)} autoComplete="new-password" minLength={8} />
            {newDevCode && newDevCode2 && newDevCode !== newDevCode2 && (
              <span className="form-error">Les codes ne correspondent pas.</span>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleChangeDevCode}
            disabled={!newDevCode || !newDevCode2 || newDevCode !== newDevCode2}
          >
            <Icon name="lock" size={16} /> Changer le code développeur
          </button>
        </div>
      )}

      <style>{settingsStyles}</style>
    </div>
  )
}

const settingsStyles = `
.admin-page { padding: var(--space-8) var(--space-6); max-width: 800px; }
.admin-page-header { margin-bottom: var(--space-6); }
.admin-page-header h1 { font-size: var(--text-2xl); }

.settings-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.settings-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  border-radius: 0;
  transition: color var(--transition-fast);
}

.settings-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.settings-tab:hover { color: var(--text); }

.settings-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}

.settings-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
@media (min-width: 640px) { .settings-grid-2 { grid-template-columns: repeat(2, 1fr); gap: var(--space-4); } }

.settings-save-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
  margin-top: var(--space-4);
}

.settings-github-help {
  margin-top: var(--space-8);
  padding: var(--space-6);
  background: var(--surface-alt);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
}

.settings-github-help h3 {
  font-size: var(--text-base);
  margin-bottom: var(--space-4);
}

.settings-github-help ol {
  list-style: decimal;
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.settings-github-help li { font-size: var(--text-sm); color: var(--text-secondary); }

.settings-github-help p {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.settings-github-help code {
  background: var(--surface);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
}
`
