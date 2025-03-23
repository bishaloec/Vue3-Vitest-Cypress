import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../views/Login.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Dashboard from '../views/Dashboard.vue'

// AUTHサービスをMock
vi.mock('@/services/auth', () => ({
  useAuthService: () => ({
    login: vi.fn().mockImplementation(async (email, password) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      
      if (email === 'test@example.com' && password === 'Password123') {
        return { success: true, token: 'mock-token' }
      }
      return { success: false, message: 'ログインメールとパスワードは一致しません' }
    })
  })
}))

// Vue Routerの設定
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
  ]
})

describe('LoginComponent', () => {
  let wrapper: any
  
  beforeEach(async () => {
    // Piniaの初期化
    setActivePinia(createPinia())
    
    // Vue Routerをリセット
    router.push('/login')
    await router.isReady()
    
    // Loginコンポーネントをマウント
    wrapper = mount(Login, {
      global: {
        plugins: [router, createPinia()] // Vue RouterとPiniaをプラグインとして渡す
      }
    })
  })

  it('ログインフォームを正しくレンダリングする', () => {
    expect(wrapper.find('h2').text()).toBe('ログイン「テスト」')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
  
  it('フィールドが空のときにログインボタンを無効にする', async () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    
    // Fill in email only
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    expect(button.attributes('disabled')).toBeDefined()
    
    // Fill in password only
    await wrapper.find('input[type="email"]').setValue('')
    await wrapper.find('input[type="password"]').setValue('Password123')
    expect(button.attributes('disabled')).toBeDefined()
    
    // Fill in both fields
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    expect(button.attributes('disabled')).toBeUndefined()
  })
  
  it('メール形式を検証する', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    
    // Test invalid email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    expect(wrapper.find('.error-message').text()).toContain('有効なメールアドレスを入力')
    
    // Test valid email
    await emailInput.setValue('test@example.com')
    await emailInput.trigger('blur')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })
  
  it('パスワード筋力警告を表示する', async () => {
    const passwordInput = wrapper.find('input[type="password"]')
    
    // Test short password
    await passwordInput.setValue('short')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('8文字以上の長さ')
    
    // Test password without uppercase
    await passwordInput.setValue('password123')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('1つの大文字が含まれている必要')
    
    // Test password without numbers
    await passwordInput.setValue('Password')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('1つの番号が含まれている必要')
    
    // Test strong password
    await passwordInput.setValue('Password123')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').exists()).toBe(false)
  })
  
  it('成功したログインを処理する', async () => {
    // Fill form with valid credentials
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('Password123')
    
    // Submit the form
    await wrapper.find('form').trigger('submit')
    
    // Check loading state
    expect(wrapper.find('button').text()).toContain('ログイン中')
    
    // Wait for the mock API call to resolve
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // Check if the router navigates to the dashboard
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
  
  it('失敗したログインにエラーメッセージを表示する', async () => {
    // Fill form with invalid credentials
    await wrapper.find('input[type="email"]').setValue('wrong@example.com')
    await wrapper.find('input[type="password"]').setValue('WrongPass123')
    
    // Submit the form
    await wrapper.find('form').trigger('submit')
    
    // Wait for the mock API call to resolve
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // Assert error message
    expect(wrapper.find('.error-message').text()).toContain('ログインメールとパスワードは一致しません')
    expect(wrapper.html()).toMatchSnapshot();

  })

  it('ログイン snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
})