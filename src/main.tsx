import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/main.css'

// Pages publiques
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Expertises from './pages/Expertises'
import Realisations from './pages/Realisations'
import Publications from './pages/Publications'
import PublicationDetail from './pages/PublicationDetail'
import Equipe from './pages/Equipe'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Admin
import AdminApp from './admin/AdminApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ── Pages publiques ── */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/a-propos" element={<Layout opaqueNav><About /></Layout>} />
        <Route path="/expertises" element={<Layout opaqueNav><Expertises /></Layout>} />
        <Route path="/realisations" element={<Layout opaqueNav><Realisations /></Layout>} />
        <Route path="/publications" element={<Layout opaqueNav><Publications /></Layout>} />
        <Route path="/publications/:slug" element={<Layout opaqueNav><PublicationDetail /></Layout>} />
        <Route path="/equipe" element={<Layout opaqueNav><Equipe /></Layout>} />
        <Route path="/contact" element={<Layout opaqueNav><Contact /></Layout>} />

        {/* ── Admin caché ── */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* ── 404 ── */}
        <Route path="*" element={<Layout opaqueNav><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
