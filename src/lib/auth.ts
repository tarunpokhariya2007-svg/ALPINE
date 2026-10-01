import { clearCsrfToken } from './csrf'
// =====================================================
// AUTH HELPERS
// =====================================================
//
// The authentication token itself now lives only in an
// HttpOnly cookie set by the backend — this file never
// reads or writes it, and frontend JavaScript has no way
// to access it.
//
// A small, NON-sensitive snapshot of the logged-in user
// (id, name, email, role — no token, no secrets) is still
// kept in localStorage under the "user" key so the UI can
// render a name/avatar and make routing decisions without
// waiting on a network round trip. This does not grant any
// access by itself; every real API request is authorized
// by the cookie, which the backend verifies independently.
// =====================================================

export interface StoredUser {
  id?: number | string
  fullName?: string
  full_name?: string
  name?: string
  email?: string
  phone?: string
  role?: string
  [key: string]: unknown
}

const USER_STORAGE_KEY = 'user'

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)

    if (!raw || raw === 'undefined' || raw === 'null') {
      return null
    }

    return JSON.parse(raw) as StoredUser
  } catch (error) {
    console.error('Invalid user data in localStorage:', error)
    return null
  }
}

export function setStoredUser(user: StoredUser) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY)
  // Remove any leftover token from a previous version of the
  // app that stored it in localStorage, so it can't linger.
  localStorage.removeItem('token')
}

// Soft, client-side "am I probably logged in" check used only
// for UX decisions (e.g. redirect to /login vs navigate straight
// through). It is NOT a security boundary — every protected API
// call is still authorized by the HttpOnly cookie and verified
// by the backend regardless of what this returns.
export function isLoggedIn(): boolean {
  return !!getStoredUser()
}

// Calls the backend to clear the HttpOnly auth cookies and
// revoke the refresh token, then clears the local UI snapshot.
// Safe to call even if the session is already gone.
export async function logout(apiBaseUrl: string): Promise<void> {
  try {
    await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout request failed:', error)
  } finally {
    clearStoredUser()
    clearCsrfToken()
  }
}
