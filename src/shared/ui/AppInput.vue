<script setup>
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const generatedId = useId()
const inputId = computed(() => props.id || `app-input-${generatedId}`)

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label :for="inputId" class="block">
    <span v-if="label" class="mb-2 block text-sm font-bold text-ink">
      {{ label }}<span v-if="required" class="ml-1 text-danger" aria-hidden="true">*</span>
    </span>
    <div
      class="flex min-h-13 items-center rounded-control border bg-white px-4 transition-colors focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10"
      :class="error ? 'border-danger' : 'border-line'"
    >
      <input
        :id="inputId"
        :value="modelValue"
        class="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:text-muted"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        v-bind="$attrs"
        @input="updateValue"
      />
      <slot name="suffix" />
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="mt-2 text-xs font-medium text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="mt-2 text-xs text-muted">{{ hint }}</p>
  </label>
</template>
