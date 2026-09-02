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
  // 독립진단(readiness)에서 준비를 마치면 넘어오는 "독립 후" 화면. 하단 탭에는 없다.
  {
    path: '/readiness/daily-life',
    name: 'dailyLife',
    component: () => import('@/views/DailyLifeView.vue'),
  },
  {
    path: '/house-comparisons/houses/:houseType/register',
    name: 'house-register',
    component: () => import('@/views/HouseRegisterView.vue'),
    props: true,
  },
  // 수정 화면은 아직 구현 전이라 임시로 준비 중 화면을 연결한다.
  {
    path: '/house-comparisons/houses/:houseType/edit',
    name: 'house-edit',
    component: () => import('@/views/NotReadyView.vue'),
    props: true,
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
