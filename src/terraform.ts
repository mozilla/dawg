let cachedRef: string | null = null
let fetchPromise: Promise<string> | null = null

const REPO = 'mozilla/terraform-modules'
const TAG_PREFIX = 'mozilla_workgroup-'
const FALLBACK = 'main'

export async function getLatestRef(): Promise<string> {
  if (cachedRef) return cachedRef

  if (!fetchPromise) {
    fetchPromise = fetch(`https://api.github.com/repos/${REPO}/git/matching-refs/tags/${TAG_PREFIX}`)
      .then(res => res.ok ? res.json() : [])
      .then((refs: { ref: string }[]) => {
        if (refs.length > 0) {
          cachedRef = refs[refs.length - 1].ref.replace('refs/tags/', '')
        } else {
          cachedRef = FALLBACK
        }
        return cachedRef
      })
      .catch(() => {
        cachedRef = FALLBACK
        return FALLBACK
      })
  }

  return fetchPromise
}

export function terraformSnippet(id: string, ref: string = FALLBACK): string {
  const name = id.replace('workgroup:', '').replace(/\//g, '_')
  const moduleName = `${name}_workgroup`.replace(/-/g, '_')
  return `module "${moduleName}" {\n  source = "github.com/mozilla/terraform-modules//mozilla_workgroup?ref=${ref}"\n  ids    = ["${id}"]\n}\n# module.${moduleName}.members`
}
