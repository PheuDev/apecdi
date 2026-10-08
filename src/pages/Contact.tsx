import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getSiteConfig } from '../services/content'
import type { SiteConfig } from '../types'
import { isToValidate } from '../types'

export default function Contact() {
  const [site, setSite] = useState<SiteConfig | null>(null)

  useEffect(() => {
    getSiteConfig().then(setSite)
  }, [])

  if (!site) return <div className="page-loading"><div className="spinner" /></div>

  const showEmail   = !isToValidate(site.contact.email)
  const showPhone   = !isToValidate(site.contact.phone)
  const showWA      = !isToValidate(site.contact.whatsapp)
  const showAddress = !isToValidate(site.contact.address)
  const showHours   = !isToValidate(site.contact.hours)
  const showFb      = !isToValidate(site.social.facebook)
  const showLi      = !isToValidate(site.social.linkedin)

  return (
    <>
      <SEO
        title="Contact"
        description={`Contactez APECDI, agence béninoise d'expertise en environnement, foresterie et développement rural. ${showEmail ? `Email : ${site.contact.email as string}` : ''}`}
        canonical="https://apecdi.com/contact"
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-separator">›</span>
            <span aria-current="page">Contact</span>
          </nav>
          <h1>Contactez-nous</h1>
          <p>Vous avez un projet ou une question ? Nous sommes à votre écoute.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">

          {/* Informations de contact */}
          <div className="contact-info" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content={site.name} />
            <meta itemProp="legalName" content={site.fullName} />

            <h2>Informations de contact</h2>
            <p className="contact-intro">
              APECDI est une agence béninoise basée à {site.contact.city}.
              N'hésitez pas à nous contacter pour tout projet ou information.
            </p>

            <div className="contact-items">
              {showEmail && (
                <div className="contact-item" itemProp="contactPoint" itemScope itemType="https://schema.org/ContactPoint">
                  <div className="contact-item-icon">
                    <Icon name="mail" size={22} />
                  </div>
                  <div>
                    <span className="contact-item-label">Email</span>
                    <a href={`mailto:${site.contact.email as string}`} itemProp="email">
                      {site.contact.email as string}
                    </a>
                  </div>
                </div>
              )}

              {showPhone && (
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Icon name="phone" size={22} />
                  </div>
                  <div>
                    <span className="contact-item-label">Téléphone</span>
                    <a href={`tel:${(site.contact.phone as string).replace(/\s/g, '')}`} itemProp="telephone">
                      {site.contact.phone as string}
                    </a>
                  </div>
                </div>
              )}

              {showWA && (
                <div className="contact-item">
                  <div className="contact-item-icon" style={{ background: '#E8F5E0', color: '#25D366' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="contact-item-label">WhatsApp</span>
                    <a href={`https://wa.me/${(site.contact.whatsapp as string).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                      {site.contact.whatsapp as string}
                    </a>
                  </div>
                </div>
              )}

              {(showAddress || !showEmail) && (
                <div className="contact-item" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <div className="contact-item-icon">
                    <Icon name="mappin" size={22} />
                  </div>
                  <div>
                    <span className="contact-item-label">Adresse</span>
                    {showAddress
                      ? <span itemProp="streetAddress">{site.contact.address as string}, </span>
                      : null
                    }
                    <span itemProp="addressLocality">{site.contact.city}</span>,{' '}
                    <span itemProp="addressCountry">{site.contact.country}</span>
                  </div>
                </div>
              )}

              {showHours && (
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Icon name="clock" size={22} />
                  </div>
                  <div>
                    <span className="contact-item-label">Horaires</span>
                    <span>{site.contact.hours as string}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            {(showFb || showLi) && (
              <div className="contact-socials">
                <p className="contact-item-label">Retrouvez-nous</p>
                <div className="contact-social-links">
                  {showFb && (
                    <a href={site.social.facebook as string} target="_blank" rel="noopener noreferrer" className="contact-social-btn">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  {showLi && (
                    <a href={site.social.linkedin as string} target="_blank" rel="noopener noreferrer" className="contact-social-btn">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="contact-message-section">
            <div className="contact-message-box">
              <h2>Envoyer un message</h2>
              <p>
                Pour nous contacter, utilisez directement les coordonnées ci-contre
                ou envoyez-nous un email.
              </p>

              {showEmail ? (
                <a href={`mailto:${site.contact.email as string}?subject=Contact depuis le site APECDI`} className="btn btn-primary btn-lg contact-email-btn">
                  <Icon name="mail" size={20} />
                  Envoyer un email
                </a>
              ) : (
                <div className="alert alert-info">
                  <Icon name="mail" size={18} />
                  <span>
                    Les coordonnées de contact seront disponibles prochainement.
                    En attendant, vous pouvez nous trouver à {site.contact.city}, {site.contact.country}.
                  </span>
                </div>
              )}

              {showWA && (
                <a
                  href={`https://wa.me/${(site.contact.whatsapp as string).replace(/[^0-9]/g, '')}?text=Bonjour APECDI, je vous contacte depuis votre site web.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              <div className="contact-domains">
                <h3>Nos domaines d'intervention</h3>
                <ul>
                  <li><Icon name="leaf" size={16} /> Environnement & EIES</li>
                  <li><Icon name="tree" size={16} /> Foresterie & Ressources naturelles</li>
                  <li><Icon name="sprout" size={16} /> Agriculture & Développement rural</li>
                  <li><Icon name="clipboard" size={16} /> Études, Données & Terrain</li>
                  <li><Icon name="users" size={16} /> Développement communautaire</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style>{contactStyles}</style>
    </>
  )
}

const contactStyles = `
.contact-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  align-items: start;
}

@media (min-width: 1024px) {
  .contact-layout { grid-template-columns: 1fr 1fr; }
}

/* Contact info */
.contact-info h2 { font-size: var(--text-2xl); margin-bottom: var(--space-4); }
.contact-intro {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.contact-item-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  border-radius: var(--radius-lg);
  background: var(--primary-subtle);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}

.contact-item > div:last-child {
  display: flex; flex-direction: column; gap: var(--space-1);
  padding-top: var(--space-2);
}

.contact-item-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  display: block;
}

.contact-item a {
  font-size: var(--text-base);
  color: var(--primary);
  font-weight: var(--font-medium);
  transition: color var(--transition-fast);
}

.contact-item a:hover { color: var(--primary-dark); }
.contact-item span { font-size: var(--text-base); color: var(--text); }

/* Socials */
.contact-socials { padding-top: var(--space-6); border-top: 1px solid var(--border); }
.contact-social-links { display: flex; gap: var(--space-3); margin-top: var(--space-3); }
.contact-social-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.contact-social-btn:hover { border-color: var(--primary); color: var(--primary); }

/* Message */
.contact-message-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  position: sticky;
  top: calc(var(--nav-height) + var(--space-6));
}

.contact-message-box h2 { font-size: var(--text-2xl); }
.contact-message-box p { color: var(--text-secondary); line-height: var(--leading-relaxed); }

.contact-email-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.contact-domains {
  padding-top: var(--space-5);
  border-top: 1px solid var(--border);
}

.contact-domains h3 {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-4);
}

.contact-domains ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contact-domains li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.contact-domains li .icon { color: var(--secondary); flex-shrink: 0; }
`
