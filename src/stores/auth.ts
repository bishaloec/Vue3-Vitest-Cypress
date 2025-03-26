import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null as string | null
  }),
  actions: {
    login(email: string) {
      this.isAuthenticated = true
      this.user = email // ユーザー名を正しく設定
    },
    logout() {
      this.isAuthenticated = false
      this.user = null
    }
  }
})