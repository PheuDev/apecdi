/**
 * ImportPanel — Importation d'une sauvegarde (.zip ou .json)
 * Intégré dans le Dashboard (onglet ou section dédiée)
 */

import { useRef, useState } from 'react'
import { importFromZip, importSingleJSON } from '../services/import'
import { resetAllDrafts } from '../services/admin-store'
import Icon from '../components/Icon'

interface ImportPanelProps {
  onImported?: () => void
}

export default function ImportPanel({ onImported }: ImportPanelProps) {
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setLoading(true)
    setMsg(null)

    try {
      if (file.name.endsWith('.zip')) {
        const result = await importFromZip(file)
        const parts = []
        if (result.publications > 0) parts.push(`${result.publications} publication(s)`)
        if (result.images > 0) parts.push(`${result.images} image(s)`)
        const summary = parts.length ? parts.join(', ') + ' importée(s).' : 'Aucun contenu reconnu dans le .zip.'
        const type = result.errors.length > 0 ? 'warning' : 'success'
        const errText = result.errors.length ? ` Erreurs : ${result.errors.slice(0, 3).join(' | ')}` : ''
        setMsg({ type, text: summary + errText })
        onImported?.()
      } else if (file.name.endsWith('.json')) {
        const result = await importSingleJSON(file)
        setMsg({ type: result.ok ? 'success' : 'error', text: result.message })
        if (result.ok) onImported?.()
      } else {
        setMsg({ type: 'error', text: 'Format non supporté. Utilisez un fichier .zip ou .json.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!resetConfirm) { setResetConfirm(true); return }
    await resetAllDrafts()
    setResetConfirm(false)
    setMsg({ type: 'success', text: 'Tous les brouillons et images locaux ont été supprimés.' })
    onImported?.()
  }

  return (
    <div className="import-panel">
      <h2>Import / Réinitialisation</h2>

      {msg && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={msg.type === 'success' ? 'check' : msg.type === 'error' ? 'x' : 'clock'} size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Import */}
      <div className="import-section">
        <h3>Importer une sauvegarde</h3>
        <p>
          Importez un <strong>.zip</strong> issu d'un export précédent (Mode A) pour restaurer
          des publications et images en brouillons locaux.
          Accepte aussi un fichier <strong>.json</strong> unique.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,.json"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          className="btn btn-outline"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          {loading
            ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Import en cours…</>
            : <><Icon name="upload" size={16} /> Sélectionner un fichier (.zip ou .json)</>
          }
        </button>
      </div>

      <hr className="divider" />

      {/* Réinitialisation */}
      <div className="import-section">
        <h3>Réinitialiser les brouillons locaux</h3>
        <p>
          Efface tous les brouillons et images stockés dans IndexedDB.
          <strong> Cette action est irréversible pour les données non exportées.</strong>
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${resetConfirm ? 'btn-primary' : 'btn-ghost'}`}
            onClick={handleReset}
            style={!resetConfirm ? { color: 'var(--error)', borderColor: 'var(--error)' } : undefined}
          >
            <Icon name="trash" size={16} />
            {resetConfirm ? 'Confirmer la réinitialisation' : 'Réinitialiser'}
          </button>
          {resetConfirm && (
            <button className="btn btn-ghost btn-sm" onClick={() => setResetConfirm(false)}>
              Annuler
            </button>
          )}
        </div>
      </div>

      <style>{`
        .import-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .import-panel h2 { font-size: var(--text-lg); margin-bottom: var(--space-5); }
        .import-section { margin-bottom: var(--space-6); }
        .import-section h3 { font-size: var(--text-base); font-weight: var(--font-semibold); margin-bottom: var(--space-2); }
        .import-section p { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-4); }
      `}</style>
    </div>
  )
}
