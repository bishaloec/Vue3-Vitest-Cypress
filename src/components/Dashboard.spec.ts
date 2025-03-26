import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';  
import Login from '@/views/Login.vue';          
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../stores/auth.ts'


// Vue RouterをMock
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/dashboard', component: Dashboard , meta: { requiresAuth: true }},
  { path: '/login', component: Login },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

describe('DashboardComponent', () => {
  let wrapper: any

  beforeEach(() => {
     setActivePinia(createPinia()); // Initialize Pinia if you're using it
    // 認証状態を設定（ログイン状態をシミュレート）
    const authStore = useAuthStore()
    authStore.login('test@example.com') // ユーザー名を設定
     // Dashboardコンポーネントをマウント
     wrapper = mount(Dashboard, {
        global: {
          plugins: [router], // Provide router to the test
        },
      });
  
  });

  it('ログインが成功した後、ダッシュボードにリダイレクトする', async () => {
    router.push('/login'); // ログインページへ繊維
    await router.isReady();

    // dashboardページへ繊維
    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/dashboard');

    expect(wrapper.find('h1').text()).toBe('ようこそ、test@example.com さん！');
  });

  it('ログアウトがクリックされた時にログインにリダイレクトする', async () => {
    router.push('/dashboard');
    await router.isReady();

    // [ログアウト]ボタンをクリックする
    await wrapper.find('button').trigger('click')

    // モックAPI呼び出しが解決するのを待ち
    await new Promise(resolve => setTimeout(resolve, 20))

    // ログインしてログインしてログインしていると仮定する
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('ダッシュボード snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
