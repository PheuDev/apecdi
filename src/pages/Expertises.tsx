import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getExpertises } from '../services/content'
import type { Expertise } from '../types'

export default function Expertises() {
  const [expertises, setExpertises] = useState<Expertise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExpertises().then((data) => {
      setExpertises(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title="Expertises"
        description="APECDI intervient dans 5 domaines : Environnement, Foresterie, Agriculture, Études & Données, Développement communautaire. Expertise béninoise au service du développement durable."
        canonical="https://apecdi.com/expertises"
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-separator">›</span>
            <span aria-current="page">Expertises</span>
          </nav>
          <h1>Nos domaines d'expertise</h1>
          <p>Cinq pôles complémentaires, une même exigence de qualité et de rigueur terrain.</p>
        </div>
      </section>

      {/* Navigation rapide */}
      <nav className="expertise-nav-bar" aria-label="Naviguer par domaine">
        <div className="container expertise-nav-inner">
          {expertises.map((exp) => (
            <a key={exp.id} href={`#${exp.id}`} className="expertise-nav-link">
              <Icon name={exp.icon} size={16} />
              {exp.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Détails de chaque expertise */}
      {expertises.map((exp, i) => (
        <section
          key={exp.id}
          id={exp.id}
          className={`section expertise-section ${i % 2 === 1 ? 'bg-alt' : ''}`}
          aria-labelledby={`exp-title-${exp.id}`}
        >
          <div className="container expertise-detail">
            <div className={`expertise-detail-layout ${i % 2 === 1 ? 'reverse' : ''}`}>
              <div className="expertise-detail-text">
                <div className={`expertise-big-icon expertise-icon-${exp.color}`}>
                  <Icon name={exp.icon} size={36} />
                </div>
                <span className="section-label">{`Domaine ${i + 1} / ${expertises.length}`}</span>
                <h2 id={`exp-title-${exp.id}`} className="section-title">{exp.title}</h2>
                <div className="divider-accent" />
                <p className="expertise-desc">{exp.description}</p>

                <div className="activities-block">
                  <h3>Nos activités dans ce domaine</h3>
                  <ul>
                    {exp.activities.map((act) => (
                      <li key={act}>
                        <Icon name="check" size={16} />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/contact" className="btn btn-outline" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-4)' }}>
                  Nous contacter sur ce domaine
                  <Icon name="arrow_right" size={16} />
                </Link>
              </div>

              <div className={`expertise-visual expertise-visual-${exp.color}`} aria-hidden="true">
                <div className="expertise-visual-inner">
                  <Icon name={exp.icon} size={80} />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA bas de page */}
      <section className="section expertise-cta">
        <div className="container expertise-cta-inner">
          <h2>Un projet dans l'un de ces domaines ?</h2>
          <p>Parlons-en. Nos équipes sont disponibles pour étudier votre besoin.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/realisations" className="btn btn-outline">
              Voir nos réalisations <Icon name="arrow_right" size={16} />
            </Link>
            <Link to="/contact" className="btn btn-primary">
              Nous contacter <Icon name="arrow_right" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <style>{expertisesStyles}</style>
    </>
  )
}

const expertisesStyles = `
/* ── Nav bar ── */
.expertise-nav-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: var(--nav-height);
  z-index: 10;
}

.expertise-nav-inner {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  gap: var(--space-1);
  padding: var(--space-3) 0;
}

.expertise-nav-inner::-webkit-scrollbar { display: none; }

.expertise-nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.expertise-nav-link:hover {
  background: var(--primary-subtle);
  color: var(--primary);
}

/* ── Detail layout ── */
.expertise-detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: center;
}

@media (min-width: 1024px) {
  .expertise-detail-layout { grid-template-columns: 1fr 400px; }
  .expertise-detail-layout.reverse { grid-template-columns: 400px 1fr; }
  .expertise-detail-layout.reverse .expertise-detail-text { order: 2; }
  .expertise-detail-layout.reverse .expertise-visual { order: 1; }
}

.expertise-detail-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.expertise-big-icon {
  width: 72px; height: 72px;
  border-radius: var(--radius-xl);
  display: flex; align-items: center; justify-content: center;
}

.expertise-desc {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  font-size: var(--text-lg);
}

.activities-block { background: var(--surface-alt); border-radius: var(--radius-xl); padding: var(--space-6); }
.activities-block h3 { font-size: var(--text-base); font-weight: var(--font-semibold); margin-bottom: var(--space-4); }
.activities-block ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.activities-block li { display: flex; align-items: flex-start; gap: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary); }
.activities-block li .icon { color: var(--secondary); flex-shrink: 0; margin-top: 1px; }

/* ── Visual placeholder ── */
.expertise-visual {
  border-radius: var(--radius-2xl);
  display: none;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

@media (min-width: 1024px) { .expertise-visual { display: flex; } }

.expertise-visual-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
}

.expertise-visual-green      { background: var(--secondary-subtle); color: var(--secondary); }
.expertise-visual-dark-green { background: #E8F5E0; color: #1F5A15; }
.expertise-visual-amber      { background: var(--accent-subtle); color: var(--accent); }
.expertise-visual-blue       { background: #EFF6FF; color: #1B6CA8; }
.expertise-visual-purple     { background: #F3F0FF; color: #6B46C1; }

/* ── CTA ── */
.expertise-cta {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}
.expertise-cta-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}
.expertise-cta h2 { color: white; font-size: var(--text-3xl); }
.expertise-cta p  { color: rgba(255,255,255,0.75); font-size: var(--text-lg); }
.expertise-cta .btn-outline {
  border-color: rgba(255,255,255,0.5);
  color: white;
}
.expertise-cta .btn-outline:hover {
  background: rgba(255,255,255,0.1);
  border-color: white;
}
.expertise-cta .btn-primary {
  background: white;
  color: var(--primary);
  border-color: white;
}
.expertise-cta .btn-primary:hover {
  background: var(--primary-subtle);
}
`
