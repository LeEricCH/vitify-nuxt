<!-- components/Auth/LoginModal.vue -->
<template>
    <v-dialog v-model="isOpenLocal" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">Login to Skribble</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="username"
            label="Username"
            required
          />
          <v-text-field
            v-model="apiKey"
            label="API Key"
            type="password"
            required
          />
          <v-select
            v-model="duration"
            :items="durations"
            label="Save credentials for"
            item-title="label"
            item-value="value"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn color="primary" @click="login">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useNotificationStore } from '~/stores/notification'
  import { useAuthStore } from '~/stores/auth' // Import auth store

  const props = defineProps<{
    isOpen: boolean
  }>()

  const emit = defineEmits(['close', 'loginSuccess', 'update:isOpen'])

  const username = ref('')
  const apiKey = ref('')
  const duration = ref('3d')
  const notificationStore = useNotificationStore()
  const auth = useAuthStore() // Use auth store

  const durations = [
    { value: '15m', label: '15 minutes' },
    { value: '3h', label: '3 hours' },
    { value: '7h', label: '7 hours' },
    { value: '3d', label: '3 days (Recommended)' },
    { value: '7d', label: '7 days' },
    { value: '31d', label: '31 days' },
  ]

  const isOpenLocal = computed({
    get: () => props.isOpen,
    set: (value) => emit('update:isOpen', value)
  })

  function updateIsOpen(value: boolean) {
    emit('update:isOpen', value)
  }

  function close() {
    emit('close')
  }

  async function login() {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username: username.value, api_key: apiKey.value, refresh_token_expiry: duration.value },
      })

      // Update auth store directly
      auth.setAuthData({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        accessTokenExpiry: response.access_token_expiry,
        refreshTokenExpiry: response.refresh_token_expiry,
        username: username.value
      })

      notificationStore.addNotification('Logged in successfully!', 'success')
      emit('loginSuccess')
      close()
    } catch (error) {
      notificationStore.addNotification('Login failed. Please check your credentials.', 'error')
      console.error(error)
    }
  }
  </script>