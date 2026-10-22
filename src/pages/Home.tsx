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
    Promise.all([getSiteConfig(), getExpertises(), getRealisations(), getPublications()])
      .then(([s, e, r, p]) => {
        setSite(s)
        setExpertises(e)
        setRealisations(r.filter((x) => x.featured))
        setPublications(p.filter((x) => x.featured).slice(0, 3))
      })
  }, [])

  if (!site) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO title={undefined} description={site.seo.description} canonical="https://apecdi.com/" />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Introduction">
        <div className="hero-bg" style={site.hero.image ? { backgroundImage: `url(${site.hero.image})` } : undefined} aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container hero-body">
          <div className="hero-text fade-in">
            {/* Fil institutionnel */}
            <div className="hero-kicker">
              <span className="hero-kicker-line" aria-hidden="true" />
              <span>{site.fullName}</span>
            </div>

            <h1 className="hero-title">{site.tagline}</h1>

            <p className="hero-desc">
              Organisation béninoise créée en 2013 — expertise terrain au service des communautés,
              de l'environnement et du développement rural.
            </p>

            <div className="hero-ctas">
              <Link to={site.hero.cta_primary.href} className="btn btn-hero-primary">
                {site.hero.cta_primary.label}
                <Icon name="arrow_right" size={16} />
              </Link>
              <Link to={site.hero.cta_secondary.href} className="btn btn-hero-outline">
                {site.hero.cta_secondary.label}
              </Link>
            </div>

            {/* Valeurs inline */}
            <div className="hero-values" aria-label="Nos valeurs">
              {site.values.map((v) => (
                <span key={v} className="hero-value">
                  <span className="hero-value-dot" aria-hidden="true" />
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="hero-scroll" aria-hidden="true">
          <span className="scroll-line" />
        </div>
      </section>

      {/* ─── BANDEAU STATS ────────────────────────────────────────────────── */}
      <section className="stats-band" aria-label="Chiffres clés">
        <div className="container stats-band-inner">
          {site.stats.map((stat, i) => (
            <div key={stat.label} className="stat-block">
              {i > 0 && <div className="stat-sep" aria-hidden="true" />}
              <div className="stat-num">{stat.value}</div>
              <div className="stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRÉSENTATION ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container intro-grid">
          <div className="intro-left">
            <div className="section-eyebrow">Qui sommes-nous</div>
            <h2 className="section-h2">Une expertise ancrée<br />au cœur du Bénin</h2>
            <div className="accent-rule" aria-hidden="true" />
          </div>
          <div className="intro-right">
            <p>
              Depuis sa création le <strong>25 mars 2013</strong>, APECDI mobilise des équipes pluridisciplinaires
              sur des missions d'expertise environnementale, forestière, agricole et socioéconomique au Bénin.
            </p>
            <p>
              Notre approche allie rigueur méthodologique et proximité terrain — de la phase de diagnostic
              jusqu'au suivi de mise en œuvre.
            </p>
            <div className="intro-values-row">
              {site.values.map((v) => (
                <div key={v} className="intro-value-tag">
                  <Icon name="check" size={14} />
                  {v}
                </div>
              ))}
            </div>
            <Link to="/a-propos" className="btn btn-outline btn-sm">
              Notre histoire <Icon name="arrow_right" size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DOMAINES D'EXPERTISE ─────────────────────────────────────────── */}
      <section className="section section-alt" aria-labelledby="expertises-heading">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-eyebrow">Ce que nous faisons</div>
              <h2 id="expertises-heading" className="section-h2">Nos domaines d'intervention</h2>
            </div>
            <Link to="/expertises" className="btn btn-outline btn-sm section-header-cta">
              Voir tout <Icon name="arrow_right" size={14} />
            </Link>
          </div>

          <div className="exp-grid">
            {expertises.map((exp, i) => (
              <Link key={exp.id} to={`/expertises#${exp.id}`} className="exp-card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`exp-icon-wrap exp-color-${exp.color}`}>
                  <Icon name={exp.icon} size={24} />
                </div>
                <div className="exp-body">
                  <h3 className="exp-title">{exp.title}</h3>
                  <p className="exp-sum">{exp.summary}</p>
                </div>
                <span className="exp-arrow" aria-hidden="true">
                  <Icon name="arrow_right" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RÉALISATIONS ─────────────────────────────────────────────────── */}
      {realisations.length > 0 && (
        <section className="section" aria-labelledby="real-heading">
          <div className="container">
            <div className="section-header-row">
              <div>
                <div className="section-eyebrow">Notre impact terrain</div>
                <h2 id="real-heading" className="section-h2">Réalisations récentes</h2>
              </div>
              <Link to="/realisations" className="btn btn-outline btn-sm section-header-cta">
                Toutes les réalisations <Icon name="arrow_right" size={14} />
              </Link>
            </div>

            <div className="real-cards">
              {realisations.slice(0, 3).map((r) => (
                <Link key={r.id} to={`/realisations#${r.id}`} className="real-card-h">
                  <div className="real-card-img-h">
                    {r.image
                      ? <img src={r.image} alt={r.title} loading="lazy" width="480" height="260" />
                      : <div className="real-placeholder" aria-hidden="true"><Icon name={domainIcon(r.domain)} size={36} /></div>
                    }
                    <span className="real-domain-pill">{domainLabel(r.domain)}</span>
                  </div>
                  <div className="real-card-text">
                    <h3>{r.title}</h3>
                    <p>{r.summary}</p>
                    <div className="real-loc">
                      <Icon name="mappin" size={13} />
                      <span>{r.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PUBLICATIONS ─────────────────────────────────────────────────── */}
      {publications.length > 0 && (
        <section className="section section-alt" aria-labelledby="pub-heading">
          <div className="container">
            <div className="section-header-row">
              <div>
                <div className="section-eyebrow">Actualités & publications</div>
                <h2 id="pub-heading" className="section-h2">Dernières publications</h2>
              </div>
              <Link to="/publications" className="btn btn-outline btn-sm section-header-cta">
                Toutes les publications <Icon name="arrow_right" size={14} />
              </Link>
            </div>

            <div className="pub-cards-row">
              {publications.map((pub, i) => (
                <Link key={pub.id} to={`/publications/${pub.slug}`} className={`pub-card-item ${i === 0 ? 'pub-card-featured' : ''}`}>
                  {pub.cover_image && (
                    <div className="pub-card-img">
                      <img src={pub.cover_image} alt={pub.title} loading="lazy" width="600" height="340" />
                    </div>
                  )}
                  <div className="pub-card-content">
                    <span className="pub-cat-pill">{pub.category}</span>
                    <h3 className="pub-card-title">{pub.title}</h3>
                    <p className="pub-card-sum">{pub.summary}</p>
                    <div className="pub-card-date">
                      <Icon name="clock" size={12} />
                      <time dateTime={pub.published_at}>{fmtDate(pub.published_at)}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA CONTACT ──────────────────────────────────────────────────── */}
      <section className="cta-band" aria-label="Nous contacter">
        <div className="container cta-band-inner">
          <div className="cta-band-text">
            <h2>Parlons de votre projet</h2>
            <p>Vous avez besoin d'une expertise dans l'un de nos domaines d'intervention ? Notre équipe est disponible.</p>
          </div>
          <div className="cta-band-actions">
            <Link to="/contact" className="btn btn-cta-white">
              Nous contacter <Icon name="arrow_right" size={16} />
            </Link>
            <Link to="/realisations" className="btn btn-cta-outline">
              Voir nos réalisations
            </Link>
          </div>
        </div>
      </section>

      <style>{homeStyles}</style>
    </>
  )
}

function domainIcon(d: string) {
  return ({ foresterie: 'tree', environnement: 'leaf', agriculture: 'sprout', 'etudes-donnees': 'clipboard', 'developpement-communautaire': 'users' } as Record<string, string>)[d] || 'layers'
}
function domainLabel(d: string) {
  return ({ foresterie: 'Foresterie', environnement: 'Environnement', agriculture: 'Agriculture', 'etudes-donnees': 'Études & Données', 'developpement-communautaire': 'Développement' } as Record<string, string>)[d] || d
}
function fmtDate(iso: string) {
  try { return new Intl.DateTimeFormat('fr-BJ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)) }
  catch { return iso.split('T')[0] }
}

const homeStyles = `
/* ── Hero ── */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #1C0808;
}

.hero-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  background-color: #2A1010;
}

.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10,3,3,0.88) 0%,
    rgba(30,10,10,0.78) 40%,
    rgba(20,20,20,0.55) 100%
  );
}

.hero-body {
  position: relative;
  z-index: 1;
  padding-top: calc(var(--header-height) + var(--space-12));
  padding-bottom: var(--space-20);
}

.hero-text { max-width: 680px; }

.hero-kicker {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.hero-kicker-line {
  display: block;
  width: 32px;
  height: 2px;
  background: var(--secondary-light);
  border-radius: 1px;
  flex-shrink: 0;
}

.hero-kicker span:last-child {
  font-size: 0.7rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4.5vw, 3.6rem);
  font-weight: var(--font-extrabold);
  color: white;
  line-height: 1.12;
  margin-bottom: var(--space-5);
  letter-spacing: -0.01em;
}

.hero-desc {
  font-size: var(--text-base);
  color: rgba(255,255,255,0.68);
  max-width: 520px;
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-10);
}

.btn-hero-primary {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 14px 28px;
  background: var(--primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
  border: 2px solid var(--primary);
}
.btn-hero-primary:hover { background: var(--primary-dark); box-shadow: 0 4px 16px rgba(139,26,26,0.4); }

.btn-hero-outline {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 14px 28px;
  background: transparent;
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  border: 2px solid rgba(255,255,255,0.35);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.btn-hero-outline:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); }

.hero-values {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-5);
}

.hero-value {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.72rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
}

.hero-value-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--secondary-light);
}

.hero-scroll {
  position: absolute;
  bottom: var(--space-8); left: 50%;
  transform: translateX(-50%);
}

.scroll-line {
  display: block;
  width: 1px; height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
  margin: 0 auto;
  animation: scrollDown 1.8s ease-in-out infinite;
}

@keyframes scrollDown {
  0%, 100% { opacity: 0.3; transform: scaleY(1) translateY(0); }
  50% { opacity: 0.8; transform: scaleY(0.8) translateY(4px); }
}

/* ── Stats band ── */
.stats-band {
  background: var(--primary-dark);
  padding: var(--space-8) 0;
}

.stats-band-inner {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

@media (min-width: 768px) {
  .stats-band-inner { grid-template-columns: repeat(4, 1fr); }
}

.stat-block {
  position: relative;
  text-align: center;
  padding: var(--space-5) var(--space-4);
}

.stat-sep {
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 1px;
  background: rgba(255,255,255,0.12);
}

.stat-num {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-extrabold);
  color: white;
  line-height: 1;
  margin-bottom: var(--space-2);
}

.stat-lbl {
  font-size: 0.7rem;
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Section helpers ── */
.section { padding: var(--space-16) 0; }
.section-alt { background: var(--surface-alt); }

@media (min-width: 768px) { .section { padding: var(--space-24) 0; } }

.section-eyebrow {
  font-size: 0.7rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: var(--space-3);
}

.section-h2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: var(--font-extrabold);
  color: var(--text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-4);
}

.accent-rule {
  width: 40px; height: 3px;
  background: var(--primary);
  border-radius: 2px;
  margin-top: var(--space-4);
}

.section-header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
  flex-wrap: wrap;
}

.section-header-cta { align-self: flex-start; }

/* ── Intro grid ── */
.intro-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-10);
}

@media (min-width: 1024px) {
  .intro-grid { grid-template-columns: 320px 1fr; gap: var(--space-16); align-items: start; }
}

.intro-right { display: flex; flex-direction: column; gap: var(--space-5); }
.intro-right p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.intro-values-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.intro-value-tag {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--secondary-subtle);
  color: var(--secondary-dark);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

/* ── Expertise cards ── */
.exp-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .exp-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1200px) {
  .exp-grid { grid-template-columns: repeat(5, 1fr); }
}

.exp-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: box-shadow var(--transition-base), border-color var(--transition-base), transform var(--transition-base);
}

@media (min-width: 1200px) {
  .exp-card {
    flex-direction: column;
    gap: var(--space-3);
  }
  .exp-arrow { margin-top: auto; }
}

.exp-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.exp-icon-wrap {
  width: 44px; height: 44px; flex-shrink: 0;
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
}

.exp-color-green       { background: var(--secondary-subtle); color: var(--secondary); }
.exp-color-dark-green  { background: #E8F5E0; color: #1F5A15; }
.exp-color-amber       { background: var(--accent-subtle); color: #8A5A00; }
.exp-color-blue        { background: #EFF6FF; color: #1B6CA8; }
.exp-color-purple      { background: #F3F0FF; color: #6B46C1; }

.exp-body { flex: 1; min-width: 0; }

.exp-title {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text);
  margin-bottom: var(--space-1);
  line-height: var(--leading-snug);
}

.exp-sum {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exp-arrow {
  color: var(--primary);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.exp-card:hover .exp-arrow { opacity: 1; }

/* ── Réalisations ── */
.real-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

@media (min-width: 768px) { .real-cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .real-cards { grid-template-columns: repeat(3, 1fr); } }

.real-card-h {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  display: flex; flex-direction: column;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.real-card-h:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }

.real-card-img-h {
  position: relative;
  height: 196px;
  overflow: hidden;
  background: var(--surface-alt);
}

.real-card-img-h img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
.real-card-h:hover .real-card-img-h img { transform: scale(1.04); }

.real-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: var(--border-strong);
}

.real-domain-pill {
  position: absolute;
  top: var(--space-3); left: var(--space-3);
  padding: 3px 10px;
  background: rgba(0,0,0,0.55);
  color: white;
  font-size: 0.68rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  backdrop-filter: blur(4px);
}

.real-card-text { padding: var(--space-5); flex: 1; display: flex; flex-direction: column; gap: var(--space-2); }
.real-card-text h3 { font-size: var(--text-base); font-weight: var(--font-bold); color: var(--text); line-height: var(--leading-snug); }
.real-card-text p { font-size: var(--text-sm); color: var(--text-muted); line-height: var(--leading-relaxed); flex: 1; }
.real-loc { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--text-light); }

/* ── Publications ── */
.pub-cards-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

@media (min-width: 768px) { .pub-cards-row { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .pub-cards-row { grid-template-columns: repeat(3, 1fr); } }

.pub-card-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  display: flex; flex-direction: column;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.pub-card-item:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.pub-card-img { overflow: hidden; height: 180px; }
.pub-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
.pub-card-item:hover .pub-card-img img { transform: scale(1.04); }

.pub-card-content { padding: var(--space-5); flex: 1; display: flex; flex-direction: column; gap: var(--space-3); }

.pub-cat-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: var(--primary-subtle);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: 0.68rem;
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  align-self: flex-start;
}

.pub-card-title { font-size: var(--text-base); font-weight: var(--font-bold); color: var(--text); line-height: var(--leading-snug); }
.pub-card-sum { font-size: var(--text-sm); color: var(--text-muted); line-height: var(--leading-relaxed); flex: 1; }
.pub-card-date { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--text-light); }

/* ── CTA band ── */
.cta-band {
  background: linear-gradient(135deg, var(--surface-primary) 0%, var(--primary-dark) 100%);
  padding: var(--space-16) 0;
}

.cta-band-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .cta-band-inner { flex-direction: row; align-items: center; justify-content: space-between; }
}

.cta-band-text h2 {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: var(--font-extrabold);
  color: white;
  margin-bottom: var(--space-2);
}

.cta-band-text p { color: rgba(255,255,255,0.65); max-width: 480px; line-height: var(--leading-relaxed); font-size: var(--text-sm); }

.cta-band-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; flex-shrink: 0; }

.btn-cta-white {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 13px 26px;
  background: white;
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  border: 2px solid white;
  transition: background var(--transition-fast);
  white-space: nowrap;
}
.btn-cta-white:hover { background: var(--primary-subtle); }

.btn-cta-outline {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 13px 26px;
  background: transparent;
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  border: 2px solid rgba(255,255,255,0.35);
  transition: border-color var(--transition-fast);
  white-space: nowrap;
}
.btn-cta-outline:hover { border-color: rgba(255,255,255,0.7); }
`
