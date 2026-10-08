// ─── Shared ────────────────────────────────────────────────────────────────────

export type ToValidate = { status: 'to_validate' }

export function isToValidate(v: unknown): v is ToValidate {
  return typeof v === 'object' && v !== null && 'status' in v && (v as ToValidate).status === 'to_validate'
}

// ─── Site ──────────────────────────────────────────────────────────────────────

export interface SiteStat {
  label: string
  value: string
  icon: string
}

export interface HeroConfig {
  image: string | null
  cta_primary: { label: string; href: string }
  cta_secondary: { label: string; href: string }
  cta_tertiary: { label: string; href: string }
}

export interface SiteConfig {
  name: string
  fullName: string
  tagline: string
  tagline_note?: string
  founded: string
  country: string
  description: string
  mission: string
  vision: string
  values: string[]
  contact: {
    email: string | ToValidate
    phone: string | ToValidate
    whatsapp: string | ToValidate
    address: string | ToValidate
    city: string
    country: string
    hours: string | ToValidate
  }
  social: {
    facebook: string | ToValidate
    linkedin: string | ToValidate
    twitter: string | ToValidate
  }
  hero: HeroConfig
  stats: SiteStat[]
  footer: {
    tagline: string
    copyright: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

// ─── Expertise ─────────────────────────────────────────────────────────────────

export interface Expertise {
  id: string
  title: string
  icon: string
  color: string
  summary: string
  description: string
  activities: string[]
}

// ─── Realisation ───────────────────────────────────────────────────────────────

export interface Realisation {
  id: string
  title: string
  domain: string
  year: number | null
  year_note?: string
  location: string
  summary: string
  description: string
  image: string | null
  gallery: string[]
  partners: string[]
  status: 'completed' | 'ongoing' | 'planned'
  featured: boolean
  client: string | ToValidate
}

// ─── Publication ───────────────────────────────────────────────────────────────

export type PublicationStatus = 'draft' | 'published'

export interface Publication {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  category: string
  author: string
  cover_image: string | null
  gallery: string[]
  tags: string[]
  status: PublicationStatus
  published_at: string
  updated_at: string
  featured: boolean
}

// ─── Equipe ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string | ToValidate
  role: string
  bio: string | ToValidate
  photo: string | null
  expertise: string[]
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export type AdminSection = 'dashboard' | 'publications' | 'realisations' | 'settings' | 'media'

export interface AdminDraft {
  id: string
  type: 'publication' | 'realisation'
  data: Publication | Realisation
  savedAt: number
}
