import { Suspense, useEffect, useState } from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import { getSiteConfig } from '../services/content'
import type { SiteConfig } from '../types'

interface LayoutProps {
  children: React.ReactNode
  /** Pages internes — nav toujours opaque */
  opaqueNav?: boolean
}

export default function Layout({ children, opaqueNav = false }: LayoutProps) {
  const [site, setSite] = useState<SiteConfig | null>(null)

  useEffect(() => {
    getSiteConfig().then(setSite)
  }, [])

  return (
    <div className={`app-layout ${opaqueNav ? 'layout-opaque-nav' : ''}`}>
      <Navigation />
      {/* Espace réservé au-dessus du contenu pour topbar + nav */}
      <div
        className="header-spacer"
        style={{ height: 'var(--header-height)' }}
        aria-hidden="true"
      />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading"><div className="spinner" /></div>}>
          {children}
        </Suspense>
      </main>
      {site && <Footer site={site} />}
      <style>{`
        .app-layout { min-height: 100vh; display: flex; flex-direction: column; }
        main { flex: 1; }
        /* Sur la home, le hero compense le spacer via padding-top dans le hero lui-même */
        .app-layout:not(.layout-opaque-nav) .header-spacer { display: none; }
        /* Pages internes : nav toujours solide */
        .layout-opaque-nav .nav-header {
          background: rgba(255,255,255,0.98) !important;
          box-shadow: 0 1px 0 var(--border), var(--shadow-sm) !important;
          border-color: var(--border) !important;
        }
        .layout-opaque-nav .logo-name { color: var(--primary) !important; }
        .layout-opaque-nav .logo-bar-top { background: var(--text) !important; }
        .layout-opaque-nav .logo-bar-bottom { background: var(--secondary) !important; }
        .layout-opaque-nav .nav-link { color: var(--text-secondary) !important; }
        .layout-opaque-nav .nav-link:hover { color: var(--primary) !important; }
        .layout-opaque-nav .nav-link-active { color: var(--primary) !important; }
        .layout-opaque-nav .nav-link::after { background: var(--primary) !important; }
        .layout-opaque-nav .nav-burger { color: var(--text) !important; }
      `}</style>
    </div>
  )
}
