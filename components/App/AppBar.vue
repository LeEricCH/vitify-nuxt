<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
const breadcrumbs = computed(() => {
  return route!.matched
    .filter(
      (item) =>
        item.meta && item.meta.title && !(item.meta?.breadcrumb === 'hidden'),
    )
    .map((r) => ({
      title: r.meta.title!,
      disabled:
        r.meta?.breadcrumb === 'disabled' || r.path === route.path || false,
      to: r.path,
    }))
})
const isDark = computed({
  get() {
    return theme.global.name.value === 'dark' ? true : false
  },
  set(v) {
    theme.global.name.value = v ? 'dark' : 'light'
  },
})
const auth = useAuthStore()
const isLoggedIn = computed(() => auth.isLoggedIn)
const loading = ref(false)
const initialLoading = ref(true)

const formatExpiry = (expiry: string | null) => {
  if (!expiry) return 'N/A'
  const expiryDate = new Date(expiry)
  const now = new Date()
  const diffMs = expiryDate.getTime() - now.getTime()
  const diffHrs = Math.round(diffMs / 3600000)
  const diffMins = Math.round(diffMs / 60000)

  if (diffHrs > 24) {
    return `in ${Math.round(diffHrs / 24)} days`
  } else if (diffHrs > 0) {
    return `in ${diffHrs} hours`
  } else if (diffMins > 0) {
    return `in ${diffMins} minutes`
  } else {
    return 'expiring soon'
  }
}

const handleLogout = async () => {
  loading.value = true
  try {
    await auth.logout()
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Simulate a short delay to allow auth store to initialize
  await new Promise(resolve => setTimeout(resolve, 100))
  initialLoading.value = false
})
</script>
<template>
  <v-app-bar app>
    <v-spacer></v-spacer>

    <template v-if="!initialLoading">
      <v-menu v-if="isLoggedIn" offset-y>
        <template v-slot:activator="{ props: menuProps }">
          <v-chip
            color="primary"
            v-bind="menuProps"
            :loading="loading"
            class="user-chip mr-5"
          >
            <v-avatar left>
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
            {{ auth.username }}
          </v-chip>
        </template>
        <v-card class="user-menu">
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ auth.username }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-clock-outline</v-icon>
              </template>
              <v-list-item-title>Login Expires <strong>{{ formatExpiry(auth.refreshTokenExpiry) }}</strong></v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout" class="logout-item">
              <template v-slot:prepend>
                <v-icon color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      
      <v-btn v-else color="primary" @click="$emit('open-login')" class="mr-5">Login</v-btn>
    </template>
    <v-chip
      v-else
      color="grey"
      class="user-chip placeholder-chip mr-5"
      disabled
    >
      <v-avatar left>
        <v-icon>mdi-account-circle</v-icon>
      </v-avatar>
      Loading...
    </v-chip>
  </v-app-bar>
</template>

<style scoped>
.user-chip {
  height: 40px;
  font-size: 16px;
}
.user-menu {
  border-radius: 8px;
  overflow: hidden;
}
.logout-item {
  color: var(--v-error-base);
}
.placeholder-chip {
  opacity: 0.6;
}
</style>
