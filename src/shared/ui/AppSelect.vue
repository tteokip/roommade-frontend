<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '선택해 주세요' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
const generatedId = useId()
const selectId = computed(() => props.id || `app-select-${generatedId}`)

function normalizeOption(option) {
  return typeof option === 'object' ? option : { value: option, label: option }
}
</script>

<template>
  <label :for="selectId" class="block">
    <span v-if="label" class="mb-2 block text-sm font-bold text-ink">
      {{ label }}<span v-if="required" class="ml-1 text-danger" aria-hidden="true">*</span>
    </span>
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        class="min-h-13 w-full appearance-none rounded-control border bg-white px-4 pr-11 text-base text-ink outline-none transition-colors focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted"
        :class="error ? 'border-danger' : 'border-line'"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="rawOption in options" :key="String(normalizeOption(rawOption).value)" :value="normalizeOption(rawOption).value" :disabled="normalizeOption(rawOption).disabled">
          {{ normalizeOption(rawOption).label }}
        </option>
      </select>
      <svg class="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <p v-if="error" :id="`${selectId}-error`" class="mt-2 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${selectId}-hint`" class="mt-2 text-xs text-muted">{{ hint }}</p>
  </label>
</template>
