/**
 * import.ts — Import d'une sauvegarde (Mode A ou export précédent)
 * Accepte un .zip contenant des JSON de publications et des images.
 */

import JSZip from 'jszip'
import { drafts as draftStore, images as imageStore } from './admin-store'
import { generateId, sanitizeFilename } from './media'
import type { Publication } from '../types'

export interface ImportResult {
  publications: number
  images: number
  errors: string[]
}

export async function importFromZip(file: File): Promise<ImportResult> {
  const result: ImportResult = { publications: 0, images: 0, errors: [] }

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new Error('Fichier .zip invalide ou corrompu.')
  }

  const tasks: Promise<void>[] = []

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return

    // Publications JSON
    if (relativePath.match(/public\/content\/publications\/[^/]+\.json$/) && !relativePath.includes('index.json')) {
      tasks.push(
        entry.async('string').then(async (text) => {
          try {
            const pub: Publication = JSON.parse(text)
            if (!pub.id || !pub.title) {
              result.errors.push(`${relativePath} : champs id/title manquants.`)
              return
            }
            await draftStore.create({
              id: pub.id,
              type: 'publication',
              data: pub as unknown,
              savedAt: Date.now(),
            })
            result.publications++
          } catch {
            result.errors.push(`${relativePath} : JSON invalide.`)
          }
        })
      )
    }

    // Images
    if (relativePath.match(/public\/uploads\/.+\.(webp|jpg|jpeg|png)$/i)) {
      tasks.push(
        entry.async('blob').then(async (blob) => {
          try {
            const filename = relativePath.split('/').pop() || sanitizeFilename(relativePath)
            const id = generateId()
            // Dimensions inconnues à l'import — on met 0,0
            await imageStore.save({
              id,
              name: filename,
              blob,
              mimeType: blob.type || 'image/webp',
              size: blob.size,
              width: 0,
              height: 0,
              savedAt: Date.now(),
            })
            result.images++
          } catch {
            result.errors.push(`${relativePath} : erreur image.`)
          }
        })
      )
    }
  })

  await Promise.allSettled(tasks)
  return result
}

/**
 * Import d'un fichier JSON unique (publication ou site.json).
 */
export async function importSingleJSON(file: File): Promise<{ ok: boolean; message: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Publication
    if (data.slug && data.title && data.content !== undefined) {
      const pub = data as Publication
      await draftStore.create({
        id: pub.id || generateId(),
        type: 'publication',
        data: pub as unknown,
        savedAt: Date.now(),
      })
      return { ok: true, message: `Publication "${pub.title}" importée en brouillon.` }
    }

    return { ok: false, message: 'Format JSON non reconnu. Attendu : publication avec slug/title/content.' }
  } catch {
    return { ok: false, message: 'Fichier JSON invalide.' }
  }
}
