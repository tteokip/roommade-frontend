<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const dialog = ref(null)
const closeButton = ref(null)
let previouslyFocusedElement = null

function close() {
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab') return
  const focusableElements = dialog.value?.querySelectorAll(
    'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )
  if (!focusableElements?.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocusedElement = document.activeElement
      await nextTick()
      closeButton.value?.focus()
      return
    }

    await nextTick()
    previouslyFocusedElement?.focus?.()
    previouslyFocusedElement = null
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-40 bg-slate-950/30" @click.self="close">
        <Transition name="sheet">
          <section
            v-if="modelValue"
            ref="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="밸런스게임"
            class="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] min-h-[75dvh] w-full max-w-md flex-col rounded-t-[28px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5 shadow-2xl"
            @keydown="handleKeydown"
          >
            <div class="mx-auto h-1 w-10 shrink-0 rounded-pill bg-slate-200" />
            <button
              ref="closeButton"
              type="button"
              aria-label="닫기"
              class="absolute right-4 top-12 grid size-10 place-items-center text-muted"
              @click="close"
            >
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>
            <div class="mt-8 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div class="w-full pb-4"><slot /></div>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
