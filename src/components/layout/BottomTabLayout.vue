<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BottomNavigation } from '@/shared/ui'
import { NAV_ITEMS } from '@/constants/navigation'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => (
  typeof route.meta.tab === 'string'
    ? route.meta.tab
    : typeof route.name === 'string' ? route.name : ''
))

function goToTab(id) {
  if (id !== route.name) router.push({ name: id })
}
</script>

<template>
  <div class="pb-[calc(75px+env(safe-area-inset-bottom))]">
    <slot />
  </div>
  <BottomNavigation :items="NAV_ITEMS" :model-value="activeTab" @update:model-value="goToTab" />
</template>
