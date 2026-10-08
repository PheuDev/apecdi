import { Suspense, useEffect, useState } from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import { getSiteConfig } from '../services/content'
import type { SiteConfig } from '../types'

interface LayoutProps {
  children: React.ReactNode
  /** Si true, la navbar est toujours opaque (pages internes) */
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
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading"><div className="spinner" /></div>}>
          {children}
        </Suspense>
      </main>
      {site && <Footer site={site} />}
      <style>{`
        .app-layout { min-height: 100vh; display: flex; flex-direction: column; }
        main { flex: 1; }
        .layout-opaque-nav .nav-header {
          background: rgba(255,255,255,0.97) !important;
          box-shadow: var(--shadow-sm) !important;
        }
      `}</style>
    </div>
  )
}
