<script setup>
import { computed, ref } from 'vue'

import RoomPreview from '@/components/room/RoomPreview.vue'
import { AppButton, AppCard, AppChip } from '@/shared/ui'

const furnitureOptions = [
  { key: 'bed', label: '침대' },
  { key: 'desk', label: '책상' },
  { key: 'chair', label: '의자' },
  { key: 'closet', label: '옷장' },
  { key: 'lamp', label: '조명' },
  { key: 'plant', label: '화분' },
  { key: 'window', label: '창문' },
]

const presets = [
  { key: 'empty', label: '빈 방', furniture: [] },
  { key: 'bed', label: '침대만', furniture: ['bed'] },
  { key: 'bedroom', label: '침실', furniture: ['bed', 'lamp', 'plant'] },
  { key: 'workspace', label: '작업 공간', furniture: ['window', 'desk', 'chair', 'plant'] },
  {
    key: 'all',
    label: '전체 가구',
    furniture: furnitureOptions.map((option) => option.key),
  },
]

const selectedFurniture = ref([])

const variantOptions = [
  { key: 'default', label: '기본' },
  { key: 'cozy-cottage', label: '코지 코티지' },
  { key: 'warm-oak', label: '웜 오크' },
]
const selectedVariant = ref('default')

const activePresetKey = computed(
  () =>
    presets.find(
      (preset) =>
        preset.furniture.length === selectedFurniture.value.length &&
        preset.furniture.every((key) => selectedFurniture.value.includes(key)),
    )?.key,
)

const placementText = computed(() => {
  const labels = furnitureOptions
    .filter((option) => selectedFurniture.value.includes(option.key))
    .map((option) => option.label)

  return labels.length ? labels.join(', ') : '빈 방'
})

function applyPreset(preset) {
  selectedFurniture.value = [...preset.furniture]
}
</script>

<template>
  <main class="min-h-screen bg-page px-4 py-8 text-body sm:px-6 sm:py-10">
    <div class="mx-auto w-full max-w-md">
      <header class="mb-6">
        <AppChip selected>Development test</AppChip>
        <h1 class="mt-4 text-2xl font-extrabold text-ink">방 꾸미기 레이어 테스트</h1>
        <p class="mt-2 text-sm leading-6 text-muted">
          같은 크기의 투명 레이어를 겹쳐 가구 조합 결과를 확인해 보세요.
        </p>
      </header>

      <div class="space-y-5">
        <AppCard padding="sm">
          <RoomPreview :furniture="selectedFurniture" :variant="selectedVariant" />
          <p class="mt-4 text-center text-sm font-bold text-ink" aria-live="polite">
            현재 배치: {{ placementText }}
          </p>
        </AppCard>

        <AppCard padding="sm">
          <fieldset>
            <legend class="text-base font-extrabold text-ink">디자인 세트 (상점 미리보기)</legend>
            <div class="mt-3 flex flex-wrap gap-2">
              <AppButton
                v-for="option in variantOptions"
                :key="option.key"
                size="xs"
                :variant="selectedVariant === option.key ? 'selected' : 'outline'"
                :aria-pressed="selectedVariant === option.key"
                @click="selectedVariant = option.key"
              >
                {{ option.label }}
              </AppButton>
            </div>
          </fieldset>
        </AppCard>

        <AppCard padding="sm">
          <fieldset>
            <legend class="text-base font-extrabold text-ink">가구 선택</legend>
            <div class="mt-4 grid grid-cols-2 gap-3 min-[380px]:grid-cols-3">
              <label
                v-for="option in furnitureOptions"
                :key="option.key"
                class="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-control border border-line bg-white px-4 text-sm font-bold text-body transition-colors has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary-soft has-[:checked]:text-brand-primary"
              >
                <span>{{ option.label }}</span>
                <input
                  v-model="selectedFurniture"
                  :value="option.key"
                  type="checkbox"
                  class="size-5 accent-brand-primary"
                />
              </label>
            </div>
          </fieldset>

          <section class="mt-6" aria-labelledby="preset-title">
            <h2 id="preset-title" class="text-base font-extrabold text-ink">프리셋</h2>
            <div class="mt-3 flex flex-wrap gap-2">
              <AppButton
                v-for="preset in presets"
                :key="preset.key"
                size="xs"
                :variant="activePresetKey === preset.key ? 'selected' : 'outline'"
                :aria-pressed="activePresetKey === preset.key"
                @click="applyPreset(preset)"
              >
                {{ preset.label }}
              </AppButton>
            </div>
          </section>
        </AppCard>
      </div>
    </div>
  </main>
</template>
