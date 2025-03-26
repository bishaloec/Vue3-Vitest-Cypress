<template>
  <div class="login-container">
    <h2>ログイン「テスト」</h2>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">📧 メールアドレス :</label>
        <input 
          id="email"
          v-model="email"
          type="email"
          placeholder="メールアドレスを入力してください"
          required
          @blur="validateEmail"
        />
        <p v-if="emailError" class="error-message">{{ emailError }}</p>
      </div>
      
      <div class="form-group">
        <label for="password">🔒 パスワード:</label>
        <input 
          id="password"
          v-model="password"
          type="password"
          placeholder="パスワードを入力してください"
          required
          @blur="validatePassword"
        />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        <p v-if="passwordWarning" class="warning-message">{{ passwordWarning }}</p>
      </div>
      
      <div v-if="loginError" class="error-message">
        {{ loginError }}
      </div>
      
      <button 
        type="submit" 
        :disabled="isLoginDisabled || isLoading"
        class="login-button"
      >
        <span v-if="isLoading">ログイン中...</span>
        <span v-else>ログイン</span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useAuthService } from '../services/auth'
import { useAuthStore } from '../stores/auth.ts'
import { useRouter } from 'vue-router'


export default defineComponent({
  name: 'LoginComponent',
  setup() {
    const email = ref('')
    const password = ref('')
    const emailError = ref('')
    const passwordError = ref('')
    const passwordWarning = ref('')
    const loginError = ref('')
    const successMessage = ref('')
    const isLoading = ref(false)
    
    const authService = useAuthService()

    const router = useRouter()
  
    const validateEmail = () => {
      emailError.value = ''
      
      if (!email.value) {
        emailError.value = 'メールアドレスが必要'
        return false
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.value)) {
        emailError.value = '有効なメールアドレスを入力してください'
        return false
      }
      
      return true
    }
    
    const validatePassword = () => {
      passwordError.value = ''
      passwordWarning.value = ''
      
      if (!password.value) {
        passwordError.value = 'パスワードが必要'
        return false
      }
      
      // パスワードの強さを確認
      if (password.value.length < 8) {
        passwordWarning.value = 'パスワードは少なくとも8文字以上の長さが必要です'
      } else if (!/[A-Z]/.test(password.value)) {
        passwordWarning.value = 'パスワードには、少なくとも1つの大文字が含まれている必要があります'
      } else if (!/[0-9]/.test(password.value)) {
        passwordWarning.value = 'パスワードには少なくとも1つの番号が含まれている必要があります'
      }
      
      return true
    }
    
    const isLoginDisabled = computed(() => {
      return !email.value || !password.value || !!emailError.value || !!passwordError.value
    })
    
    const handleLogin = async () => {
      // 以前のエラーをリセット
      loginError.value = ''
      successMessage.value = ''
      
      // フォームを検証
      const isEmailValid = validateEmail()
      const isPasswordValid = validatePassword()
      
      if (!isEmailValid || !isPasswordValid) {
        return
      }
      
      try {
        isLoading.value = true
        const result = await authService.login(email.value, password.value)
        
        if (result.success) {
          successMessage.value = 'ログインが成功'
          const authStore = useAuthStore()
          authStore.login(email.value)
          router.push('/dashboard') // Vue Routerを使用
          // 実際のアプリでは、ここでリダイレクトするか、auth stateを更新する
        } else {
          loginError.value = result.message || 'Login failed. Please check your credentials.'
        }
      } catch (error) {
        loginError.value = 'An unexpected error occurred. Please try again.'
        console.error('Login error:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      email,
      password,
      emailError,
      passwordError,
      passwordWarning,
      loginError,
      successMessage,
      isLoading,
      isLoginDisabled,
      validateEmail,
      validatePassword,
      handleLogin
    }
  }
})
</script>

<style scoped>
/* Center the login container on the screen */
.login-container {
  max-width: 450px;
  width: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  color: #d9534f;
  font-size: 14px;
  margin-top: 5px;
}

.warning-message {
  color: #f0ad4e;
  font-size: 14px;
  margin-top: 5px;
}

.success-message {
  color: #5cb85c;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #dff0d8;
  border-radius: 4px;
}

.login-button {
  padding: 10px 15px;
  background-color: #337ab7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>