import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { isLoggedIn } from '../services/auth'

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Expertises', href: '/expertises' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Publications', href: '/publications' },
  { label: 'Équipe', href: '/equipe' },
  { label: 'Contact', href: '/contact' },
]

// Double-tap / Ctrl+clic pour accéder à l'admin caché
// Mobile : double-tap dans une fenêtre de 800–1500 ms
// Desktop : Ctrl+clic (ou ⌘+clic)
const TAP_MIN = 800
const TAP_MAX = 1500

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const lastTapRef = useRef<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    setAdminLoggedIn(isLoggedIn())
  }, [])

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer le menu mobile au resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Fermer le menu mobile si on navigue
  useEffect(() => {
    setMenuOpen(false)
  }, [])

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    // Ctrl+clic ou ⌘+clic → admin caché
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      navigate('/admin')
      return
    }
    // Clic normal → accueil (comportement par défaut du Link)
  }, [navigate])

  const handleLogoTouch = useCallback((_e: React.TouchEvent) => {
    const now = Date.now()
    const delta = now - lastTapRef.current
    if (delta >= TAP_MIN && delta <= TAP_MAX) {
      // Double-tap détecté
      navigate('/admin')
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }, [navigate])

  return (
    <>
      <header
        className={`nav-header ${scrolled ? 'nav-scrolled' : ''}`}
        role="banner"
      >
        <nav className="container nav-inner" aria-label="Navigation principale">
          {/* Logo */}
          <Link
            to="/"
            className="nav-logo"
            onClick={handleLogoClick}
            onTouchEnd={handleLogoTouch}
            aria-label="APECDI — Retour à l'accueil"
          >
            <div className="nav-logo-icon" aria-hidden="true">
              <span className="logo-bar logo-bar-top" />
              <span className="logo-text">APECDI</span>
              <span className="logo-bar logo-bar-bottom" />
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="nav-links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                  end={link.href === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA desktop */}
          <div className="nav-actions">
            {adminLoggedIn && (
              <Link to="/admin" className="btn btn-sm btn-ghost nav-admin-badge" title="Espace admin">
                <Icon name="settings" size={16} />
              </Link>
            )}
            <Link to="/contact" className="btn btn-sm btn-primary">
              Nous contacter
            </Link>
          </div>

          {/* Burger mobile */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={24} aria-hidden />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Menu mobile">
          <ul role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
                  end={link.href === '/'}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <Icon name="chevron_right" size={16} />
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mobile-menu-cta">
            <Link to="/contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Nous contacter
            </Link>
          </div>
        </nav>
      </div>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        .nav-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          height: var(--nav-height);
          transition: background var(--transition-base), box-shadow var(--transition-base);
          background: transparent;
        }

        .nav-header.nav-scrolled {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: var(--shadow-md);
        }

        /* Sur les pages internes, toujours fond blanc */
        .nav-header.nav-opaque {
          background: rgba(255,255,255,0.97);
          box-shadow: var(--shadow-sm);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          height: 100%;
          gap: var(--space-8);
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          text-decoration: none;
        }

        .nav-logo-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 2px 4px;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.04em;
          line-height: 1;
          font-family: var(--font-sans);
        }

        .logo-bar {
          display: block;
          height: 4px;
          border-radius: 2px;
        }

        .logo-bar-top {
          width: 100%;
          background: var(--text);
          margin-bottom: 2px;
        }

        .logo-bar-bottom {
          width: 80%;
          align-self: flex-start;
          background: var(--secondary);
          margin-top: 2px;
        }

        /* ── Links ── */
        .nav-links {
          display: none;
          align-items: center;
          gap: var(--space-1);
          flex: 1;
          justify-content: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        @media (min-width: 1024px) {
          .nav-links { display: flex; }
        }

        .nav-link {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: color var(--transition-fast), background var(--transition-fast);
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: var(--primary);
          background: var(--primary-subtle);
        }

        .nav-link-active {
          color: var(--primary);
          font-weight: var(--font-semibold);
        }

        /* ── Actions ── */
        .nav-actions {
          display: none;
          align-items: center;
          gap: var(--space-3);
          margin-left: auto;
        }

        @media (min-width: 1024px) {
          .nav-actions { display: flex; }
        }

        .nav-admin-badge {
          color: var(--text-muted);
        }

        /* ── Burger ── */
        .nav-burger {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          color: var(--text);
          margin-left: auto;
          transition: background var(--transition-fast);
        }

        .nav-burger:hover { background: var(--surface-alt); }

        @media (min-width: 1024px) {
          .nav-burger { display: none; }
        }

        /* ── Mobile menu ── */
        .mobile-menu {
          position: fixed;
          top: var(--nav-height);
          right: 0;
          bottom: 0;
          width: min(320px, 85vw);
          background: var(--surface);
          z-index: calc(var(--z-sticky) + 1);
          transform: translateX(100%);
          transition: transform var(--transition-base);
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          padding: var(--space-6);
        }

        .mobile-menu-open {
          transform: translateX(0);
        }

        .mobile-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast), color var(--transition-fast);
          text-decoration: none;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link-active {
          background: var(--primary-subtle);
          color: var(--primary);
        }

        .mobile-menu-cta {
          margin-top: var(--space-8);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border);
        }

        .mobile-menu-cta .btn {
          width: 100%;
          justify-content: center;
        }

        /* ── Overlay ── */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: var(--z-sticky);
          top: var(--nav-height);
        }

        @media (min-width: 1024px) {
          .mobile-menu,
          .mobile-overlay { display: none; }
        }
      `}</style>
    </>
  )
}
