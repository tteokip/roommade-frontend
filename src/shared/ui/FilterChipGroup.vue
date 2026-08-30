<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const normalizedOptions = computed(() => props.options.map((option) => (
  typeof option === 'object' ? option : { value: option, label: option }
)))

function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggle(option) {
  if (option.disabled) return

  if (!props.multiple) {
    emit('update:modelValue', isSelected(option.value) ? [] : [option.value])
    return
  }

  emit(
    'update:modelValue',
    isSelected(option.value)
      ? props.modelValue.filter((value) => value !== option.value)
      : [...props.modelValue, option.value],
  )
}
</script>

<template>
  <fieldset>
    <legend v-if="label" class="mb-3 text-sm font-bold text-ink">{{ label }}</legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in normalizedOptions"
        :key="String(option.value)"
        type="button"
        class="rounded-pill border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="isSelected(option.value) ? 'border-brand-primary bg-brand-primary text-white' : 'border-line bg-white text-body hover:border-brand-primary/50'"
        :aria-pressed="isSelected(option.value)"
        :disabled="option.disabled"
        @click="toggle(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>
