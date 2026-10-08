import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { drafts as draftStore, images as imageStore } from '../services/admin-store'
import { processImage, generateId, blobToDataURL } from '../services/media'
import { exportPublicationZip } from '../services/export-mode-a'
import { pushFile, pushImage, getPAT, getRepo } from '../services/github-sync'
import Icon from '../components/Icon'
import type { Publication } from '../types'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const EMPTY_PUB: Publication = {
  id: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: '',
  author: 'APECDI',
  cover_image: null,
  gallery: [],
  tags: [],
  status: 'draft',
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  featured: false,
}

export default function PublicationEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [pub, setPub] = useState<Publication>({ ...EMPTY_PUB, id: generateId() })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [slugManual, setSlugManual] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isNew && id) {
      draftStore.read(id).then((draft) => {
        if (draft) {
          setPub(draft.data as unknown as Publication)
          const d = draft.data as unknown as Publication
          if (d.cover_image?.startsWith('local:')) {
            imageStore.get(d.cover_image.replace('local:', '')).then(async (img) => {
              if (img) setCoverPreview(await blobToDataURL(img.blob))
            })
          } else if (d.cover_image) {
            setCoverPreview(d.cover_image)
          }
        }
      })
    }
  }, [id, isNew])

  const update = (field: keyof Publication, value: unknown) => {
    setPub((prev) => ({ ...prev, [field]: value }))
  }

  const handleTitleChange = (title: string) => {
    update('title', title)
    if (!slugManual) update('slug', generateSlug(title))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const processed = await processImage(file)
      const imgId = generateId()
      await imageStore.save({
        id: imgId,
        name: processed.name,
        blob: processed.blob,
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        savedAt: Date.now(),
      })
      const preview = await blobToDataURL(processed.blob)
      setCoverPreview(preview)
      update('cover_image', `local:${imgId}`)
      setMsg({ type: 'success', text: `Image compressée : ${(processed.size / 1024).toFixed(0)} Ko` })
    } catch (err) {
      setMsg({ type: 'error', text: `Erreur image : ${(err as Error).message}` })
    }
    e.target.value = ''
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !pub.tags.includes(t)) {
      update('tags', [...pub.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    update('tags', pub.tags.filter((t) => t !== tag))
  }

  const saveDraft = async () => {
    setSaving(true)
    await draftStore.update({
      id: pub.id,
      type: 'publication',
      data: { ...pub, updated_at: new Date().toISOString() } as unknown,
      savedAt: Date.now(),
    })
    setSaving(false)
    setMsg({ type: 'success', text: 'Brouillon enregistré.' })
  }

  const handleExportModeA = async () => {
    setPublishing(true)
    try {
      const finalPub = { ...pub, status: 'published' as const, updated_at: new Date().toISOString() }
      await exportPublicationZip(finalPub)
      setMsg({ type: 'success', text: 'Fichiers exportés. Déposez-les dans le repo, puis git push.' })
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    setPublishing(false)
  }

  const handlePublishModeB = async () => {
    if (!getPAT() || !getRepo()) {
      setMsg({ type: 'error', text: 'Mode B non configuré. Allez dans Paramètres pour configurer le token GitHub.' })
      return
    }
    setPublishing(true)
    setMsg(null)
    try {
      const finalPub = { ...pub, status: 'published' as const, updated_at: new Date().toISOString() }

      // Uploader l'image si locale
      if (finalPub.cover_image?.startsWith('local:')) {
        const imgId = finalPub.cover_image.replace('local:', '')
        const stored = await imageStore.get(imgId)
        if (stored) {
          const imgPath = `public/uploads/publications/${stored.name}`
          await pushImage(imgPath, stored.blob, `feat: add image ${stored.name}`)
          finalPub.cover_image = `/${imgPath}`
        }
      }

      // Push du JSON
      await pushFile(
        `public/content/publications/${finalPub.slug}.json`,
        JSON.stringify(finalPub, null, 2),
        `feat: publish "${finalPub.title}"`
      )
      setMsg({ type: 'success', text: 'Publication envoyée sur GitHub. Render va redéployer automatiquement.' })
      setPub(finalPub)
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    setPublishing(false)
  }

  const modeBAvailable = !!getPAT() && !!getRepo()

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/dashboard')}>
            ← Retour
          </button>
          <h1 style={{ marginTop: 'var(--space-2)' }}>
            {isNew ? 'Nouvelle publication' : 'Modifier la publication'}
          </h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={saveDraft} disabled={saving}>
            <Icon name="download" size={15} />
            {saving ? 'Enregistrement…' : 'Brouillon'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExportModeA} disabled={publishing}>
            <Icon name="download" size={15} />
            Exporter (A)
          </button>
          {modeBAvailable && (
            <button className="btn btn-primary btn-sm" onClick={handlePublishModeB} disabled={publishing}>
              <Icon name="github" size={15} />
              {publishing ? 'Publication…' : 'Publier (B)'}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ margin: '0 0 var(--space-5)' }}>
          <Icon name={msg.type === 'success' ? 'check' : 'x'} size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      <div className="editor-layout">
        <div className="editor-main">
          {/* Titre */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-title">Titre <span className="required">*</span></label>
            <input id="pub-title" type="text" className="form-input" value={pub.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titre de la publication" />
          </div>

          {/* Slug */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-slug">
              Slug (URL)
              <span className="form-hint" style={{ marginLeft: 'var(--space-2)', fontWeight: 400 }}>
                /publications/{pub.slug || 'mon-slug'}
              </span>
            </label>
            <input
              id="pub-slug"
              type="text"
              className="form-input"
              value={pub.slug}
              onChange={(e) => { setSlugManual(true); update('slug', e.target.value.replace(/[^a-z0-9-]/g, '-')) }}
              placeholder="mon-slug"
            />
          </div>

          {/* Catégorie */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-category">Catégorie</label>
            <input id="pub-category" type="text" className="form-input" value={pub.category} onChange={(e) => update('category', e.target.value)} list="pub-categories" placeholder="Foresterie, Environnement…" />
            <datalist id="pub-categories">
              <option value="Foresterie" />
              <option value="Environnement" />
              <option value="Agriculture" />
              <option value="Études & Données" />
              <option value="Développement communautaire" />
              <option value="Actualité" />
            </datalist>
          </div>

          {/* Résumé */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-summary">Résumé</label>
            <textarea id="pub-summary" className="form-textarea" rows={3} value={pub.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Résumé bref affiché dans la liste des publications…" />
          </div>

          {/* Contenu Markdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-content">
              Contenu (Markdown)
              <span className="form-hint" style={{ marginLeft: 'var(--space-2)', fontWeight: 400 }}>## Titre, **gras**, *italique*, - liste</span>
            </label>
            <textarea
              id="pub-content"
              className="form-textarea"
              rows={16}
              value={pub.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="## Introduction&#10;&#10;Votre contenu en Markdown…"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Ajouter un tag et appuyer sur Entrée"
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>
                <Icon name="plus" size={14} />
              </button>
            </div>
            {pub.tags.length > 0 && (
              <div className="tags-list">
                {pub.tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Retirer ${tag}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar éditeur */}
        <div className="editor-sidebar">
          {/* Statut */}
          <div className="editor-card">
            <h3>Statut</h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={pub.featured}
                  onChange={(e) => update('featured', e.target.checked)}
                  style={{ marginRight: 'var(--space-2)' }}
                />
                Mise en avant (À la une)
              </label>
            </div>
            <div className="form-group" style={{ marginBottom: 0, marginTop: 'var(--space-3)' }}>
              <label className="form-label" htmlFor="pub-date">Date de publication</label>
              <input
                id="pub-date"
                type="datetime-local"
                className="form-input"
                value={pub.published_at.slice(0, 16)}
                onChange={(e) => update('published_at', new Date(e.target.value).toISOString())}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, marginTop: 'var(--space-3)' }}>
              <label className="form-label" htmlFor="pub-author">Auteur</label>
              <input id="pub-author" type="text" className="form-input" value={pub.author} onChange={(e) => update('author', e.target.value)} />
            </div>
          </div>

          {/* Image de couverture */}
          <div className="editor-card">
            <h3>Image de couverture</h3>
            {coverPreview && (
              <div className="cover-preview">
                <img src={coverPreview} alt="Aperçu" />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setCoverPreview(null); update('cover_image', null) }}
                >
                  <Icon name="trash" size={14} /> Supprimer
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverUpload}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="upload" size={15} />
              {coverPreview ? 'Changer l\'image' : 'Uploader une image'}
            </button>
            <p className="form-hint" style={{ marginTop: 'var(--space-2)' }}>
              Compressée automatiquement. WebP si supporté.
            </p>
          </div>

          {/* Aide Markdown */}
          <div className="editor-card editor-card-hint">
            <h3>Aide Markdown</h3>
            <pre style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{`## Titre
### Sous-titre
**gras** *italique*
- élément de liste
[lien](url)`}</pre>
          </div>
        </div>
      </div>

      <style>{editorStyles}</style>
    </div>
  )
}

const editorStyles = `
.editor-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}
@media (min-width: 1024px) { .editor-layout { grid-template-columns: 1fr 280px; } }

.editor-main { display: flex; flex-direction: column; gap: var(--space-1); }

.editor-sidebar { display: flex; flex-direction: column; gap: var(--space-4); }

.editor-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
}

.editor-card h3 {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.editor-card-hint { background: var(--surface-alt); }

.cover-preview {
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.cover-preview img { width: 100%; height: 120px; object-fit: cover; }
.cover-preview .btn { margin-top: var(--space-2); }
`
