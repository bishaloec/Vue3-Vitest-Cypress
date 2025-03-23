<template>
    <div class="dashboard-container">
      <h1>ようこそ、{{ user }} さん！</h1>
      <button @click="handleLogout" class="logout-button">ログアウト</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth.ts'
  
  export default defineComponent({
    setup() {
      const authStore = useAuthStore()
      const router = useRouter()
  
      const user = computed(() => authStore.user)
  
      const handleLogout = () => {
        authStore.logout()
        router.push('/login')
      }
  
      return {
        user,
        handleLogout
      }
    }
  })
  </script>
  
  <style scoped>
  .dashboard-container {
    max-width: 800px;
    margin: 50px auto;
    padding: 30px;
    text-align: center;
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  }
  
  .logout-button {
    padding: 12px 25px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .logout-button:hover {
    background-color: #c82333;
  }
  </style>