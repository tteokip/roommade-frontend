import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/readiness',
    name: 'readiness',
    component: () => import('@/views/ReadinessView.vue'),
  },
  {
    path: '/house-comparisons',
    name: 'house-comparison',
    component: () => import('@/views/HouseComparisonView.vue'),
  },
  {
    path: '/benefits',
    name: 'benefit',
    component: () => import('@/views/TabPlaceholderView.vue'),
    props: { title: '지원금' },
  },
  {
    path: '/house-comparisons/houses/:houseType/register',
    name: 'house-register',
    component: () => import('@/views/HouseRegisterView.vue'),
    props: true,
  },
  {
    path: '/house-comparisons/houses/:houseType/edit',
    name: 'house-edit',
    component: () => import('@/views/NotReadyView.vue'),
    props: true,
  },
  {
    path: '/house-comparisons/balance-game',
    name: 'house-balance-game',
    component: () => import('@/views/NotReadyView.vue'),
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
