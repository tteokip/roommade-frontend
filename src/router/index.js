import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  // 홈 외 탭 화면은 아직 실제 콘텐츠가 없어 임시로 준비 중 화면을 연결한다.
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
  // 등록/수정/밸런스게임 화면은 아직 구현 전이라 임시로 준비 중 화면을 연결한다.
  {
    path: '/house-comparisons/houses/:houseType/register',
    name: 'house-register',
    component: () => import('@/views/NotReadyView.vue'),
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
