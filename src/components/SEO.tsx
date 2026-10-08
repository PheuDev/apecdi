import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  noIndex?: boolean
}

const SITE_NAME = 'APECDI'
const BASE_TITLE = 'APECDI — Expertise Environnementale et Développement Inclusif au Bénin'

export default function SEO({ title, description, canonical, ogImage, noIndex }: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : BASE_TITLE

  useEffect(() => {
    document.title = fullTitle

    setMeta('name', 'description', description || '')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description || '')
    if (ogImage) setMeta('property', 'og:image', ogImage)
    if (canonical) setLink('canonical', canonical)
    if (noIndex) setMeta('name', 'robots', 'noindex,nofollow')
  }, [fullTitle, description, canonical, ogImage, noIndex])

  return null
}

function setMeta(attr: string, key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
