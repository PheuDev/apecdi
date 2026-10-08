import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom'
import { isLoggedIn, logout } from '../services/auth'
import Icon from '../components/Icon'
import Login from './Login'
import Dashboard from './Dashboard'
import PublicationEditor from './PublicationEditor'
import RealisationEditor from './RealisationEditor'
import SiteSettings from './SiteSettings'
import MediaLibrary from './MediaLibrary'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={<AdminProtected />} />
    </Routes>
  )
}

function AdminProtected() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    setAuthenticated(isLoggedIn())
  }, [])

  if (authenticated === null) return null
  if (!authenticated) return <Navigate to="/admin/login" replace />

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Navigation administration">
        <div className="admin-sidebar-logo">
          <span>APECDI</span>
          <span className="admin-badge">Admin</span>
        </div>

        <nav>
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="layers" size={18} />
                Tableau de bord
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/publications" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="file_text" size={18} />
                Publications
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/realisations" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="building" size={18} />
                Réalisations
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/media" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="image" size={18} />
                Médiathèque
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="settings" size={18} />
                Paramètres
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
            <Icon name="eye" size={18} />
            Voir le site
          </a>
          <button className="admin-nav-item admin-logout" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="publications" element={<Dashboard section="publications" />} />
          <Route path="publications/new" element={<PublicationEditor />} />
          <Route path="publications/:id" element={<PublicationEditor />} />
          <Route path="realisations" element={<Dashboard section="realisations" />} />
          <Route path="realisations/new" element={<RealisationEditor />} />
          <Route path="realisations/:id" element={<RealisationEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>

      <style>{adminShellStyles}</style>
    </div>
  )
}

const adminShellStyles = `
.admin-shell {
  display: flex;
  min-height: 100svh;
  background: var(--surface-alt);
}

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface-dark);
  display: flex;
  flex-direction: column;
  padding: var(--space-6) 0;
  position: sticky;
  top: 0;
  height: 100svh;
  overflow-y: auto;
}

.admin-sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-5) var(--space-6);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: var(--space-4);
}

.admin-sidebar-logo > span:first-child {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.04em;
}

.admin-badge {
  font-size: var(--text-xs) !important;
  font-weight: var(--font-semibold) !important;
  padding: 2px 8px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  letter-spacing: 0.06em;
}

.admin-sidebar nav { flex: 1; padding: 0 var(--space-3); }
.admin-sidebar nav ul { list-style: none; display: flex; flex-direction: column; gap: 2px; }

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.admin-nav-item:hover,
.admin-nav-item.active {
  background: rgba(255,255,255,0.08);
  color: white;
}

.admin-nav-item.active { color: white; }

.admin-sidebar-footer {
  padding: var(--space-4) var(--space-3) 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-logout { color: rgba(255,100,100,0.8) !important; }
.admin-logout:hover { background: rgba(255,50,50,0.1) !important; color: #ff8888 !important; }

.admin-main {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

/* ── Mobile: hide sidebar ── */
@media (max-width: 767px) {
  .admin-sidebar { display: none; }
}
`
