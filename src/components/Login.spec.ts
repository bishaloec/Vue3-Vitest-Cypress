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
  
  it('フィールドが空の時にログインボタンを無効にする', async () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    
    // メールのみに記入
    await wrapper.find('input[type="email"]').setValue('test@xyz.com')
    expect(button.attributes('disabled')).toBeDefined()
    
    // パスワードのみに記入
    await wrapper.find('input[type="email"]').setValue('')
    await wrapper.find('input[type="password"]').setValue('P@ssword123')
    expect(button.attributes('disabled')).toBeDefined()
    
    // 両方のフィールドに入力
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('P@ssword123')
    expect(button.attributes('disabled')).toBeUndefined()
  })
  
  it('メール形式を検証する', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    
    // 無効な電子メールをテスト
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    expect(wrapper.find('.error-message').text()).toContain('有効なメールアドレスを入力')
    
    // 有効な電子メールをテスト
    await emailInput.setValue('test@xyz.com')
    await emailInput.trigger('blur')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })
  
  it('パスワード筋力警告を表示する', async () => {
    const passwordInput = wrapper.find('input[type="password"]')
    
    // 短いパスワードをテスト
    await passwordInput.setValue('Short')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('8文字以上の長さ')
    
    // 大文字のないパスワードをテスト
    await passwordInput.setValue('password123')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('1つの大文字が含まれている必要')
    
    // 数字なしでパスワードをテスト
    await passwordInput.setValue('Password')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').text()).toContain('1つの番号が含まれている必要')
    
    // 強力なパスワードをテスト
    await passwordInput.setValue('Password123')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.warning-message').exists()).toBe(false)
  })
  
  it('成功したログインを処理する', async () => {
    // 有効なメールとパスワードでフォームに記入
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('Password123')
    
    // フォームをsubmit
    await wrapper.find('form').trigger('submit')
    
    // 読み込み状態を確認
    expect(wrapper.find('button').text()).toContain('ログイン中')
    
    // モックAPI呼び出しが解決するのを待ち
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // ルーターがダッシュボードに移動するかどうかを確認
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
  
  it('失敗したログインにエラーメッセージを表示する', async () => {
    // 無効なメールとパスワードでフォームに記入
    await wrapper.find('input[type="email"]').setValue('wrong@example.com')
    await wrapper.find('input[type="password"]').setValue('WrongPass123')
    
    // フォームをsubmit
    await wrapper.find('form').trigger('submit')
    
    // モックAPI呼び出しが解決するのを待ち
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // エーラーメッセージをチェック
    expect(wrapper.find('.error-message').text()).toEqual('ログインメールとパスワードは一致しません')
  })

  it('ログイン snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
})