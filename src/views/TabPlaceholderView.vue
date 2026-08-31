<script setup>
import { useRouter } from 'vue-router'
import { AppHeader, EmptyState } from '@/shared/ui'
import BottomTabLayout from '@/components/layout/BottomTabLayout.vue'

defineProps({
  title: { type: String, required: true },
})

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-page">
    <AppHeader :title="title" mode="back" @back="router.back()" />
    <BottomTabLayout>
      <main class="mx-auto max-w-md px-4 pt-6">
        <EmptyState title="아직 준비 중이에요" description="곧 만나볼 수 있어요.">
          <template #icon>🚧</template>
        </EmptyState>
      </main>
    </BottomTabLayout>
  </div>
</template>
