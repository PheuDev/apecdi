import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getPublications } from '../services/content'
import type { Publication } from '../types'

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-BJ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
  } catch {
    return iso.split('T')[0]
  }
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublications().then((data) => {
      setPublications(data)
      setLoading(false)
    })
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(publications.map((p) => p.category).filter(Boolean)))
    return ['all', ...cats]
  }, [publications])

  const filtered = useMemo(() => {
    return publications.filter((p) => {
      const matchCat = category === 'all' || p.category === category
      const q = search.toLowerCase()
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [publications, search, category])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title="Publications"
        description="Découvrez les publications d'APECDI : articles, retours d'expérience et analyses sur l'environnement, la foresterie et le développement au Bénin."
        canonical="https://apecdi.com/publications"
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-separator">›</span>
            <span aria-current="page">Publications</span>
          </nav>
          <h1>Publications</h1>
          <p>Articles, retours d'expérience et analyses de nos équipes.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Recherche + filtres */}
          <div className="pub-controls">
            <div className="pub-search">
              <label htmlFor="pub-search-input" className="sr-only">Rechercher une publication</label>
              <div className="pub-search-input-wrap">
                <Icon name="search" size={18} className="pub-search-icon" />
                <input
                  id="pub-search-input"
                  type="search"
                  className="form-input"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Rechercher une publication"
                />
              </div>
            </div>

            <div className="pub-filters" role="group" aria-label="Filtrer par catégorie">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${category === cat ? 'filter-btn-active' : ''}`}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                >
                  {cat === 'all' ? 'Toutes' : cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="pub-empty">
              <Icon name="file_text" size={48} />
              <p>{search || category !== 'all' ? 'Aucune publication pour ces critères.' : 'Aucune publication disponible pour le moment.'}</p>
            </div>
          )}

          <div className="pub-grid">
            {filtered.map((pub) => (
              <article key={pub.id} className={`pub-article-card ${pub.featured ? 'pub-featured' : ''}`}>
                {pub.cover_image && (
                  <Link to={`/publications/${pub.slug}`} className="pub-article-img" tabIndex={-1} aria-hidden="true">
                    <img src={pub.cover_image} alt={pub.title} loading="lazy" width="600" height="340" />
                  </Link>
                )}
                <div className="pub-article-body">
                  <div className="pub-article-meta">
                    <span className="badge badge-secondary">{pub.category}</span>
                    {pub.featured && <span className="badge badge-primary">À la une</span>}
                    <time dateTime={pub.published_at} className="pub-date">
                      <Icon name="clock" size={13} />
                      {formatDate(pub.published_at)}
                    </time>
                  </div>

                  <Link to={`/publications/${pub.slug}`} className="pub-article-title-link">
                    <h2 className="pub-article-title">{pub.title}</h2>
                  </Link>

                  <p className="pub-article-summary">{pub.summary}</p>

                  {pub.tags.length > 0 && (
                    <div className="pub-tags">
                      {pub.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="pub-tag">
                          <Icon name="tag" size={11} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link to={`/publications/${pub.slug}`} className="btn btn-outline btn-sm pub-read-btn">
                    Lire la publication <Icon name="arrow_right" size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{pubListStyles}</style>
    </>
  )
}

const pubListStyles = `
.pub-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

@media (min-width: 768px) {
  .pub-controls { flex-direction: row; align-items: center; }
}

.pub-search { flex: 1; max-width: 400px; }
.pub-search-input-wrap { position: relative; }
.pub-search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.pub-search .form-input { padding-left: calc(var(--space-3) * 2 + 18px); }

.pub-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.pub-empty {
  text-align: center;
  padding: var(--space-20) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  color: var(--text-muted);
}

.pub-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.pub-article-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}

.pub-article-card:hover { box-shadow: var(--shadow-lg); }

.pub-article-card.pub-featured {
  border-color: var(--primary);
}

.pub-article-img {
  display: block;
  overflow: hidden;
  height: 240px;
}

.pub-article-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.pub-article-card:hover .pub-article-img img { transform: scale(1.03); }

.pub-article-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pub-article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.pub-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.pub-article-title-link { text-decoration: none; }
.pub-article-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text);
  line-height: var(--leading-snug);
  transition: color var(--transition-fast);
}
.pub-article-title-link:hover .pub-article-title { color: var(--primary); }

.pub-article-summary {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.pub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.pub-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--surface-alt);
  border: 1px solid var(--border);
}

.pub-read-btn { align-self: flex-start; }
`
