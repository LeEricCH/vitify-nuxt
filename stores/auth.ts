// stores/auth.ts
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  access_token_expiry: string;
  refresh_token_expiry: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: '',
    accessTokenExpiry: '',
    refreshTokenExpiry: '',
    username: '',
  }),
  getters: {
    isLoggedIn: (state) => {
      if (!state.accessToken) return false
      const now = new Date().getTime()
      const expiry = new Date(state.accessTokenExpiry).getTime()
      return expiry > now
    },
  },
  actions: {
    async refreshTokenAction() {
      try {
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          body: { refresh_token: this.refreshToken },
        }) as AuthResponse; 
        this.accessToken = response.access_token
        this.refreshToken = response.refresh_token
        this.accessTokenExpiry = response.access_token_expiry
        this.refreshTokenExpiry = response.refresh_token_expiry
      } catch (error) {
        this.logout()
        throw error
      }
    },
    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.accessTokenExpiry = ''
      this.refreshTokenExpiry = ''
      this.username = ''
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('access_token_expiry')
      localStorage.removeItem('refresh_token_expiry')
      localStorage.removeItem('username')
      
      // Refresh the page after logout
      window.location.reload()
    },
    setAuthData(data: {
      accessToken: string,
      refreshToken: string,
      accessTokenExpiry: string,
      refreshTokenExpiry: string,
      username: string
    }) {
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.accessTokenExpiry = data.accessTokenExpiry
      this.refreshTokenExpiry = data.refreshTokenExpiry
      this.username = data.username

      // Store in localStorage
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      localStorage.setItem('access_token_expiry', data.accessTokenExpiry)
      localStorage.setItem('refresh_token_expiry', data.refreshTokenExpiry)
      localStorage.setItem('username', data.username)
    },
  },
})