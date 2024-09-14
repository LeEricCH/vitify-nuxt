<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppDrawer from '~/components/App/AppDrawer.vue'
import AppBar from '~/components/App/AppBar.vue'
import AppFooter from '~/components/App/AppFooter.vue'
import LoginModal from '~/components/Auth/LoginModal.vue'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'

const showLogin = ref(false)
const auth = useAuthStore()

onMounted(() => {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const accessTokenExpiry = localStorage.getItem('access_token_expiry')
  const refreshTokenExpiry = localStorage.getItem('refresh_token_expiry')
  const username = localStorage.getItem('username')

  if (!accessToken || !accessTokenExpiry) {
    showLogin.value = true
    Notify.warning('Please log in to access the application.')
  } else {
    const now = new Date().getTime()
    const expiry = new Date(accessTokenExpiry).getTime()
    if (expiry <= now) {
      auth.logout()
      showLogin.value = true
      Notify.error('Your session has expired. Please log in again.')
    } else {
      auth.setAuthData({
        accessToken,
        refreshToken: refreshToken || '',
        accessTokenExpiry,
        refreshTokenExpiry: refreshTokenExpiry || '',
        username: username || ''
      })
    }
  }
})

function onLoginSuccess() {
  showLogin.value = false
}
</script>

<template>
  <v-app>
    <AppDrawer />
    <AppBar @open-login="showLogin = true" :username="auth.username" /> <!-- Pass username to AppBar -->
    <v-main>
      <NuxtPage />
    </v-main>
    <AppFooter />
    <LoginModal v-model:isOpen="showLogin" @close="showLogin = false" @loginSuccess="onLoginSuccess" />
  </v-app>
</template>

<style scoped>
/* replace padding with margin to limit scrollbar in v-main */
.v-main {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: var(--v-layout-top);
  margin-bottom: var(--v-layout-bottom);
  height: calc(100vh - var(--v-layout-top) - var(--v-layout-bottom));
  overflow-y: auto;
  transition-property: padding;
}
</style>
