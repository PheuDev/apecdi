import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Icon from '../components/Icon'
import { getEquipe } from '../services/content'
import type { TeamMember } from '../types'
import { isToValidate } from '../types'

export default function Equipe() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEquipe().then((data) => {
      setTeam(data)
      setLoading(false)
    })
  }, [])

  // Filtrer les membres avec nom visible
  const visibleMembers = team.filter((m) => !isToValidate(m.name))

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <>
      <SEO
        title="Équipe"
        description="Découvrez l'équipe d'APECDI, des experts pluridisciplinaires au service du développement inclusif au Bénin."
        canonical="https://apecdi.com/equipe"
      />

      <section className="page-hero">
        <div className="container page-hero-content">
          <nav aria-label="Fil d'Ariane" className="breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-separator">›</span>
            <span aria-current="page">Équipe</span>
          </nav>
          <h1>Notre équipe</h1>
          <p>Des experts pluridisciplinaires engagés pour le développement inclusif au Bénin.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {visibleMembers.length > 0 ? (
            <div className="team-grid">
              {visibleMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <div className="team-photo">
                    {member.photo
                      ? <img src={member.photo} alt={member.name as string} loading="lazy" width="200" height="200" />
                      : (
                        <div className="team-photo-placeholder" aria-hidden="true">
                          <Icon name="users" size={40} />
                        </div>
                      )
                    }
                  </div>
                  <div className="team-info">
                    <h3>{member.name as string}</h3>
                    <p className="team-role">{member.role}</p>
                    {!isToValidate(member.bio) && (
                      <p className="team-bio">{member.bio as string}</p>
                    )}
                    {member.expertise.length > 0 && (
                      <div className="team-expertise">
                        {member.expertise.map((e) => (
                          <span key={e} className="badge">{e}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="team-placeholder-section">
              <div className="team-placeholder-content">
                <div className="team-placeholder-icon">
                  <Icon name="users" size={48} />
                </div>
                <h2>Notre équipe vous sera présentée prochainement</h2>
                <p>
                  APECDI dispose d'une équipe d'experts pluridisciplinaires intervenant dans les domaines
                  de l'environnement, de la foresterie, de l'agriculture, des études de terrain et du
                  développement communautaire.
                </p>
                <Link to="/contact" className="btn btn-primary">
                  Prendre contact <Icon name="arrow_right" size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rejoindre l'équipe */}
      <section className="section bg-alt">
        <div className="container team-join">
          <div className="team-join-text">
            <span className="section-label">Travailler avec nous</span>
            <h2 className="section-title">Vous souhaitez rejoindre APECDI ?</h2>
            <p>
              Vous êtes expert dans l'un de nos domaines d'intervention et souhaitez contribuer
              à nos missions ? Contactez-nous pour en discuter.
            </p>
            <Link to="/contact" className="btn btn-outline">
              Nous écrire <Icon name="arrow_right" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <style>{equipeStyles}</style>
    </>
  )
}

const equipeStyles = `
.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
@media (min-width: 640px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .team-grid { grid-template-columns: repeat(3, 1fr); } }

.team-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}
.team-card:hover { box-shadow: var(--shadow-lg); }

.team-photo {
  height: 200px;
  overflow: hidden;
  background: var(--surface-alt);
}
.team-photo img { width: 100%; height: 100%; object-fit: cover; }
.team-photo-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: var(--border-strong);
}

.team-info { padding: var(--space-5); }
.team-info h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
.team-role { color: var(--primary); font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-3); }
.team-bio { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-3); }
.team-expertise { display: flex; flex-wrap: wrap; gap: var(--space-2); }

/* Placeholder */
.team-placeholder-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
}

.team-placeholder-content {
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.team-placeholder-icon {
  width: 96px; height: 96px;
  border-radius: 50%;
  background: var(--primary-subtle);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}

.team-placeholder-content h2 { font-size: var(--text-2xl); }
.team-placeholder-content p { color: var(--text-muted); line-height: var(--leading-relaxed); }

/* Join */
.team-join { max-width: 640px; }
.team-join-text { display: flex; flex-direction: column; gap: var(--space-5); }
.team-join-text p { color: var(--text-secondary); line-height: var(--leading-relaxed); }
`
