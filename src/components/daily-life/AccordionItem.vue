<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const internalOpen = ref(props.defaultOpen)
const isOpen = computed({
  get: () => (props.modelValue === undefined ? internalOpen.value : props.modelValue),
  set: (value) => {
    if (props.modelValue === undefined) {
      internalOpen.value = value
    } else {
      emit('update:modelValue', value)
    }
  },
})

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 text-left"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <slot name="trigger" :open="isOpen" />
    </button>
    <div v-show="isOpen">
      <slot :open="isOpen" />
    </div>
  </div>
</template>
