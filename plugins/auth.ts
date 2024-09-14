// plugins/auth.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  if (auth.isLoggedIn) {
    // Set up an interval to refresh the token 1 minute before expiry
    const refreshInterval = setInterval(async () => {
      const now = new Date().getTime()
      const expiry = new Date(auth.accessTokenExpiry).getTime()
      if (expiry - now < 60 * 1000) { // 1 minute
        try {
          await auth.refreshTokenAction()
        } catch {
          auth.logout()
          clearInterval(refreshInterval)
        }
      }
    }, 30 * 1000) // Check every 30 seconds

    // Clear interval on component unmount
    onBeforeUnmount(() => {
      clearInterval(refreshInterval)
    })
  }
})