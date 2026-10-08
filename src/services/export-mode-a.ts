/**
 * export-mode-a.ts — Export manuel (Mode A)
 * Génère un .zip contenant les fichiers JSON et images à déposer dans le repo.
 */

import JSZip from 'jszip'
import { images as imageStore } from './admin-store'
import type { Publication, Realisation } from '../types'

export async function exportPublicationZip(pub: Publication): Promise<void> {
  const zip = new JSZip()

  // Nettoyer le contenu (enlever les champs admin internes)
  const exportData = { ...pub }
  const jsonContent = JSON.stringify(exportData, null, 2)
  zip.file(`public/content/publications/${pub.slug}.json`, jsonContent)

  // Inclure l'image de couverture si c'est un ID local (stocké dans IndexedDB)
  if (pub.cover_image && pub.cover_image.startsWith('local:')) {
    const imageId = pub.cover_image.replace('local:', '')
    const stored = await imageStore.get(imageId)
    if (stored) {
      zip.file(`public/uploads/publications/${stored.name}`, stored.blob)
    }
  }

  // Inclure les images de la galerie
  for (const imgRef of pub.gallery) {
    if (imgRef.startsWith('local:')) {
      const imageId = imgRef.replace('local:', '')
      const stored = await imageStore.get(imageId)
      if (stored) {
        zip.file(`public/uploads/publications/${stored.name}`, stored.blob)
      }
    }
  }

  await downloadZip(zip, `apecdi-publication-${pub.slug}.zip`)
}

export async function exportRealisationZip(real: Realisation): Promise<void> {
  const zip = new JSZip()

  const jsonContent = JSON.stringify(real, null, 2)
  // La réalisation est dans le fichier global realisations.json — on exporte juste le fragment
  zip.file(`public/content/realisation-${real.id}.json`, jsonContent)

  if (real.image && real.image.startsWith('local:')) {
    const stored = await imageStore.get(real.image.replace('local:', ''))
    if (stored) zip.file(`public/uploads/realisations/${stored.name}`, stored.blob)
  }

  await downloadZip(zip, `apecdi-realisation-${real.id}.zip`)
}

export async function exportAllPublicationsZip(pubs: Publication[]): Promise<void> {
  const zip = new JSZip()

  const index = pubs.filter((p) => p.status === 'published').map((p) => p.slug)
  zip.file(`public/content/publications/index.json`, JSON.stringify(index, null, 2))

  for (const pub of pubs) {
    zip.file(`public/content/publications/${pub.slug}.json`, JSON.stringify(pub, null, 2))

    if (pub.cover_image?.startsWith('local:')) {
      const stored = await imageStore.get(pub.cover_image.replace('local:', ''))
      if (stored) zip.file(`public/uploads/publications/${stored.name}`, stored.blob)
    }

    for (const imgRef of pub.gallery) {
      if (imgRef.startsWith('local:')) {
        const stored = await imageStore.get(imgRef.replace('local:', ''))
        if (stored) zip.file(`public/uploads/publications/${stored.name}`, stored.blob)
      }
    }
  }

  await downloadZip(zip, 'apecdi-all-publications.zip')
}

async function downloadZip(zip: JSZip, filename: string): Promise<void> {
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
