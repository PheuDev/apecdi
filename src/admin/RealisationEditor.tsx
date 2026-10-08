import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { drafts as draftStore, images as imageStore } from '../services/admin-store'
import { processImage, generateId, blobToDataURL } from '../services/media'
import { exportRealisationZip } from '../services/export-mode-a'
import { pushFile, pushImage, getPAT, getRepo } from '../services/github-sync'
import Icon from '../components/Icon'
import type { Realisation } from '../types'

const DOMAINS = [
  { value: 'environnement', label: 'Environnement' },
  { value: 'foresterie', label: 'Foresterie & Ressources naturelles' },
  { value: 'agriculture', label: 'Agriculture & Développement rural' },
  { value: 'etudes-donnees', label: 'Études, Données & Terrain' },
  { value: 'developpement-communautaire', label: 'Développement communautaire' },
]

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

const EMPTY_REAL: Realisation = {
  id: '',
  title: '',
  domain: 'environnement',
  year: null,
  location: '',
  summary: '',
  description: '',
  image: null,
  gallery: [],
  partners: [],
  status: 'completed',
  featured: false,
  client: { status: 'to_validate' },
}

export default function RealisationEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [real, setReal] = useState<Realisation>({ ...EMPTY_REAL, id: generateId() })
  const [partnerInput, setPartnerInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isNew && id) {
      draftStore.read(id).then((draft) => {
        if (draft) {
          const r = draft.data as unknown as Realisation
          setReal(r)
          if (r.image?.startsWith('local:')) {
            imageStore.get(r.image.replace('local:', '')).then(async (img) => {
              if (img) setImgPreview(await blobToDataURL(img.blob))
            })
          } else if (r.image) {
            setImgPreview(r.image)
          }
        }
      })
    }
  }, [id, isNew])

  const update = (field: keyof Realisation, value: unknown) =>
    setReal((prev) => ({ ...prev, [field]: value }))

  const handleTitleChange = (title: string) => {
    update('title', title)
    if (isNew) update('id', slugify(title) || real.id)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const processed = await processImage(file)
      const imgId = generateId()
      await imageStore.save({ id: imgId, name: processed.name, blob: processed.blob, mimeType: processed.mimeType, size: processed.size, width: processed.width, height: processed.height, savedAt: Date.now() })
      setImgPreview(await blobToDataURL(processed.blob))
      update('image', `local:${imgId}`)
      setMsg({ type: 'success', text: `Image traitée : ${(processed.size / 1024).toFixed(0)} Ko` })
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    e.target.value = ''
  }

  const addPartner = () => {
    const p = partnerInput.trim()
    if (p && !real.partners.includes(p)) update('partners', [...real.partners, p])
    setPartnerInput('')
  }

  const saveDraft = async () => {
    setSaving(true)
    await draftStore.update({ id: real.id, type: 'realisation', data: real as unknown, savedAt: Date.now() })
    setSaving(false)
    setMsg({ type: 'success', text: 'Brouillon enregistré.' })
  }

  const handleExportModeA = async () => {
    setPublishing(true)
    try {
      await exportRealisationZip(real)
      setMsg({ type: 'success', text: 'Exporté. Intégrez le contenu dans realisations.json, puis git push.' })
    } catch (err) {
      setMsg({ type: 'error', text: (err as Error).message })
    }
    setPublishing(false)
  }

  const handlePublishModeB = async () => {
    if (!getPAT() || !getRepo()) {
      setMsg({ type: 'error', text: 'Mode B non configuré. Allez dans Paramètres.' })
      return
    }
    setPublishing(true)
    try {
      // Pour les réalisations, on lit le fichier existant et on le met à jour
      let finalImage = real.image
      if (real.image?.startsWith('local:')) {
        const stored = await imageStore.get(real.image.replace('local:', ''))
        if (stored) {
          const imgPath = `public/uploads/realisations/${stored.name}`
          await pushImage(imgPath, stored.blob, `feat: add realisation image ${stored.name}`)
          finalImage = `/${imgPath}`
        }
      }
      const updated = { ...real, image: finalImage }
      await pushFile(
        `public/content/realisations-draft-${real.id}.json`,
        JSON.stringify(updated, null, 2),
        `feat: update realisation "${real.title}"`
      )
      setMsg({ type: 'success', text: 'Envoyé sur GitHub. Fusionnez le fragment dans realisations.json.' })
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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
          <h1 style={{ marginTop: 'var(--space-2)' }}>
            {isNew ? 'Nouvelle réalisation' : 'Modifier la réalisation'}
          </h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={saveDraft} disabled={saving}>
            <Icon name="download" size={15} />
            {saving ? 'Enregistrement…' : 'Brouillon'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExportModeA} disabled={publishing}>
            <Icon name="download" size={15} /> Exporter (A)
          </button>
          {modeBAvailable && (
            <button className="btn btn-primary btn-sm" onClick={handlePublishModeB} disabled={publishing}>
              <Icon name="github" size={15} />
              {publishing ? 'Envoi…' : 'Envoyer (B)'}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={msg.type === 'success' ? 'check' : 'x'} size={16} />
          <span>{msg.text}</span>
        </div>
      )}

      <div className="editor-layout">
        <div className="editor-main">
          {/* Titre */}
          <div className="form-group">
            <label className="form-label" htmlFor="real-title">Titre <span className="required">*</span></label>
            <input id="real-title" type="text" className="form-input" value={real.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titre de la réalisation" />
          </div>

          {/* Domaine */}
          <div className="form-group">
            <label className="form-label" htmlFor="real-domain">Domaine</label>
            <select id="real-domain" className="form-select" value={real.domain} onChange={(e) => update('domain', e.target.value)}>
              {DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          {/* Localisation + Année */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="real-location">Localisation</label>
              <input id="real-location" type="text" className="form-input" value={real.location} onChange={(e) => update('location', e.target.value)} placeholder="Ville, Région, Bénin" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="real-year">Année</label>
              <input id="real-year" type="number" className="form-input" value={real.year ?? ''} onChange={(e) => update('year', e.target.value ? parseInt(e.target.value) : null)} placeholder="2024" style={{ width: 100 }} min={1990} max={2099} />
            </div>
          </div>

          {/* Résumé */}
          <div className="form-group">
            <label className="form-label" htmlFor="real-summary">Résumé</label>
            <textarea id="real-summary" className="form-textarea" rows={3} value={real.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Résumé court…" />
          </div>

          {/* Description complète */}
          <div className="form-group">
            <label className="form-label" htmlFor="real-desc">Description complète</label>
            <textarea id="real-desc" className="form-textarea" rows={8} value={real.description} onChange={(e) => update('description', e.target.value)} placeholder="Description détaillée de la réalisation…" />
          </div>

          {/* Partenaires */}
          <div className="form-group">
            <label className="form-label">Partenaires</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input type="text" className="form-input" value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPartner() } }} placeholder="Nom du partenaire" />
              <button type="button" className="btn btn-outline btn-sm" onClick={addPartner}><Icon name="plus" size={14} /></button>
            </div>
            {real.partners.length > 0 && (
              <div className="tags-list">
                {real.partners.map((p) => (
                  <span key={p} className="tag-item">
                    {p}
                    <button type="button" onClick={() => update('partners', real.partners.filter((x) => x !== p))} aria-label={`Retirer ${p}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          <div className="editor-card">
            <h3>Paramètres</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="real-status">Statut</label>
              <select id="real-status" className="form-select" value={real.status} onChange={(e) => update('status', e.target.value)}>
                <option value="completed">Réalisé</option>
                <option value="ongoing">En cours</option>
                <option value="planned">Planifié</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <input type="checkbox" checked={real.featured} onChange={(e) => update('featured', e.target.checked)} style={{ marginRight: 'var(--space-2)' }} />
                Mise en avant (accueil)
              </label>
            </div>
          </div>

          {/* Image */}
          <div className="editor-card">
            <h3>Image principale</h3>
            {imgPreview && (
              <div className="cover-preview">
                <img src={imgPreview} alt="Aperçu" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setImgPreview(null); update('image', null) }}>
                  <Icon name="trash" size={14} /> Supprimer
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="upload" size={15} /> {imgPreview ? 'Changer' : 'Uploader'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .admin-page { padding: var(--space-8) var(--space-6); max-width: 960px; }
        .admin-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-8); gap: var(--space-4); }
        .admin-page-header h1 { font-size: var(--text-2xl); }
        .admin-header-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
        .editor-layout { display: grid; grid-template-columns: 1fr; gap: var(--space-5); }
        @media (min-width: 1024px) { .editor-layout { grid-template-columns: 1fr 280px; } }
        .editor-main { display: flex; flex-direction: column; gap: var(--space-1); }
        .editor-sidebar { display: flex; flex-direction: column; gap: var(--space-4); }
        .editor-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: var(--space-5); }
        .editor-card h3 { font-size: var(--text-sm); font-weight: var(--font-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: var(--space-4); }
        .cover-preview { margin-bottom: var(--space-3); border-radius: var(--radius-md); overflow: hidden; }
        .cover-preview img { width: 100%; height: 120px; object-fit: cover; }
        .cover-preview .btn { margin-top: var(--space-2); }
      `}</style>
    </div>
  )
}
