import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/ui-preview',
    name: 'ui-preview',
    component: () => import('@/views/UiPreviewView.vue'),
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
