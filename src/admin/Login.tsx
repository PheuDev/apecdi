import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkPassword, isLockedOut, getLockoutRemainingSeconds, login, isLoggedIn } from '../services/auth'
import Icon from '../components/Icon'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isLoggedIn()) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  // Compte à rebours si verrouillé
  useEffect(() => {
    const update = () => {
      if (isLockedOut()) {
        setLocked(true)
        setRemaining(getLockoutRemainingSeconds())
      } else {
        setLocked(false)
        setRemaining(0)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked || !password.trim()) return

    setLoading(true)
    setError('')

    const ok = await checkPassword(password)
    if (ok) {
      login()
      navigate('/admin/dashboard', { replace: true })
    } else {
      if (isLockedOut()) {
        setLocked(true)
        setError(`Trop de tentatives. Réessayez dans ${getLockoutRemainingSeconds()} seconde(s).`)
      } else {
        setError('Mot de passe incorrect.')
      }
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">APECDI</div>
          <Icon name="lock" size={20} className="login-lock-icon" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Mot de passe
            </label>
            <div className="pwd-input-wrap">
              <input
                id="admin-password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                disabled={locked || loading}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(!showPwd)}
                aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>

          {error && (
            <div id="login-error" className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name="x" size={16} />
              <span>{error}</span>
            </div>
          )}

          {locked && remaining > 0 && (
            <div className="alert alert-warning" role="status" style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name="clock" size={16} />
              <span>Compte temporairement bloqué. Réessayez dans {remaining}s.</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={locked || loading || !password.trim()}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Connexion'}
          </button>
        </form>

        <p className="login-hint">
          Accès réservé à l'administration.
        </p>
      </div>

      <style>{`
        .login-screen {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-alt);
          padding: var(--space-6);
        }

        .login-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          width: 100%;
          max-width: 380px;
          box-shadow: var(--shadow-xl);
        }

        .login-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-8);
        }

        .login-logo {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.04em;
        }

        .login-lock-icon { color: var(--text-muted); }

        .pwd-input-wrap { position: relative; }
        .pwd-toggle {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          padding: var(--space-1);
        }
        .pwd-toggle:hover { color: var(--text); }

        .login-hint {
          margin-top: var(--space-6);
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  )
}
