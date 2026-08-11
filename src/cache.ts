/**
 * Per-browser localStorage cache with a TTL. Best-effort throughout:
 * localStorage throws in private browsing and over quota, and a miss is never
 * fatal, so failures degrade to "fetch it again" rather than surfacing.
 */

const PREFIX = 'dawg:cache:'

// Bump when the payload shape changes, to discard entries written by old builds.
const SCHEMA_VERSION = 1

export const DEFAULT_TTL_MS = 60 * 60 * 1000 // 1 hour

type Envelope<T> = {
  v: number
  at: number
  data: T
}

export type CacheHit<T> = {
  data: T
  /** When the entry was written. */
  at: number
}

const storage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export const readCache = <T>(key: string, ttlMs = DEFAULT_TTL_MS): CacheHit<T> | null => {
  const store = storage()
  if (!store) return null

  try {
    const raw = store.getItem(PREFIX + key)
    if (!raw) return null

    const env = JSON.parse(raw) as Envelope<T>
    if (env?.v !== SCHEMA_VERSION) return null
    if (!Number.isFinite(env.at) || Date.now() - env.at > ttlMs) return null

    return { data: env.data, at: env.at }
  } catch {
    return null
  }
}

export const writeCache = <T>(key: string, data: T): void => {
  const store = storage()
  if (!store) return

  const env: Envelope<T> = { v: SCHEMA_VERSION, at: Date.now(), data }
  try {
    store.setItem(PREFIX + key, JSON.stringify(env))
  } catch {
    // Almost always quota. Drop our entries, retry once, then run uncached.
    clearCache()
    try {
      store.setItem(PREFIX + key, JSON.stringify(env))
    } catch {
      /* uncached */
    }
  }
}

export const clearCache = (): void => {
  const store = storage()
  if (!store) return

  try {
    const keys: string[] = []
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i)
      if (k?.startsWith(PREFIX)) keys.push(k)
    }
    for (const k of keys) store.removeItem(k)
  } catch {
    /* nothing we can do */
  }
}
