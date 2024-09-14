// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.isLoggedIn) {
    Notify.error('You need to log in to view this page')
    return navigateTo('/')
  }

  // Optionally, handle token refresh
  const now = new Date().getTime()
  const expiry = new Date(auth.accessTokenExpiry).getTime()

  if (expiry - now < 5 * 60 * 1000) { // If token expires in less than 5 minutes
    try {
      await auth.refreshTokenAction()
    } catch {
      // Refresh failed, redirect to login
      Notify.error('Session expired. Please log in again.')
      return navigateTo('/')
    }
  }
})