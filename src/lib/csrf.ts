// =====================================================
// CSRF PROTECTION (double-submit cookie + memory token)
// =====================================================
//
// Production frontend and backend live on different origins
// (nyayaai.online -> legal-ai-z7vb.onrender.com). JavaScript
// cannot read a cookie belonging to the backend origin, so the
// CSRF token is obtained from /api/auth/csrf and kept only in
// frontend memory. The backend stores the same value in its
// non-HttpOnly cookie and requires the matching X-CSRF-Token
// header on authenticated state-changing requests.
//
// This patches global fetch once so existing API call sites do
// not need individual CSRF code. Requests to other origins are
// left untouched.
// =====================================================

const CSRF_HEADER_NAME = 'X-CSRF-Token'
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let installed = false
let csrfToken: string | null = null
let bootstrapPromise: Promise<string | null> | null = null

function getApiOrigin(): string | null {
  const envUrl = import.meta.env.VITE_API_URL

  if (!envUrl) return null

  try {
    return new URL(envUrl).origin
  } catch {
    return null
  }
}

function isProtectedUrl(url: string, origins: string[]): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return origins.includes(parsed.origin)
  } catch {
    return false
  }
}

export async function ensureCsrfToken(forceRefresh = false): Promise<string | null> {
  if (csrfToken && !forceRefresh) return csrfToken
  if (typeof window === 'undefined') return null

  const apiOrigin = getApiOrigin()
  if (!apiOrigin) return null

  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    try {
      const response = await fetch(`${apiOrigin}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.success || typeof data.csrfToken !== 'string') {
        console.error('CSRF bootstrap failed:', data?.message || response.statusText)
        return null
      }

      csrfToken = data.csrfToken
      return csrfToken
    } catch (error) {
      console.error('CSRF bootstrap error:', error)
      return null
    } finally {
      bootstrapPromise = null
    }
  })()

  return bootstrapPromise
}

export function clearCsrfToken(): void {
  csrfToken = null
}

export function installCsrfProtection(): void {
  if (installed || typeof window === 'undefined' || !window.fetch) {
    return
  }

  installed = true

  const protectedOrigins = [
    'http://localhost:5001',
    'http://127.0.0.1:5001',
  ]

  const apiOrigin = getApiOrigin()
  if (apiOrigin) protectedOrigins.push(apiOrigin)

  const originalFetch = window.fetch.bind(window)

  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const isRequestObject = typeof Request !== 'undefined' && input instanceof Request
    const url = typeof input === 'string'
      ? input
      : isRequestObject
        ? (input as Request).url
        : String(input)

    const method = (
      init.method ||
      (isRequestObject ? (input as Request).method : 'GET') ||
      'GET'
    ).toUpperCase()

    if (UNSAFE_METHODS.has(method) && isProtectedUrl(url, protectedOrigins) && csrfToken) {
      const headers = new Headers(
        init.headers ?? (isRequestObject ? (input as Request).headers : undefined)
      )
      headers.set(CSRF_HEADER_NAME, csrfToken)
      init = { ...init, headers }
    }

    return originalFetch(input, init)
  }
}
