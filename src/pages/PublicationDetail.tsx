import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { marked } from 'marked'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getPublication } from '../services/content'
import type { Publication } from '../types'

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-BJ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
  } catch {
    return iso.split('T')[0]
  }
}

export default function PublicationDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [pub, setPub] = useState<Publication | null | undefined>(undefined) // undefined=loading, null=not found

  useEffect(() => {
    if (!slug) return
    getPublication(slug).then((p) => {
      if (p && p.status === 'published') setPub(p)
      else setPub(null)
    })
  }, [slug])

  if (pub === undefined) return <div className="page-loading"><div className="spinner" /></div>
  if (pub === null) return <Navigate to="/publications" replace />

  const htmlContent = marked.parse(pub.content || '') as string

  return (
    <>
      <SEO
        title={pub.title}
        description={pub.summary}
        canonical={`https://apecdi.com/publications/${pub.slug}`}
        ogImage={pub.cover_image || undefined}
      />

      <article className="pub-detail" itemScope itemType="https://schema.org/Article">

        {/* Cover image */}
        {pub.cover_image && (
          <div className="pub-detail-cover">
            <img
              src={pub.cover_image}
              alt={pub.title}
              width="1280"
              height="500"
              loading="eager"
              itemProp="image"
            />
          </div>
        )}

        <div className="pub-detail-layout">
          {/* Sidebar */}
          <aside className="pub-detail-sidebar">
            <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
              <Link to="/">Accueil</Link>
              <span className="breadcrumb-separator">›</span>
              <Link to="/publications">Publications</Link>
              <span className="breadcrumb-separator">›</span>
              <span aria-current="page">{pub.title}</span>
            </nav>

            <div className="pub-sidebar-box">
              <h3>Informations</h3>

              <div className="pub-sidebar-item">
                <Icon name="tag" size={16} />
                <div>
                  <span className="pub-sidebar-label">Catégorie</span>
                  <span className="badge badge-secondary">{pub.category}</span>
                </div>
              </div>

              <div className="pub-sidebar-item">
                <Icon name="clock" size={16} />
                <div>
                  <span className="pub-sidebar-label">Publié le</span>
                  <time dateTime={pub.published_at} itemProp="datePublished">
                    {formatDate(pub.published_at)}
                  </time>
                </div>
              </div>

              {pub.author && (
                <div className="pub-sidebar-item">
                  <Icon name="users" size={16} />
                  <div>
                    <span className="pub-sidebar-label">Auteur</span>
                    <span itemProp="author">{pub.author}</span>
                  </div>
                </div>
              )}

              {pub.tags.length > 0 && (
                <div className="pub-sidebar-tags">
                  <span className="pub-sidebar-label">Tags</span>
                  <div className="tags-list">
                    {pub.tags.map((t) => (
                      <span key={t} className="pub-tag-small">
                        <Icon name="tag" size={11} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/publications" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              ← Retour aux publications
            </Link>
          </aside>

          {/* Contenu */}
          <div className="pub-detail-main">
            <header className="pub-detail-header">
              <span className="badge badge-secondary" style={{ marginBottom: 'var(--space-4)' }}>{pub.category}</span>
              <h1 itemProp="headline">{pub.title}</h1>
              <p className="pub-detail-summary" itemProp="description">{pub.summary}</p>
            </header>

            <div
              className="prose pub-detail-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              itemProp="articleBody"
            />

            {/* Galerie */}
            {pub.gallery.length > 0 && (
              <div className="pub-gallery">
                <h3>Galerie</h3>
                <div className="pub-gallery-grid">
                  {pub.gallery.map((img, i) => (
                    <div key={i} className="pub-gallery-item">
                      <img src={img} alt={`${pub.title} — image ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="divider" />

            <nav className="pub-detail-nav" aria-label="Navigation entre publications">
              <Link to="/publications" className="btn btn-ghost">
                ← Toutes les publications
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Nous contacter <Icon name="arrow_right" size={16} />
              </Link>
            </nav>
          </div>
        </div>
      </article>

      <style>{pubDetailStyles}</style>
    </>
  )
}

const pubDetailStyles = `
.pub-detail { padding-top: var(--nav-height); }

.pub-detail-cover {
  max-height: 480px;
  overflow: hidden;
}
.pub-detail-cover img {
  width: 100%;
  height: 480px;
  object-fit: cover;
}

.pub-detail-layout {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--space-10) var(--space-4);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-10);
}

@media (min-width: 640px)  { .pub-detail-layout { padding: var(--space-10) var(--space-6); } }
@media (min-width: 1024px) {
  .pub-detail-layout {
    grid-template-columns: 280px 1fr;
    padding: var(--space-12) var(--space-8);
  }
  .pub-detail-sidebar { order: -1; }
}

/* Sidebar */
.pub-detail-sidebar { display: flex; flex-direction: column; }

.pub-sidebar-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: calc(var(--nav-height) + var(--space-4));
}

.pub-sidebar-box h3 {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
}

.pub-sidebar-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.pub-sidebar-item .icon { color: var(--primary); margin-top: 2px; flex-shrink: 0; }
.pub-sidebar-item > div { display: flex; flex-direction: column; gap: var(--space-1); }

.pub-sidebar-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: block;
}

.pub-sidebar-tags { display: flex; flex-direction: column; gap: var(--space-2); }
.pub-tag-small {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
}

/* Main */
.pub-detail-header { margin-bottom: var(--space-10); }
.pub-detail-header h1 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: var(--space-4);
}
.pub-detail-summary {
  font-size: var(--text-lg);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  font-style: italic;
}

/* Galerie */
.pub-gallery { margin-top: var(--space-10); }
.pub-gallery h3 { margin-bottom: var(--space-5); }
.pub-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}
@media (min-width: 640px) { .pub-gallery-grid { grid-template-columns: repeat(3, 1fr); } }

.pub-gallery-item {
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
}
.pub-gallery-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform var(--transition-base);
}
.pub-gallery-item:hover img { transform: scale(1.05); }

/* Nav */
.pub-detail-nav {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
`
