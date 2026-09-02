<script setup>
defineProps({
  title: { type: String, default: '' },
  modelValue: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 bg-slate-950/30"
        @click.self="closeOnBackdrop && close()"
      >
        <Transition name="sheet">
          <section
            v-if="modelValue"
            class="absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >
            <div class="mx-auto h-1 w-10 rounded-pill bg-slate-200" />
            <header v-if="title" class="mt-5 flex items-center justify-between">
              <h2 class="text-xl font-extrabold text-ink">{{ title }}</h2>
              <button type="button" aria-label="닫기" class="text-muted" @click="close">×</button>
            </header>
            <div class="mt-5"><slot /></div>
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
