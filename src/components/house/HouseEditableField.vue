<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  required: { type: Boolean, default: false },
  displayText: { type: String, default: '' },
  isEmpty: { type: Boolean, default: false },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
})

const emit = defineEmits(['expand', 'collapse'])

const editContainer = ref(null)

watch(
  () => props.error,
  (value) => {
    if (value && !props.editing) emit('expand')
  },
)

watch(
  () => props.editing,
  async (value) => {
    if (!value) return
    await nextTick()
    editContainer.value?.querySelector('input, button, select, textarea')?.focus()
  },
  { immediate: true },
)

function expand() {
  if (props.disabled) return
  emit('expand')
}

function handleFocusOut(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return
  emit('collapse')
}

function handleEnter(event) {
  event.target.blur?.()
}
</script>

<template>
  <div class="border-b border-line py-3 last:border-b-0">
    <template v-if="!editing">
      <div
        role="button"
        tabindex="0"
        class="flex cursor-pointer items-center justify-between gap-3"
        @click="expand"
        @keydown.enter="expand"
      >
        <span class="shrink-0 text-sm font-bold text-body">
          <span v-if="icon" aria-hidden="true">{{ icon }}</span>
          {{ label }}<span v-if="required" class="ml-1 text-danger" aria-hidden="true">*</span>
        </span>
        <span
          class="flex min-w-0 items-center gap-1.5 text-right text-sm"
          :class="error ? 'font-bold text-danger' : isEmpty ? 'text-muted' : 'font-bold text-ink'"
        >
          <span class="truncate">{{ displayText }}</span>
          <svg
            class="size-3.5 shrink-0 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path
              d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
      <p v-if="error" class="mt-1 text-right text-sm font-medium text-danger">{{ error }}</p>
    </template>

    <div v-else ref="editContainer" @focusout="handleFocusOut" @keydown.enter="handleEnter">
      <p class="mb-2 text-sm font-bold text-ink">
        <span v-if="icon" aria-hidden="true">{{ icon }}</span>
        {{ label }}<span v-if="required" class="ml-1 text-danger" aria-hidden="true">*</span>
      </p>
      <slot />
    </div>
  </div>
</template>
