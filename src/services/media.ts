/**
 * media.ts — Traitement des images côté client
 * Compression, redimensionnement, conversion WebP
 */

export interface ProcessedImage {
  blob: Blob
  width: number
  height: number
  size: number
  mimeType: string
  name: string
}

const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080
const QUALITY = 0.82

/**
 * Traite une image : redimensionne si nécessaire, convertit en WebP si possible.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitDimensions(bitmap.width, bitmap.height, MAX_WIDTH, MAX_HEIGHT)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)

  // Essayer WebP, fallback JPEG
  const mimeType = supportsWebP() ? 'image/webp' : 'image/jpeg'
  const blob = await canvasToBlob(canvas, mimeType, QUALITY)

  const ext = mimeType === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const name = `${sanitizeFilename(baseName)}.${ext}`

  return { blob, width, height, size: blob.size, mimeType, name }
}

function fitDimensions(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  if (w <= maxW && h <= maxH) return { width: w, height: h }
  const ratio = Math.min(maxW / w, maxH / h)
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('Canvas toBlob failed')) },
      type,
      quality
    )
  })
}

function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // enlever accents
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
