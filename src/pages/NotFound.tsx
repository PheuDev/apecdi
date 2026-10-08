import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <>
      <SEO title="Page introuvable" noIndex />
      <div className="not-found-page">
        <div className="not-found-content">
          <div className="not-found-code" aria-hidden="true">404</div>
          <h1>Page introuvable</h1>
          <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
          <div className="not-found-links">
            <Link to="/" className="btn btn-primary">
              <Icon name="arrow_right" size={16} /> Retour à l'accueil
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Nous contacter
            </Link>
          </div>
          <div className="not-found-suggestions">
            <p>Pages disponibles :</p>
            <ul>
              <li><Link to="/expertises">Expertises</Link></li>
              <li><Link to="/realisations">Réalisations</Link></li>
              <li><Link to="/publications">Publications</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <style>{`
        .not-found-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-16) var(--space-4);
          padding-top: calc(var(--nav-height) + var(--space-16));
        }
        .not-found-content {
          text-align: center;
          max-width: 480px;
        }
        .not-found-code {
          font-size: 8rem;
          font-weight: 900;
          line-height: 1;
          color: var(--primary);
          opacity: 0.15;
          margin-bottom: var(--space-4);
          letter-spacing: -0.05em;
        }
        .not-found-content h1 { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
        .not-found-content > p { color: var(--text-muted); margin-bottom: var(--space-8); line-height: var(--leading-relaxed); }
        .not-found-links { display: flex; justify-content: center; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-10); }
        .not-found-suggestions p { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-3); }
        .not-found-suggestions ul { list-style: none; display: flex; justify-content: center; flex-wrap: wrap; gap: var(--space-3); }
        .not-found-suggestions a { font-size: var(--text-sm); color: var(--primary); text-decoration: underline; }
        .not-found-suggestions a:hover { color: var(--primary-dark); }
      `}</style>
    </>
  )
}
