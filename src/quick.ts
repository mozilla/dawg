/**
 * Bindings for the Quick SDK, a global injected by `<script src="/quick.js">`.
 * That script only resolves on a Quick host — under `npm run dev` it 404s and
 * the global stays undefined, which is how the app knows to fall back to NDJSON.
 */

export type QueryResult = {
  fields: string[]
  rows: unknown[][]
  total_rows: number
  truncated: boolean
  total_bytes_processed?: string
}

export type QuickSDK = {
  query: (sql: string) => Promise<QueryResult>
  rows: (res: QueryResult) => Array<Record<string, unknown>>
  me: () => Promise<{ email: string }>
}

declare global {
  interface Window {
    quick?: QuickSDK
  }
}

export const quickSDK = (): QuickSDK | undefined =>
  typeof window === 'undefined' ? undefined : window.quick

export const isQuickHosted = (): boolean => quickSDK() !== undefined

// Both views fit in one page today (162 workgroups, ~1.6k member rows).
const PAGE_SIZE = 1000

/**
 * Runs a paged `SELECT TO_JSON_STRING(t)` and parses the rows back to objects.
 * TO_JSON_STRING keeps each row byte-identical to a line of the NDJSON exports,
 * so the existing row types and transforms work untouched, and it avoids the
 * nested `{f:[{v:...}]}` BigQuery wraps around REPEATED RECORDs. Paged because
 * Quick caps a response at 10MB and flags `truncated` rather than erroring;
 * stride comes from the first page, since a trimmed one would desync a fixed
 * LIMIT and skip the rows it cut.
 */
export const queryJsonRows = async <T>(
  from: string,
  orderBy: string,
): Promise<T[]> => {
  const sdk = quickSDK()
  if (!sdk)
    throw new Error(
      'quick.js is not loaded — BigQuery is only reachable when served from a Quick host',
    )

  const out: T[] = []
  let offset = 0
  let stride: number | null = null

  for (;;) {
    const sql =
      `SELECT TO_JSON_STRING(t) AS row_json FROM ${from} t` +
      ` ORDER BY ${orderBy} LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    const res = await sdk.query(sql)
    const page = res.rows ?? []

    for (const row of page) {
      const raw = row[0]
      if (typeof raw === 'string') out.push(JSON.parse(raw) as T)
    }

    if (stride === null) stride = page.length
    if (page.length === 0 || page.length < stride) break
    offset += page.length
  }

  return out
}
