import { Link } from 'react-router-dom'
import Icon from './Icon'
import type { SiteConfig } from '../types'
import { isToValidate } from '../types'

interface FooterProps {
  site: SiteConfig
}

export default function Footer({ site }: FooterProps) {
  const year = new Date().getFullYear()

  const showEmail = !isToValidate(site.contact.email)
  const showPhone = !isToValidate(site.contact.phone)
  const showAddress = !isToValidate(site.contact.address)
  const showFacebook = !isToValidate(site.social.facebook)
  const showLinkedin = !isToValidate(site.social.linkedin)

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">

        {/* Colonne 1 — Identité */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="APECDI — Retour à l'accueil">
            <span className="footer-logo-text">APECDI</span>
            <span className="footer-logo-sub">{site.fullName}</span>
          </Link>
          <p className="footer-tagline">{site.footer.tagline}</p>
          <div className="footer-values">
            {site.values.map((v) => (
              <span key={v} className="footer-value-chip">{v}</span>
            ))}
          </div>
        </div>

        {/* Colonne 2 — Navigation */}
        <nav className="footer-nav" aria-label="Navigation secondaire">
          <h3 className="footer-col-title">Navigation</h3>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/a-propos">À propos</Link></li>
            <li><Link to="/expertises">Expertises</Link></li>
            <li><Link to="/realisations">Réalisations</Link></li>
            <li><Link to="/publications">Publications</Link></li>
            <li><Link to="/equipe">Équipe</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        {/* Colonne 3 — Domaines */}
        <div className="footer-domains">
          <h3 className="footer-col-title">Nos domaines</h3>
          <ul>
            <li><Link to="/expertises#environnement">Environnement</Link></li>
            <li><Link to="/expertises#foresterie">Foresterie & Ressources naturelles</Link></li>
            <li><Link to="/expertises#agriculture">Agriculture & Développement rural</Link></li>
            <li><Link to="/expertises#etudes-donnees">Études, Données & Terrain</Link></li>
            <li><Link to="/expertises#developpement-communautaire">Développement communautaire</Link></li>
          </ul>
        </div>

        {/* Colonne 4 — Contact */}
        <div className="footer-contact">
          <h3 className="footer-col-title">Contact</h3>
          <ul className="footer-contact-list">
            {showEmail && (
              <li>
                <Icon name="mail" size={16} />
                <a href={`mailto:${site.contact.email as string}`}>
                  {site.contact.email as string}
                </a>
              </li>
            )}
            {showPhone && (
              <li>
                <Icon name="phone" size={16} />
                <a href={`tel:${(site.contact.phone as string).replace(/\s/g, '')}`}>
                  {site.contact.phone as string}
                </a>
              </li>
            )}
            {showAddress && (
              <li>
                <Icon name="mappin" size={16} />
                <span>{site.contact.address as string}, {site.contact.city}, {site.contact.country}</span>
              </li>
            )}
            {!showEmail && !showPhone && !showAddress && (
              <li>
                <Icon name="mappin" size={16} />
                <span>{site.contact.city}, {site.contact.country}</span>
              </li>
            )}
          </ul>

          {/* Réseaux sociaux */}
          {(showFacebook || showLinkedin) && (
            <div className="footer-social">
              {showFacebook && (
                <a
                  href={site.social.facebook as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="APECDI sur Facebook"
                  className="footer-social-link"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {showLinkedin && (
                <a
                  href={site.social.linkedin as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="APECDI sur LinkedIn"
                  className="footer-social-link"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            {site.footer.copyright.replace('© 2026', `© ${year}`)}
          </p>
          <p className="footer-founded">
            Créée le 25 mars 2013 · {site.contact.city}, {site.contact.country}
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--surface-dark);
          color: rgba(255,255,255,0.75);
          padding-top: var(--space-16);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-10);
          padding-bottom: var(--space-12);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1.5fr 1.5fr; }
        }

        /* ── Brand ── */
        .footer-logo { text-decoration: none; display: block; margin-bottom: var(--space-4); }
        .footer-logo-text {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.06em;
          display: block;
          line-height: 1;
        }
        .footer-logo-sub {
          display: block;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: var(--space-1);
          line-height: var(--leading-snug);
        }

        .footer-tagline {
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.65);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-5);
        }

        .footer-values {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .footer-value-chip {
          font-size: var(--text-xs);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
        }

        /* ── Nav cols ── */
        .footer-col-title {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: white;
          margin-bottom: var(--space-5);
        }

        .footer-nav ul,
        .footer-domains ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .footer-nav a,
        .footer-domains a {
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.6);
          transition: color var(--transition-fast);
          text-decoration: none;
        }

        .footer-nav a:hover,
        .footer-domains a:hover { color: white; }

        /* ── Contact ── */
        .footer-contact-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .footer-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.65);
        }

        .footer-contact-list li .icon { color: var(--primary-light); margin-top: 1px; flex-shrink: 0; }

        .footer-contact-list a {
          color: rgba(255,255,255,0.65);
          transition: color var(--transition-fast);
          text-decoration: none;
        }

        .footer-contact-list a:hover { color: white; }

        /* ── Social ── */
        .footer-social {
          display: flex;
          gap: var(--space-3);
        }

        .footer-social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .footer-social-link:hover {
          background: var(--primary);
          color: white;
        }

        /* ── Bottom ── */
        .footer-bottom {
          padding: var(--space-5) 0;
          background: rgba(0,0,0,0.2);
        }

        .footer-bottom-inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        @media (min-width: 768px) {
          .footer-bottom-inner {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .footer-bottom p {
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.4);
        }

        .footer-founded {
          font-size: var(--text-xs) !important;
          color: rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </footer>
  )
}
