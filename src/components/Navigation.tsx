import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { isLoggedIn } from '../services/auth'
import { getSiteConfig } from '../services/content'
import type { SiteConfig } from '../types'
import { isToValidate } from '../types'

const NAV_LINKS = [
  { label: 'ACCUEIL', href: '/' },
  { label: 'À PROPOS', href: '/a-propos' },
  { label: 'EXPERTISES', href: '/expertises' },
  { label: 'RÉALISATIONS', href: '/realisations' },
  { label: 'PUBLICATIONS', href: '/publications' },
  { label: 'ÉQUIPE', href: '/equipe' },
  { label: 'CONTACT', href: '/contact' },
]

const TAP_MIN = 800
const TAP_MAX = 1500

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [site, setSite] = useState<SiteConfig | null>(null)
  const lastTapRef = useRef<number>(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setAdminLoggedIn(isLoggedIn())
    getSiteConfig().then(setSite)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Fermer le menu à chaque navigation
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      navigate('/admin')
      return
    }
  }, [navigate])

  const handleLogoTouch = useCallback((_e: React.TouchEvent) => {
    const now = Date.now()
    const delta = now - lastTapRef.current
    if (delta >= TAP_MIN && delta <= TAP_MAX) {
      navigate('/admin')
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }, [navigate])

  const isHome = location.pathname === '/'
  const showPhone = site && !isToValidate(site.contact.phone)
  const showEmail = site && !isToValidate(site.contact.email)
  const showFb = site && !isToValidate(site.social.facebook)
  const showLi = site && !isToValidate(site.social.linkedin)

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar" role="complementary" aria-label="Informations de contact">
        <div className="container topbar-inner">
          <div className="topbar-left">
            {showPhone && (
              <a href={`tel:${(site!.contact.phone as string).replace(/\s/g, '')}`} className="topbar-item">
                <Icon name="phone" size={13} />
                {site!.contact.phone as string}
              </a>
            )}
            {showEmail && (
              <a href={`mailto:${site!.contact.email as string}`} className="topbar-item">
                <Icon name="mail" size={13} />
                {site!.contact.email as string}
              </a>
            )}
            {!showPhone && !showEmail && (
              <span className="topbar-item">
                <Icon name="mappin" size={13} />
                Cotonou, Bénin
              </span>
            )}
          </div>
          <div className="topbar-right">
            {showFb && (
              <a href={site!.social.facebook as string} target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {showLi && (
              <a href={site!.social.linkedin as string} target="_blank" rel="noopener noreferrer" className="topbar-social" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {adminLoggedIn && (
              <Link to="/admin" className="topbar-social topbar-admin-dot" title="Espace admin" aria-label="Administration">
                <Icon name="settings" size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation principale ── */}
      <header
        className={`nav-header ${scrolled || !isHome ? 'nav-solid' : 'nav-transparent'}`}
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
            <div className="nav-logo-mark" aria-hidden="true">
              <span className="logo-bar-top" />
              <span className="logo-name">APECDI</span>
              <span className="logo-bar-bottom" />
            </div>
          </Link>

          {/* Liens desktop */}
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

          {/* Burger mobile */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={22} aria-hidden />
          </button>
        </nav>
      </header>

      {/* ── Menu mobile ── */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}
        aria-hidden={!menuOpen}
        style={{ top: `calc(var(--topbar-height) + var(--nav-height))` }}
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
                  <Icon name="chevron_right" size={15} />
                </NavLink>
              </li>
            ))}
          </ul>
          {(showPhone || showEmail) && (
            <div className="mobile-menu-contact">
              {showPhone && (
                <a href={`tel:${(site!.contact.phone as string).replace(/\s/g, '')}`} className="mobile-contact-item">
                  <Icon name="phone" size={15} /> {site!.contact.phone as string}
                </a>
              )}
              {showEmail && (
                <a href={`mailto:${site!.contact.email as string}`} className="mobile-contact-item">
                  <Icon name="mail" size={15} /> {site!.contact.email as string}
                </a>
              )}
            </div>
          )}
        </nav>
      </div>

      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          style={{ top: `calc(var(--topbar-height) + var(--nav-height))` }}
        />
      )}

      <style>{navStyles}</style>
    </>
  )
}

const navStyles = `
/* ── Topbar ── */
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--topbar-height);
  background: var(--primary-dark);
  color: rgba(255,255,255,0.85);
  z-index: calc(var(--z-sticky) + 1);
  display: flex;
  align-items: center;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.topbar-left, .topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.topbar-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color var(--transition-fast);
}
.topbar-item:hover { color: white; }

.topbar-social {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color var(--transition-fast);
  padding: 2px;
}
.topbar-social:hover { color: white; }
.topbar-admin-dot { opacity: 0.5; }
.topbar-admin-dot:hover { opacity: 1; }

/* ── Header ── */
.nav-header {
  position: fixed;
  top: var(--topbar-height);
  left: 0; right: 0;
  height: var(--nav-height);
  z-index: var(--z-sticky);
  transition: background var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
  border-bottom: 1px solid transparent;
}

.nav-transparent {
  background: rgba(255,255,255,0.04);
  backdrop-filter: none;
}

.nav-solid {
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 1px 0 var(--border), var(--shadow-sm);
  border-color: var(--border);
}

.nav-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-6);
}

/* ── Logo ── */
.nav-logo { text-decoration: none; display: flex; align-items: center; flex-shrink: 0; }

.nav-logo-mark {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.logo-name {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: var(--font-extrabold);
  color: var(--primary);
  letter-spacing: 0.06em;
  line-height: 1;
}

/* Sur fond transparent (accueil hero), le logo est blanc */
.nav-transparent .logo-name { color: white; }
.nav-transparent .logo-bar-top { background: rgba(255,255,255,0.7); }
.nav-transparent .logo-bar-bottom { background: rgba(255,255,255,0.5); }

.logo-bar-top, .logo-bar-bottom {
  display: block;
  height: 3px;
  border-radius: 2px;
  transition: background var(--transition-base);
}

.logo-bar-top {
  width: 100%;
  background: var(--text);
  margin-bottom: 1px;
}

.logo-bar-bottom {
  width: 65%;
  background: var(--secondary);
  margin-top: 1px;
  align-self: flex-start;
}

/* ── Nav links ── */
.nav-links {
  display: none;
  align-items: center;
  gap: 2px;
  flex: 1;
  justify-content: center;
  list-style: none;
  margin: 0; padding: 0;
}

@media (min-width: 1024px) { .nav-links { display: flex; } }

.nav-link {
  padding: var(--space-2) var(--space-3);
  font-size: 0.72rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 50%; right: 50%;
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
  transition: left var(--transition-base), right var(--transition-base);
}

.nav-link:hover { color: var(--primary); }
.nav-link:hover::after, .nav-link-active::after { left: var(--space-3); right: var(--space-3); }
.nav-link-active { color: var(--primary); font-weight: var(--font-bold); }

/* Sur fond transparent (hero) : liens blancs */
.nav-transparent .nav-link { color: rgba(255,255,255,0.85); }
.nav-transparent .nav-link:hover { color: white; background: rgba(255,255,255,0.1); }
.nav-transparent .nav-link-active { color: white; }
.nav-transparent .nav-link::after { background: white; }

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

.nav-transparent .nav-burger { color: white; }
.nav-transparent .nav-burger:hover { background: rgba(255,255,255,0.1); }
.nav-burger:hover { background: var(--surface-alt); }

@media (min-width: 1024px) { .nav-burger { display: none; } }

/* ── Menu mobile ── */
.mobile-menu {
  position: fixed;
  right: 0; bottom: 0;
  width: min(300px, 88vw);
  background: var(--surface);
  z-index: calc(var(--z-sticky) + 1);
  transform: translateX(100%);
  transition: transform var(--transition-base);
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  padding: var(--space-5);
  border-left: 1px solid var(--border);
}

.mobile-menu-open { transform: translateX(0); }

.mobile-menu ul {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 2px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  font-size: 0.72rem;
  font-weight: var(--font-semibold);
  letter-spacing: 0.08em;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.mobile-nav-link:hover, .mobile-nav-link-active {
  background: var(--primary-subtle);
  color: var(--primary);
}

.mobile-menu-contact {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-decoration: none;
}

.mobile-contact-item:hover { color: var(--primary); }

/* ── Overlay ── */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: var(--z-sticky);
}

@media (min-width: 1024px) {
  .mobile-menu, .mobile-overlay { display: none; }
}
`
