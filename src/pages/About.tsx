import { useEffect, useState } from 'react'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getSiteConfig } from '../services/content'
import type { SiteConfig } from '../types'

export default function About() {
  const [site, setSite] = useState<SiteConfig | null>(null)

  useEffect(() => {
    getSiteConfig().then(setSite)
  }, [])

  if (!site) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title="À propos"
        description={`APECDI — ${site.fullName}. Créée en 2013, organisation béninoise d'expertise en environnement, foresterie, agriculture et développement.`}
        canonical="https://apecdi.com/a-propos"
      />

      {/* Page hero */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <a href="/">Accueil</a>
            <span className="breadcrumb-separator" aria-hidden="true">›</span>
            <span aria-current="page">À propos</span>
          </nav>
          <h1>À propos d'APECDI</h1>
          <p>Organisation béninoise d'expertise et de conseil créée en 2013.</p>
        </div>
      </section>

      {/* Présentation */}
      <section className="section">
        <div className="container about-main-grid">
          <div className="about-main-text">
            <span className="section-label">Notre histoire</span>
            <h2 className="section-title">Une agence née d'une ambition béninoise</h2>
            <div className="divider-accent" />

            <p>
              APECDI — Agence Privée d'Expertise et de Conseil pour un Développement Inclusif — a été
              créée le <strong>25 mars 2013</strong> au Bénin. Elle intervient dans les domaines de
              l'environnement, de la foresterie et des ressources naturelles, de l'agriculture et du
              développement rural, des études et collecte de données de terrain, ainsi que du développement
              communautaire.
            </p>
            <p>
              L'agence opère dans une logique de proximité terrain, en mobilisant des équipes
              pluridisciplinaires capables d'intervenir sur des missions complexes, de la phase de
              diagnostic à la mise en œuvre et au suivi.
            </p>
            <p>
              Notre ancrage béninois est une force : la connaissance des contextes locaux, des communautés
              et des dynamiques institutionnelles nous permet d'apporter des réponses adaptées aux réalités
              du terrain.
            </p>
          </div>

          <div className="about-identity-card">
            <div className="identity-logo">
              <span className="identity-logo-text">APECDI</span>
            </div>
            <div className="identity-info">
              <div className="identity-row">
                <span className="identity-label">Fondée</span>
                <span className="identity-value">25 mars 2013</span>
              </div>
              <div className="identity-row">
                <span className="identity-label">Siège</span>
                <span className="identity-value">{site.contact.city}, {site.contact.country}</span>
              </div>
              <div className="identity-row">
                <span className="identity-label">Statut</span>
                <span className="identity-value">Agence privée</span>
              </div>
              <div className="identity-row">
                <span className="identity-label">Valeurs</span>
                <span className="identity-value">{site.values.join(' · ')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Valeurs */}
      <section className="section bg-alt">
        <div className="container">
          <header className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-label">Ce qui nous guide</span>
            <h2 className="section-title">Mission, Vision & Valeurs</h2>
          </header>

          <div className="mvv-grid">
            <div className="mvv-card mvv-mission">
              <div className="mvv-icon">
                <Icon name="layers" size={28} />
              </div>
              <h3>Mission</h3>
              <p>{site.mission}</p>
            </div>

            <div className="mvv-card mvv-vision">
              <div className="mvv-icon">
                <Icon name="eye" size={28} />
              </div>
              <h3>Vision</h3>
              <p>{site.vision}</p>
            </div>

            <div className="mvv-card mvv-values">
              <div className="mvv-icon">
                <Icon name="star" size={28} />
              </div>
              <h3>Valeurs</h3>
              <ul>
                {site.values.map((v) => (
                  <li key={v}>
                    <Icon name="check" size={16} />
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Approche */}
      <section className="section">
        <div className="container approach-section">
          <div className="approach-text">
            <span className="section-label">Notre méthode</span>
            <h2 className="section-title">Une approche de terrain</h2>
            <div className="divider-accent" />
            <p>
              APECDI privilégie une approche participative et pluridisciplinaire. Nos interventions
              mobilisent des experts aux profils complémentaires — environnementalistes, forestiers,
              agronomes, socio-économistes, spécialistes de la collecte de données — capables de
              travailler ensemble de la conception à la livraison.
            </p>
            <p>
              Nous accordons une attention particulière à la rigueur méthodologique, à la qualité des
              données collectées et à la pertinence des recommandations formulées pour chaque contexte.
            </p>
          </div>

          <div className="approach-pillars">
            {[
              { icon: 'clipboard', title: 'Rigueur', desc: 'Méthodologies éprouvées, collecte rigoureuse, données fiables.' },
              { icon: 'users', title: 'Participation', desc: 'Implication des communautés à chaque étape de nos interventions.' },
              { icon: 'leaf', title: 'Durabilité', desc: 'Des solutions pensées pour durer et bénéficier aux générations futures.' },
              { icon: 'mappin', title: 'Ancrage local', desc: 'Connaissance du terrain béninois et des dynamiques locales.' },
            ].map((p) => (
              <div key={p.title} className="approach-pillar">
                <div className="approach-pillar-icon">
                  <Icon name={p.icon} size={22} />
                </div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{aboutStyles}</style>
    </>
  )
}

const aboutStyles = `
.about-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: start;
}
@media (min-width: 1024px) {
  .about-main-grid { grid-template-columns: 1fr 340px; }
}

.about-main-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.about-main-text p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

/* ── Identity card ── */
.about-identity-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: calc(var(--nav-height) + var(--space-6));
}

.identity-logo {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: var(--space-8);
  text-align: center;
}

.identity-logo-text {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.06em;
}

.identity-info { padding: var(--space-5); }

.identity-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
}

.identity-row:last-child { border-bottom: none; }

.identity-label { color: var(--text-muted); white-space: nowrap; }
.identity-value { color: var(--text); font-weight: var(--font-medium); text-align: right; }

/* ── MVV ── */
.mvv-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
@media (min-width: 768px) { .mvv-grid { grid-template-columns: repeat(3, 1fr); } }

.mvv-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  border: 1px solid var(--border);
}

.mvv-icon {
  width: 56px; height: 56px;
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: var(--space-5);
}

.mvv-mission .mvv-icon { background: var(--primary-subtle); color: var(--primary); }
.mvv-vision .mvv-icon  { background: var(--secondary-subtle); color: var(--secondary); }
.mvv-values .mvv-icon  { background: var(--accent-subtle); color: var(--accent); }

.mvv-card h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text);
  margin-bottom: var(--space-3);
}

.mvv-card p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.mvv-card ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.mvv-card ul li {
  display: flex; align-items: center; gap: var(--space-3);
  font-size: var(--text-base); color: var(--text-secondary);
}
.mvv-card ul li .icon { color: var(--secondary); flex-shrink: 0; }

/* ── Approach ── */
.approach-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: start;
}
@media (min-width: 1024px) { .approach-section { grid-template-columns: 1fr 1fr; } }

.approach-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.approach-text p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.approach-pillars {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.approach-pillar {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.approach-pillar-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  border-radius: var(--radius-lg);
  background: var(--primary-subtle);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}

.approach-pillar h4 { font-size: var(--text-base); font-weight: var(--font-semibold); margin-bottom: var(--space-1); }
.approach-pillar p { font-size: var(--text-sm); color: var(--text-muted); line-height: var(--leading-relaxed); }
`
