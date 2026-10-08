import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getSiteConfig, getExpertises, getRealisations, getPublications } from '../services/content'
import type { SiteConfig, Expertise, Realisation, Publication } from '../types'

export default function Home() {
  const [site, setSite] = useState<SiteConfig | null>(null)
  const [expertises, setExpertises] = useState<Expertise[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [publications, setPublications] = useState<Publication[]>([])

  useEffect(() => {
    Promise.all([
      getSiteConfig(),
      getExpertises(),
      getRealisations(),
      getPublications(),
    ]).then(([s, e, r, p]) => {
      setSite(s)
      setExpertises(e)
      setRealisations(r.filter((x) => x.featured))
      setPublications(p.filter((x) => x.featured).slice(0, 3))
    })
  }, [])

  if (!site) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title={undefined}
        description={site.seo.description}
        canonical="https://apecdi.com/"
      />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Introduction">
        <div
          className="hero-bg"
          style={site.hero.image ? { backgroundImage: `url(${site.hero.image})` } : undefined}
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <p className="hero-label">{site.fullName}</p>
            <h1 className="hero-title">
              {site.tagline}
            </h1>
            <p className="hero-sub">
              Organisation béninoise d'expertise au service des territoires et des communautés, depuis 2013.
            </p>
            <div className="hero-ctas">
              <Link to={site.hero.cta_primary.href} className="btn btn-primary btn-lg">
                {site.hero.cta_primary.label}
                <Icon name="arrow_right" size={18} />
              </Link>
              <Link to={site.hero.cta_secondary.href} className="btn btn-outline-light btn-lg">
                {site.hero.cta_secondary.label}
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ─── CHIFFRES CLÉS ────────────────────────────────────────────────── */}
      <section className="stats-bar" aria-label="Chiffres clés">
        <div className="container stats-grid">
          {site.stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <div className="stat-icon">
                <Icon name={stat.icon} size={24} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DOMAINES D'EXPERTISE ─────────────────────────────────────────── */}
      <section className="section bg-alt" id="expertises-section">
        <div className="container">
          <header className="section-header">
            <span className="section-label">Ce que nous faisons</span>
            <h2 className="section-title">Nos domaines d'expertise</h2>
            <p className="section-subtitle">
              Cinq pôles complémentaires au service du développement durable et inclusif.
            </p>
          </header>

          <div className="expertises-grid">
            {expertises.map((exp, i) => (
              <Link key={exp.id} to={`/expertises#${exp.id}`} className="expertise-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`expertise-icon expertise-icon-${exp.color}`}>
                  <Icon name={exp.icon} size={28} />
                </div>
                <h3 className="expertise-title">{exp.title}</h3>
                <p className="expertise-summary">{exp.summary}</p>
                <span className="expertise-link">
                  En savoir plus <Icon name="arrow_right" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── À PROPOS (strip) ─────────────────────────────────────────────── */}
      <section className="section about-strip">
        <div className="container about-strip-inner">
          <div className="about-strip-text">
            <span className="section-label">Qui sommes-nous</span>
            <h2 className="section-title">Une expertise ancrée au Bénin</h2>
            <p>
              Créée le 25 mars 2013, APECDI est une agence privée béninoise d'expertise et de conseil
              intervenant dans les domaines de l'environnement, de la foresterie, de l'agriculture,
              des études de terrain et du développement communautaire.
            </p>
            <p>
              Notre approche combine rigueur technique et proximité terrain, au service des communautés,
              des institutions et des projets de développement.
            </p>
            <div className="about-values">
              {site.values.map((v) => (
                <div key={v} className="about-value-chip">
                  <Icon name="check" size={14} />
                  {v}
                </div>
              ))}
            </div>
            <Link to="/a-propos" className="btn btn-outline">
              Notre histoire <Icon name="arrow_right" size={16} />
            </Link>
          </div>
          <div className="about-strip-visual" aria-hidden="true">
            <div className="about-visual-box about-visual-box-1" />
            <div className="about-visual-box about-visual-box-2" />
            <div className="about-visual-badge">
              <span className="about-visual-year">2013</span>
              <span className="about-visual-text">Fondée au Bénin</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RÉALISATIONS MISES EN AVANT ──────────────────────────────────── */}
      {realisations.length > 0 && (
        <section className="section bg-alt">
          <div className="container">
            <header className="section-header">
              <span className="section-label">Notre impact</span>
              <h2 className="section-title">Réalisations récentes</h2>
              <p className="section-subtitle">
                Des interventions concrètes, mesurables, au service des territoires béninois.
              </p>
            </header>

            <div className="realisations-grid">
              {realisations.slice(0, 3).map((r) => (
                <Link key={r.id} to={`/realisations#${r.id}`} className="realisation-card">
                  <div className="realisation-card-img">
                    {r.image
                      ? <img src={r.image} alt={r.title} loading="lazy" width="400" height="220" />
                      : <div className="realisation-card-placeholder" aria-hidden="true">
                          <Icon name={getDomainIcon(r.domain)} size={40} />
                        </div>
                    }
                    <span className={`realisation-domain-badge domain-${r.domain}`}>
                      {getDomainLabel(r.domain)}
                    </span>
                  </div>
                  <div className="realisation-card-body">
                    <h3>{r.title}</h3>
                    <p>{r.summary}</p>
                    <div className="realisation-meta">
                      <Icon name="mappin" size={14} />
                      <span>{r.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="section-cta">
              <Link to="/realisations" className="btn btn-outline">
                Toutes nos réalisations <Icon name="arrow_right" size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── PUBLICATIONS ─────────────────────────────────────────────────── */}
      {publications.length > 0 && (
        <section className="section">
          <div className="container">
            <header className="section-header">
              <span className="section-label">Actualités & publications</span>
              <h2 className="section-title">Dernières publications</h2>
            </header>

            <div className="publications-list">
              {publications.map((pub) => (
                <Link key={pub.id} to={`/publications/${pub.slug}`} className="pub-card">
                  {pub.cover_image && (
                    <div className="pub-card-img">
                      <img src={pub.cover_image} alt={pub.title} loading="lazy" width="200" height="120" />
                    </div>
                  )}
                  <div className="pub-card-body">
                    <span className="badge badge-secondary">{pub.category}</span>
                    <h3>{pub.title}</h3>
                    <p>{pub.summary}</p>
                    <div className="pub-meta">
                      <Icon name="clock" size={14} />
                      <time dateTime={pub.published_at}>{formatDate(pub.published_at)}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="section-cta">
              <Link to="/publications" className="btn btn-outline">
                Toutes les publications <Icon name="arrow_right" size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA CONTACT ──────────────────────────────────────────────────── */}
      <section className="section contact-cta-section">
        <div className="container">
          <div className="contact-cta-box">
            <div>
              <h2>Travaillons ensemble</h2>
              <p>Vous avez un projet dans nos domaines d'expertise ? Contactez-nous pour en discuter.</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-lg">
              {site.hero.cta_tertiary.label}
              <Icon name="arrow_right" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{homeStyles}</style>
    </>
  )
}

function getDomainIcon(domain: string): string {
  const map: Record<string, string> = {
    foresterie: 'tree',
    environnement: 'leaf',
    agriculture: 'sprout',
    'etudes-donnees': 'clipboard',
    'developpement-communautaire': 'users',
  }
  return map[domain] || 'layers'
}

function getDomainLabel(domain: string): string {
  const map: Record<string, string> = {
    foresterie: 'Foresterie',
    environnement: 'Environnement',
    agriculture: 'Agriculture',
    'etudes-donnees': 'Études & Données',
    'developpement-communautaire': 'Développement',
  }
  return map[domain] || domain
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-BJ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
  } catch {
    return iso.split('T')[0]
  }
}

const homeStyles = `
/* ─── Hero ── */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #1A0808;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-color: #2A1010;
  transition: transform 10s ease;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 8, 8, 0.85) 0%,
    rgba(45, 20, 20, 0.75) 50%,
    rgba(26, 26, 26, 0.60) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  padding-top: calc(var(--nav-height) + var(--space-12));
  padding-bottom: var(--space-16);
}

.hero-text { max-width: 700px; }

.hero-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.55);
  margin-bottom: var(--space-4);
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 3.5rem);
  font-weight: 800;
  color: white;
  line-height: 1.15;
  margin-bottom: var(--space-6);
}

.hero-sub {
  font-size: var(--text-lg);
  color: rgba(255,255,255,0.70);
  max-width: 540px;
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-10);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

.hero-scroll-hint {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-scroll-hint span {
  display: block;
  width: 2px;
  height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent);
  animation: scrollPulse 1.8s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(0.7); }
}

/* ─── Stats bar ── */
.stats-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: var(--space-8) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat-item {
  text-align: center;
  padding: var(--space-4);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--primary-subtle);
  color: var(--primary);
  margin: 0 auto var(--space-3);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* ─── Expertises grid ── */
.bg-alt { background: var(--surface-alt); }

.expertises-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

@media (min-width: 640px) { .expertises-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .expertises-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .expertises-grid { grid-template-columns: repeat(5, 1fr); } }

.expertise-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  text-decoration: none;
  transition: box-shadow var(--transition-base), transform var(--transition-base), border-color var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.expertise-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: transparent;
}

.expertise-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
}

.expertise-icon-green     { background: var(--secondary-subtle); color: var(--secondary); }
.expertise-icon-dark-green{ background: #E8F5E0; color: #1F5A15; }
.expertise-icon-amber     { background: var(--accent-subtle); color: var(--accent); }
.expertise-icon-blue      { background: #EFF6FF; color: #1B6CA8; }
.expertise-icon-purple    { background: #F3F0FF; color: #6B46C1; }

.expertise-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text);
  line-height: var(--leading-snug);
}

.expertise-summary {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  flex: 1;
}

.expertise-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--primary);
  margin-top: auto;
}

/* ─── About strip ── */
.about-strip-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: center;
}

@media (min-width: 1024px) {
  .about-strip-inner { grid-template-columns: 1fr 1fr; }
}

.about-strip-text { display: flex; flex-direction: column; gap: var(--space-5); }
.about-strip-text p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.about-values {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.about-value-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--secondary-subtle);
  color: var(--secondary-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.about-strip-visual {
  position: relative;
  height: 300px;
  display: none;
}

@media (min-width: 1024px) { .about-strip-visual { display: block; } }

.about-visual-box {
  position: absolute;
  border-radius: var(--radius-xl);
}

.about-visual-box-1 {
  top: 0; left: 0; right: 60px; bottom: 60px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  opacity: 0.15;
}

.about-visual-box-2 {
  top: 60px; left: 60px; right: 0; bottom: 0;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  opacity: 0.2;
}

.about-visual-badge {
  position: absolute;
  bottom: 20px; left: 20px;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.about-visual-year {
  display: block;
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--primary);
}

.about-visual-text {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* ─── Réalisations grid ── */
.realisations-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) { .realisations-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .realisations-grid { grid-template-columns: repeat(3, 1fr); } }

.realisation-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
  display: flex;
  flex-direction: column;
}

.realisation-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }

.realisation-card-img {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.realisation-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.realisation-card:hover .realisation-card-img img { transform: scale(1.05); }

.realisation-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-alt);
  color: var(--border-strong);
}

.realisation-domain-badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  background: white;
  color: var(--text);
}

.realisation-card-body {
  padding: var(--space-5);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.realisation-card-body h3 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text);
  line-height: var(--leading-snug);
}

.realisation-card-body p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  flex: 1;
}

.realisation-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-light);
  margin-top: auto;
}

/* ─── Publications ── */
.publications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pub-card {
  display: flex;
  gap: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  transition: box-shadow var(--transition-base);
  padding: var(--space-5);
  align-items: flex-start;
}

.pub-card:hover { box-shadow: var(--shadow-md); }

.pub-card-img {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.pub-card-img img { width: 100%; height: 100%; object-fit: cover; }

.pub-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pub-card-body h3 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text);
  line-height: var(--leading-snug);
}

.pub-card-body p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pub-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-light);
  margin-top: var(--space-1);
}

/* ─── Section CTA ── */
.section-cta {
  text-align: center;
  margin-top: var(--space-10);
}

/* ─── Contact CTA ── */
.contact-cta-section { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); }

.contact-cta-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .contact-cta-box {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.contact-cta-box h2 {
  font-size: var(--text-3xl);
  color: white;
  margin-bottom: var(--space-3);
}

.contact-cta-box p {
  color: rgba(255,255,255,0.75);
  max-width: 500px;
  line-height: var(--leading-relaxed);
}

.contact-cta-box .btn-primary {
  background: white;
  color: var(--primary);
  border-color: white;
  white-space: nowrap;
  flex-shrink: 0;
}

.contact-cta-box .btn-primary:hover {
  background: var(--primary-subtle);
  border-color: white;
}
`
