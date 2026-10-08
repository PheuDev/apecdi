import { useEffect, useState, useRef, useCallback } from 'react'
import { images as imageStore } from '../services/admin-store'
import { processImage, blobToDataURL, formatFileSize, generateId } from '../services/media'
import type { StoredImage } from '../services/admin-store'
import Icon from '../components/Icon'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 Mo
const STORAGE_WARNING = 50 * 1024 * 1024

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<StoredImage[]>([])
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [totalSize, setTotalSize] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const list = await imageStore.list()
    list.sort((a, b) => b.savedAt - a.savedAt)
    setMediaList(list)
    const size = list.reduce((s, i) => s + i.size, 0)
    setTotalSize(size)
    // Générer les previews
    const newPreviews: Record<string, string> = {}
    for (const img of list) {
      if (!previews[img.id]) {
        newPreviews[img.id] = await blobToDataURL(img.blob)
      }
    }
    setPreviews((prev) => ({ ...prev, ...newPreviews }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  const processFiles = async (files: File[]) => {
    setUploading(true)
    setMsg(null)
    let uploaded = 0
    let errors = 0
    const warnings: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        warnings.push(`${file.name} (${formatFileSize(file.size)}) dépasse 15 Mo — ignoré.`)
        errors++
        continue
      }
      if (!file.type.startsWith('image/')) {
        warnings.push(`${file.name} n'est pas une image — ignoré.`)
        errors++
        continue
      }
      try {
        const processed = await processImage(file)
        const id = generateId()
        await imageStore.save({
          id,
          name: processed.name,
          blob: processed.blob,
          mimeType: processed.mimeType,
          size: processed.size,
          width: processed.width,
          height: processed.height,
          savedAt: Date.now(),
        })
        uploaded++
      } catch (err) {
        warnings.push(`${file.name} : ${(err as Error).message}`)
        errors++
      }
    }

    await load()
    setUploading(false)

    if (warnings.length > 0) {
      setMsg({ type: 'warning', text: warnings.join(' | ') })
    } else if (uploaded > 0) {
      setMsg({ type: 'success', text: `${uploaded} image(s) ajoutée(s). Compressée(s) en WebP.` })
    }

    if (totalSize > STORAGE_WARNING) {
      setMsg({ type: 'warning', text: `Attention : ${formatFileSize(totalSize)} utilisés dans IndexedDB. Pensez à exporter et nettoyer.` })
    }
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) processFiles(files)
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    await imageStore.delete(id)
    setConfirmDelete(null)
    setPreviews((prev) => { const n = { ...prev }; delete n[id]; return n })
    await load()
    setMsg({ type: 'success', text: 'Image supprimée.' })
  }

  const handleCopyPath = (img: StoredImage) => {
    const path = `/uploads/${img.name}`
    navigator.clipboard.writeText(path).then(() => {
      setMsg({ type: 'success', text: `Chemin copié : ${path}` })
    })
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Médiathèque</h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {mediaList.length} image(s) — {formatFileSize(totalSize)}
        </span>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={msg.type === 'success' ? 'check' : msg.type === 'error' ? 'x' : 'clock'} size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      {totalSize > STORAGE_WARNING && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="clock" size={16} />
          <span>IndexedDB occupe {formatFileSize(totalSize)}. Pensez à exporter vos contenus et à réinitialiser.</span>
        </div>
      )}

      {/* Zone d'upload */}
      <div
        className={`media-dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Déposer des images ici ou cliquer pour sélectionner"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="spinner" />
            <span>Traitement en cours…</span>
          </div>
        ) : (
          <>
            <Icon name="upload" size={36} />
            <p><strong>Déposez vos images ici</strong> ou cliquez pour sélectionner</p>
            <p style={{ fontSize: 'var(--text-xs)' }}>
              JPG, PNG, WebP — max 15 Mo — Compressées automatiquement en WebP
            </p>
          </>
        )}
      </div>

      {/* Galerie */}
      {mediaList.length === 0 ? (
        <p className="admin-empty">Aucune image. Uploadez la première.</p>
      ) : (
        <div className="media-grid">
          {mediaList.map((img) => (
            <div key={img.id} className="media-card">
              <div className="media-thumb">
                {previews[img.id]
                  ? <img src={previews[img.id]} alt={img.name} loading="lazy" />
                  : <div className="media-thumb-loading"><div className="spinner" style={{ width: 24, height: 24 }} /></div>
                }
              </div>
              <div className="media-info">
                <p className="media-name" title={img.name}>{img.name}</p>
                <p className="media-meta">{img.width}×{img.height} · {formatFileSize(img.size)}</p>
              </div>
              <div className="media-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopyPath(img)}
                  title="Copier le chemin"
                >
                  <Icon name="clipboard" size={14} />
                </button>
                <button
                  className={`btn btn-sm ${confirmDelete === img.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleDelete(img.id)}
                  title={confirmDelete === img.id ? 'Confirmer la suppression' : 'Supprimer'}
                  style={{ color: confirmDelete === img.id ? undefined : 'var(--error)' }}
                >
                  <Icon name="trash" size={14} />
                  {confirmDelete === img.id ? 'Confirmer' : ''}
                </button>
                {confirmDelete === img.id && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{mediaStyles}</style>
    </div>
  )
}

const mediaStyles = `
.admin-page { padding: var(--space-8) var(--space-6); max-width: 960px; }
.admin-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
.admin-page-header h1 { font-size: var(--text-2xl); }
.admin-empty { color: var(--text-muted); font-size: var(--text-sm); text-align: center; padding: var(--space-8) 0; }

.media-dropzone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-12) var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-muted);
  margin-bottom: var(--space-8);
  background: var(--surface);
}

.media-dropzone:hover,
.media-dropzone.drag-over {
  border-color: var(--primary);
  background: var(--primary-subtle);
  color: var(--primary);
}

.media-dropzone p { margin: 0; font-size: var(--text-sm); }

.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}
@media (min-width: 480px) { .media-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px) { .media-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .media-grid { grid-template-columns: repeat(5, 1fr); } }

.media-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}
.media-card:hover { box-shadow: var(--shadow-md); }

.media-thumb {
  height: 120px;
  overflow: hidden;
  background: var(--surface-alt);
}
.media-thumb img { width: 100%; height: 100%; object-fit: cover; }
.media-thumb-loading { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.media-info { padding: var(--space-2) var(--space-3); }
.media-name { font-size: var(--text-xs); font-weight: var(--font-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.media-meta { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }

.media-actions {
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--border);
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}
`
