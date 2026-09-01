<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppCard } from '@/shared/ui'
import { formatOrFallback } from '@/utils/houseFormat'

const props = defineProps({
  houseType: { type: String, required: true, validator: (value) => ['A', 'B'].includes(value) },
  house: { type: Object, default: null },
})

const router = useRouter()

const label = computed(() => `${props.houseType}집`)
const pillClass = computed(() =>
  props.houseType === 'A' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-500',
)
const pillTextClass = computed(() => (props.houseType === 'A' ? 'text-amber-700' : 'text-blue-500'))
const registerButtonClass = computed(() =>
  props.houseType === 'A' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600',
)

function goToEdit() {
  router.push({ name: 'house-edit', params: { houseType: props.houseType } })
}

function goToRegister() {
  router.push({ name: 'house-register', params: { houseType: props.houseType } })
}
</script>

<template>
  <AppCard padding="md" class="flex flex-col gap-3">
    <template v-if="house">
      <div class="flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-bold"
          :class="pillClass"
          >{{ label }}</span
        >
        <button type="button" class="text-[10px] font-bold text-muted" @click="goToEdit">
          수정 ✏️
        </button>
      </div>
      <p class="text-base font-extrabold leading-snug text-ink">
        {{ formatOrFallback(house.location) }}
      </p>
      <p class="text-xs font-bold" :class="pillTextClass">✨ AI 정리 완료</p>
    </template>

    <template v-else>
      <div class="flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-bold"
          :class="pillClass"
          >{{ label }}</span
        >
      </div>
      <p class="text-sm font-bold text-body">아직 등록 전이에요</p>
      <p class="text-xs text-muted">사진 최대 3장을 올려보세요</p>
      <button
        type="button"
        class="inline-flex min-h-8 w-full items-center justify-center rounded-pill text-[11px] font-bold text-white transition-colors"
        :class="registerButtonClass"
        @click="goToRegister"
      >
        매물 등록하기
      </button>
    </template>
  </AppCard>
</template>
