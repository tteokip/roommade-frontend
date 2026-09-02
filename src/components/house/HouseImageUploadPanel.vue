<script setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_COUNT = 3

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputId = `house-image-upload-${useId()}`
const fileInput = ref(null)
const rejectionMessage = ref('')

const previewItems = ref([])

watch(
  () => props.modelValue,
  (images) => {
    previewItems.value.forEach((item) => URL.revokeObjectURL(item.url))
    previewItems.value = images.map((file) => ({ file, url: URL.createObjectURL(file) }))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  previewItems.value.forEach((item) => URL.revokeObjectURL(item.url))
})

function openFilePicker() {
  if (props.disabled) return
  fileInput.value?.click()
}

function handleFileChange(event) {
  const files = Array.from(event.target.files ?? [])
  event.target.value = ''
  if (files.length === 0) return

  const remainingSlots = MAX_COUNT - props.modelValue.length
  const supported = files.filter((file) => SUPPORTED_TYPES.includes(file.type) && file.size > 0)
  const accepted = supported.slice(0, remainingSlots)

  rejectionMessage.value =
    supported.length < files.length
      ? '지원하지 않는 이미지 형식이 있어 제외했어요.'
      : accepted.length < supported.length
        ? `사진은 최대 ${MAX_COUNT}장까지만 담을 수 있어요.`
        : ''

  if (accepted.length === 0) return
  emit('update:modelValue', [...props.modelValue, ...accepted])
}

function removeImage(index) {
  if (props.disabled) return
  rejectionMessage.value = ''
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}
</script>

<template>
  <div>
    <input
      :id="inputId"
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="sr-only"
      :disabled="disabled || modelValue.length >= MAX_COUNT"
      @change="handleFileChange"
    />

    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="(item, index) in previewItems"
        :key="item.url"
        class="relative aspect-square overflow-hidden rounded-control border border-line"
      >
        <img :src="item.url" :alt="`매물 사진 ${index + 1}`" class="size-full object-cover" />
        <button
          type="button"
          aria-label="사진 삭제"
          class="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-950/60 text-xs font-bold text-white"
          :disabled="disabled"
          @click="removeImage(index)"
        >
          ×
        </button>
      </div>

      <button
        v-if="modelValue.length < MAX_COUNT"
        type="button"
        class="flex aspect-square flex-col items-center justify-center gap-1 rounded-control border border-dashed border-line text-muted transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled"
        @click="openFilePicker"
      >
        <span class="text-xl" aria-hidden="true">📷</span>
        <span class="text-xs font-bold">{{ modelValue.length }}/{{ MAX_COUNT }}</span>
      </button>
    </div>

    <p v-if="rejectionMessage" class="mt-2 text-sm font-medium text-danger">
      {{ rejectionMessage }}
    </p>
    <p v-else class="mt-2 text-sm text-muted">사진은 최대 {{ MAX_COUNT }}장까지 올릴 수 있어요.</p>
  </div>
</template>
