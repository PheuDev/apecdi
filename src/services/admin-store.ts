/**
 * admin-store.ts — Couche d'abstraction IndexedDB pour les brouillons admin.
 * Uniquement pour les brouillons non publiés et les images en attente.
 * Le reste de l'app ne dépend jamais directement d'IndexedDB.
 */

const DB_NAME = 'apecdi_admin'
const DB_VERSION = 1
const STORES = {
  drafts: 'drafts',
  images: 'images',
} as const

// ─── Init ──────────────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
  if (_db) return _db
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORES.drafts)) {
        db.createObjectStore(STORES.drafts, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.images)) {
        db.createObjectStore(STORES.images, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => { _db = req.result; resolve(req.result) }
    req.onerror = () => reject(req.error)
  })
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return getDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const req = fn(store)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
  )
}

function txAll<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T[]>
): Promise<T[]> {
  return getDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const req = fn(store)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
  )
}

// ─── Drafts API ────────────────────────────────────────────────────────────────

export interface Draft {
  id: string
  type: 'publication' | 'realisation'
  data: unknown
  savedAt: number
}

export const drafts = {
  async create(draft: Draft): Promise<void> {
    await tx(STORES.drafts, 'readwrite', (s) => s.put(draft))
  },
  async read(id: string): Promise<Draft | undefined> {
    return tx<Draft | undefined>(STORES.drafts, 'readonly', (s) => s.get(id))
  },
  async update(draft: Draft): Promise<void> {
    await tx(STORES.drafts, 'readwrite', (s) => s.put({ ...draft, savedAt: Date.now() }))
  },
  async delete(id: string): Promise<void> {
    await tx(STORES.drafts, 'readwrite', (s) => s.delete(id))
  },
  async list(): Promise<Draft[]> {
    return txAll<Draft>(STORES.drafts, 'readonly', (s) => s.getAll())
  },
  async clear(): Promise<void> {
    await tx(STORES.drafts, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)
  },
}

// ─── Images API ────────────────────────────────────────────────────────────────

export interface StoredImage {
  id: string            // UUID ou slug dérivé du nom
  name: string          // Nom original du fichier
  blob: Blob            // Données binaires (WebP si converti)
  mimeType: string
  size: number
  width: number
  height: number
  savedAt: number
}

export const images = {
  async save(image: StoredImage): Promise<void> {
    await tx(STORES.images, 'readwrite', (s) => s.put(image))
  },
  async get(id: string): Promise<StoredImage | undefined> {
    return tx<StoredImage | undefined>(STORES.images, 'readonly', (s) => s.get(id))
  },
  async delete(id: string): Promise<void> {
    await tx(STORES.images, 'readwrite', (s) => s.delete(id))
  },
  async list(): Promise<StoredImage[]> {
    return txAll<StoredImage>(STORES.images, 'readonly', (s) => s.getAll())
  },
  async clear(): Promise<void> {
    await tx(STORES.images, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)
  },
  async getTotalSize(): Promise<number> {
    const all = await images.list()
    return all.reduce((sum, img) => sum + img.size, 0)
  },
}

// ─── Reset complet ─────────────────────────────────────────────────────────────

export async function resetAllDrafts(): Promise<void> {
  await Promise.all([drafts.clear(), images.clear()])
}
