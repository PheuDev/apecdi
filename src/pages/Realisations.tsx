import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getRealisations } from '../services/content'
import type { Realisation } from '../types'

const DOMAIN_LABELS: Record<string, string> = {
  foresterie: 'Foresterie',
  environnement: 'Environnement',
  agriculture: 'Agriculture',
  'etudes-donnees': 'Études & Données',
  'developpement-communautaire': 'Développement communautaire',
}

const DOMAIN_ICONS: Record<string, string> = {
  foresterie: 'tree',
  environnement: 'leaf',
  agriculture: 'sprout',
  'etudes-donnees': 'clipboard',
  'developpement-communautaire': 'users',
}

export default function Realisations() {
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRealisations().then((data) => {
      setRealisations(data)
      setLoading(false)
    })
  }, [])

  const domains = ['all', ...Array.from(new Set(realisations.map((r) => r.domain)))]
  const filtered = filter === 'all' ? realisations : realisations.filter((r) => r.domain === filter)

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title="Réalisations"
        description="Découvrez les réalisations d'APECDI : reboisement, plans d'aménagement forestier, études d'impact environnemental, structuration d'OPA au Bénin."
        canonical="https://apecdi.com/realisations"
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-separator">›</span>
            <span aria-current="page">Réalisations</span>
          </nav>
          <h1>Nos réalisations</h1>
          <p>Des interventions concrètes, documentées, au service des territoires béninois.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filtres */}
          <div className="real-filters" role="group" aria-label="Filtrer par domaine">
            {domains.map((d) => (
              <button
                key={d}
                className={`filter-btn ${filter === d ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter(d)}
                aria-pressed={filter === d}
              >
                {d === 'all' ? 'Tous les domaines' : (DOMAIN_LABELS[d] || d)}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-16) 0' }}>
              Aucune réalisation dans ce domaine.
            </p>
          )}

          <div className="real-list">
            {filtered.map((r) => (
              <article key={r.id} id={r.id} className="real-card" aria-labelledby={`real-title-${r.id}`}>
                <div className="real-card-img">
                  {r.image
                    ? <img src={r.image} alt={r.title} loading="lazy" width="480" height="260" />
                    : (
                      <div className="real-card-placeholder" aria-hidden="true">
                        <Icon name={DOMAIN_ICONS[r.domain] || 'layers'} size={48} />
                      </div>
                    )
                  }
                  <span className="real-domain-badge">
                    <Icon name={DOMAIN_ICONS[r.domain] || 'layers'} size={14} />
                    {DOMAIN_LABELS[r.domain] || r.domain}
                  </span>
                </div>
                <div className="real-card-body">
                  <div className="real-card-meta">
                    {r.location && (
                      <span className="real-meta-item">
                        <Icon name="mappin" size={14} />
                        {r.location}
                      </span>
                    )}
                    {r.year && (
                      <span className="real-meta-item">
                        <Icon name="calendar" size={14} />
                        {r.year}
                      </span>
                    )}
                    <span className={`real-status real-status-${r.status}`}>
                      {r.status === 'completed' ? 'Réalisé' : r.status === 'ongoing' ? 'En cours' : 'Planifié'}
                    </span>
                  </div>

                  <h2 id={`real-title-${r.id}`}>{r.title}</h2>
                  <p>{r.description}</p>

                  {r.partners.length > 0 && (
                    <div className="real-partners">
                      <span className="real-partners-label">Partenaires :</span>
                      {r.partners.join(', ')}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
            Vous avez un projet similaire ?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
            Contactez notre équipe pour discuter de votre besoin.
          </p>
          <Link to="/contact" className="btn btn-primary btn-lg">
            Prendre contact <Icon name="arrow_right" size={18} />
          </Link>
        </div>
      </section>

      <style>{realisationsStyles}</style>
    </>
  )
}

const realisationsStyles = `
/* Filtres */
.real-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-10);
}

.filter-btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  background: var(--surface);
  border: 1.5px solid var(--border);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.filter-btn:hover { border-color: var(--primary); color: var(--primary); }
.filter-btn-active { background: var(--primary); color: white; border-color: var(--primary); }

/* Liste réalisations */
.real-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.real-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  transition: box-shadow var(--transition-base);
}

.real-card:hover { box-shadow: var(--shadow-lg); }

@media (min-width: 768px) { .real-card { grid-template-columns: 320px 1fr; } }

.real-card-img {
  position: relative;
  min-height: 220px;
  overflow: hidden;
}

.real-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.real-card-placeholder {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-alt);
  color: var(--border-strong);
}

.real-domain-badge {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 12px;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  backdrop-filter: blur(4px);
}

.real-card-body {
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.real-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
}

.real-meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.real-status {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.real-status-completed { background: var(--secondary-subtle); color: var(--secondary-dark); }
.real-status-ongoing   { background: var(--accent-subtle); color: #7A5C00; }
.real-status-planned   { background: var(--surface-alt); color: var(--text-muted); }

.real-card-body h2 { font-size: var(--text-xl); line-height: var(--leading-snug); }
.real-card-body p  { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.real-partners {
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
.real-partners-label { font-weight: var(--font-semibold); color: var(--text); margin-right: var(--space-2); }
`
