import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { drafts as draftStore, images as imageStore, resetAllDrafts } from '../services/admin-store'
import { exportAllPublicationsZip } from '../services/export-mode-a'
import { getPublications, getRealisations } from '../services/content'
import { getPAT, getLastCommit } from '../services/github-sync'
import Icon from '../components/Icon'
import ImportPanel from './ImportPanel'
import type { Publication, Realisation } from '../types'
import type { Draft } from '../services/admin-store'
import { formatFileSize } from '../services/media'

interface DashboardProps {
  section?: 'publications' | 'realisations'
}

const STORAGE_WARNING = 50 * 1024 * 1024 // 50 MB

export default function Dashboard({ section }: DashboardProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [storageSize, setStorageSize] = useState(0)
  const [lastCommit, setLastCommit] = useState<string | null>(null)
  const [modeBEnabled, setModeBEnabled] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
    setModeBEnabled(!!getPAT())
    getLastCommit().then(setLastCommit)
  }, [])

  async function loadData() {
    const [d, p, r, sz] = await Promise.all([
      draftStore.list(),
      getPublications(),
      getRealisations(),
      imageStore.getTotalSize(),
    ])
    setDrafts(d)
    setPublications(p)
    setRealisations(r)
    setStorageSize(sz)
  }

  async function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return }
    await resetAllDrafts()
    setResetConfirm(false)
    await loadData()
    setExportMsg('Brouillons réinitialisés.')
  }

  async function handleExportAll() {
    setExporting(true)
    setExportMsg('')
    try {
      // Fusionner les brouillons publiés avec les publications existantes
      const draftPubs = drafts
        .filter((d) => d.type === 'publication')
        .map((d) => d.data as unknown as Publication)
        .filter((p) => p.status === 'published')
      const allPubs = [...publications, ...draftPubs.filter((dp) => !publications.find((p) => p.id === dp.id))]
      await exportAllPublicationsZip(allPubs)
      setExportMsg('Fichiers exportés. Déposez-les dans votre repo git.')
    } catch (err) {
      setExportMsg(`Erreur: ${(err as Error).message}`)
    }
    setExporting(false)
  }

  const activeSection = section || 'dashboard'

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>
          {activeSection === 'dashboard' && 'Tableau de bord'}
          {activeSection === 'publications' && 'Publications'}
          {activeSection === 'realisations' && 'Réalisations'}
        </h1>
        <div className="admin-header-actions">
          {activeSection === 'publications' && (
            <Link to="/admin/publications/new" className="btn btn-primary btn-sm">
              <Icon name="plus" size={16} />
              Nouvelle publication
            </Link>
          )}
          {activeSection === 'realisations' && (
            <Link to="/admin/realisations/new" className="btn btn-primary btn-sm">
              <Icon name="plus" size={16} />
              Nouvelle réalisation
            </Link>
          )}
        </div>
      </div>

      {/* Avertissements */}
      {storageSize > STORAGE_WARNING && (
        <div className="alert alert-warning" style={{ margin: 'var(--space-4) var(--space-6)' }}>
          <Icon name="clock" size={18} />
          <span>
            IndexedDB occupe {formatFileSize(storageSize)}. Pensez à exporter et vider les brouillons régulièrement.
          </span>
        </div>
      )}

      {/* Stats */}
      {activeSection === 'dashboard' && (
        <div className="admin-stats-grid">
          <div className="admin-stat">
            <div className="admin-stat-value">{publications.length}</div>
            <div className="admin-stat-label">Publications publiées</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">{drafts.length}</div>
            <div className="admin-stat-label">Brouillons locaux</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">{realisations.length}</div>
            <div className="admin-stat-label">Réalisations</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-value">{formatFileSize(storageSize)}</div>
            <div className="admin-stat-label">Stockage local</div>
          </div>
        </div>
      )}

      {/* État GitHub */}
      {activeSection === 'dashboard' && (
        <div className="admin-section">
          <h2>Déploiement</h2>
          <div className="admin-deploy-status">
            <div className={`deploy-mode-indicator ${modeBEnabled ? 'mode-b' : 'mode-a'}`}>
              <Icon name={modeBEnabled ? 'github' : 'download'} size={20} />
              <div>
                <strong>{modeBEnabled ? 'Mode B — Sync GitHub' : 'Mode A — Export manuel'}</strong>
                <p>{modeBEnabled ? (lastCommit ? `Dernier commit : ${lastCommit}` : 'Token configuré') : 'Exporter les fichiers, puis git push'}</p>
              </div>
            </div>
            <Link to="/admin/settings" className="btn btn-ghost btn-sm">
              <Icon name="settings" size={16} /> Configurer
            </Link>
          </div>
        </div>
      )}

      {/* Actions */}
      {activeSection === 'dashboard' && (
        <div className="admin-section">
          <h2>Actions</h2>
          {exportMsg && (
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name="check" size={16} />
              <span>{exportMsg}</span>
            </div>
          )}
          <div className="admin-actions-row">
            <button className="btn btn-outline btn-sm" onClick={handleExportAll} disabled={exporting}>
              <Icon name="download" size={16} />
              {exporting ? 'Export en cours…' : 'Exporter tout (Mode A)'}
            </button>
            <button
              className={`btn btn-sm ${resetConfirm ? 'btn-primary' : 'btn-ghost'}`}
              onClick={handleReset}
            >
              <Icon name="trash" size={16} />
              {resetConfirm ? 'Confirmer la réinitialisation' : 'Réinitialiser les brouillons'}
            </button>
            {resetConfirm && (
              <button className="btn btn-ghost btn-sm" onClick={() => setResetConfirm(false)}>
                Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {/* Publications */}
      {(activeSection === 'dashboard' || activeSection === 'publications') && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Publications</h2>
            <Link to="/admin/publications/new" className="btn btn-primary btn-sm">
              <Icon name="plus" size={16} /> Nouvelle
            </Link>
          </div>

          {/* Brouillons locaux */}
          {drafts.filter((d) => d.type === 'publication').length > 0 && (
            <div className="admin-drafts-section">
              <h3 className="admin-sub-title">Brouillons locaux</h3>
              {drafts.filter((d) => d.type === 'publication').map((draft) => {
                const pub = draft.data as unknown as Publication
                return (
                  <div key={draft.id} className="admin-list-item">
                    <div>
                      <span className="badge badge-accent">Brouillon</span>
                      <strong style={{ marginLeft: 'var(--space-2)' }}>{pub.title || '(sans titre)'}</strong>
                      <span className="admin-item-meta">Enregistré le {new Date(draft.savedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="admin-item-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/publications/${draft.id}`)}>
                        <Icon name="edit" size={15} /> Modifier
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Publications publiées */}
          {publications.length === 0 && drafts.filter((d) => d.type === 'publication').length === 0 && (
            <p className="admin-empty">Aucune publication. Créez la première.</p>
          )}

          {publications.map((pub) => (
            <div key={pub.id} className="admin-list-item">
              <div>
                <span className="badge badge-secondary">Publié</span>
                <strong style={{ marginLeft: 'var(--space-2)' }}>{pub.title}</strong>
                <span className="admin-item-meta">{pub.category} — {formatDate(pub.published_at)}</span>
              </div>
              <div className="admin-item-actions">
                <a href={`/publications/${pub.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <Icon name="eye" size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Réalisations */}
      {(activeSection === 'dashboard' || activeSection === 'realisations') && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Réalisations</h2>
            <Link to="/admin/realisations/new" className="btn btn-primary btn-sm">
              <Icon name="plus" size={16} /> Nouvelle
            </Link>
          </div>
          {realisations.length === 0 ? (
            <p className="admin-empty">Aucune réalisation.</p>
          ) : (
            realisations.map((r) => (
              <div key={r.id} className="admin-list-item">
                <div>
                  <span className={`badge ${r.status === 'completed' ? 'badge-secondary' : 'badge-accent'}`}>
                    {r.status === 'completed' ? 'Réalisé' : r.status}
                  </span>
                  <strong style={{ marginLeft: 'var(--space-2)' }}>{r.title}</strong>
                  <span className="admin-item-meta">{r.location}</span>
                </div>
                <div className="admin-item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/realisations/${r.id}`)}>
                    <Icon name="edit" size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Import / Reset */}
      {activeSection === 'dashboard' && (
        <ImportPanel onImported={loadData} />
      )}

      <style>{dashboardStyles}</style>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso))
  } catch { return iso }
}

const dashboardStyles = `
.admin-page { padding: var(--space-8) var(--space-6); max-width: 960px; }
.admin-page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-8);
}
.admin-page-header h1 { font-size: var(--text-2xl); }
.admin-header-actions { display: flex; gap: var(--space-3); }

.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
@media (min-width: 640px) { .admin-stats-grid { grid-template-columns: repeat(4, 1fr); } }

.admin-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  text-align: center;
}
.admin-stat-value { font-size: var(--text-2xl); font-weight: 800; color: var(--primary); }
.admin-stat-label { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); }

.admin-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-5);
}

.admin-section h2 { font-size: var(--text-lg); margin-bottom: var(--space-5); }

.admin-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-5);
}
.admin-section-header h2 { margin-bottom: 0; }

.admin-sub-title { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-3); }
.admin-drafts-section { margin-bottom: var(--space-5); padding-bottom: var(--space-5); border-bottom: 1px solid var(--border); }

.admin-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: var(--space-2);
  background: var(--surface-alt);
}

.admin-list-item > div:first-child { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.admin-item-meta { font-size: var(--text-xs); color: var(--text-muted); margin-left: var(--space-2); }
.admin-item-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }

.admin-empty { color: var(--text-muted); font-size: var(--text-sm); text-align: center; padding: var(--space-6) 0; }

.admin-deploy-status {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);
}

.deploy-mode-indicator {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
}
.deploy-mode-indicator.mode-b { border-color: var(--secondary); background: var(--secondary-subtle); }
.deploy-mode-indicator.mode-a { border-color: var(--accent); background: var(--accent-subtle); }
.deploy-mode-indicator strong { display: block; font-size: var(--text-sm); }
.deploy-mode-indicator p { font-size: var(--text-xs); color: var(--text-muted); margin: 0; }

.admin-actions-row { display: flex; flex-wrap: wrap; gap: var(--space-3); }
`
