/**
 * content.ts — Lecture des fichiers JSON depuis /content/
 * Le site lit ces fichiers au build via fetch() sur les fichiers publics.
 * Fallback propre si le fichier est manquant ou malformé.
 */

import type { SiteConfig, Expertise, Realisation, Publication, TeamMember } from '../types'

const BASE = import.meta.env.BASE_URL || '/'

async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const url = `${BASE}${path}`.replace('//', '/')
    const res = await fetch(url)
    if (!res.ok) return fallback
    const data = await res.json()
    return data as T
  } catch {
    console.warn(`[APECDI] Content fetch failed for: ${path}`)
    return fallback
  }
}

// ─── Site config ───────────────────────────────────────────────────────────────

let _site: SiteConfig | null = null

export async function getSiteConfig(): Promise<SiteConfig> {
  if (_site) return _site
  const data = await fetchJSON<SiteConfig | null>('content/site.json', null)
  if (data) {
    _site = data
    return data
  }
  // Fallback minimal pour que le site reste fonctionnel
  return {
    name: 'APECDI',
    fullName: "Agence Privée d'Expertise et de Conseil pour un Développement Inclusif",
    tagline: 'Expertise, environnement et développement au service des territoires et des communautés.',
    founded: '2013-03-25',
    country: 'Bénin',
    description: '',
    mission: '',
    vision: '',
    values: ['Professionnalisme', 'Intégrité', 'Social'],
    contact: {
      email: { status: 'to_validate' },
      phone: { status: 'to_validate' },
      whatsapp: { status: 'to_validate' },
      address: { status: 'to_validate' },
      city: 'Cotonou',
      country: 'Bénin',
      hours: { status: 'to_validate' },
    },
    social: {
      facebook: { status: 'to_validate' },
      linkedin: { status: 'to_validate' },
      twitter: { status: 'to_validate' },
    },
    hero: {
      image: null,
      cta_primary: { label: 'Découvrir nos expertises', href: '/expertises' },
      cta_secondary: { label: 'Voir nos réalisations', href: '/realisations' },
      cta_tertiary: { label: 'Nous contacter', href: '/contact' },
    },
    stats: [],
    footer: {
      tagline: 'Expertise, environnement et développement inclusif au Bénin.',
      copyright: '© 2026 APECDI. Tous droits réservés.',
    },
    seo: {
      title: 'APECDI — Expertise Environnementale et Développement Inclusif au Bénin',
      description: '',
      keywords: '',
    },
  }
}

// ─── Expertises ────────────────────────────────────────────────────────────────

export async function getExpertises(): Promise<Expertise[]> {
  return fetchJSON<Expertise[]>('content/expertises.json', [])
}

// ─── Réalisations ──────────────────────────────────────────────────────────────

export async function getRealisations(): Promise<Realisation[]> {
  return fetchJSON<Realisation[]>('content/realisations.json', [])
}

// ─── Publications ──────────────────────────────────────────────────────────────

// L'index des publications est un manifeste JSON généré au build ou maintenu manuellement
export async function getPublications(): Promise<Publication[]> {
  const index = await fetchJSON<string[]>('content/publications/index.json', [])
  if (index.length === 0) return []

  const results = await Promise.allSettled(
    index.map((slug) => fetchJSON<Publication | null>(`content/publications/${slug}.json`, null))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<Publication> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value)
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
}

export async function getPublication(slug: string): Promise<Publication | null> {
  return fetchJSON<Publication | null>(`content/publications/${slug}.json`, null)
}

// ─── Équipe ────────────────────────────────────────────────────────────────────

export async function getEquipe(): Promise<TeamMember[]> {
  return fetchJSON<TeamMember[]>('content/equipe.json', [])
}
