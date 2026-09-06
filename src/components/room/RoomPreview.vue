<script setup>
import { computed } from 'vue'

import bedImage from '@/assets/room-layer/bed-layer-v4.png'
import chairImage from '@/assets/room-layer/chair-layer.png'
import closetImage from '@/assets/room-layer/closet-layer.png'
import deskImage from '@/assets/room-layer/desk-layer.png'
import lampImage from '@/assets/room-layer/lamp-layer.png'
import plantImage from '@/assets/room-layer/pot-layer.png'
import roomImage from '@/assets/room-layer/empty_room.png'
import windowImage from '@/assets/room-layer/window-layer.png'

const props = defineProps({
  furniture: {
    type: Array,
    default: () => [],
  },
})

const layers = [
  { key: 'window', label: '창문', src: windowImage },
  { key: 'closet', label: '옷장', src: closetImage },
  { key: 'bed', label: '침대', src: bedImage },
  { key: 'desk', label: '책상', src: deskImage },
  { key: 'chair', label: '의자', src: chairImage },
  { key: 'lamp', label: '조명', src: lampImage },
  { key: 'plant', label: '화분', src: plantImage },
]

const selectedFurniture = computed(() => new Set(props.furniture))

const visibleLayers = computed(() =>
  layers.filter((layer) => selectedFurniture.value.has(layer.key)),
)

const roomDescription = computed(() => {
  const labels = visibleLayers.value.map((layer) => layer.label)

  return labels.length ? `${labels.join(', ')}가 배치된 방` : '가구가 없는 빈 방'
})
</script>

<template>
  <div
    class="relative aspect-square w-full overflow-hidden rounded-card bg-slate-100"
    role="img"
    :aria-label="roomDescription"
  >
    <img
      :src="roomImage"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
      draggable="false"
    />

    <TransitionGroup name="room-layer">
      <span
        v-if="selectedFurniture.has('desk')"
        key="desk-floor-shadow"
        class="desk-floor-shadow"
        aria-hidden="true"
      />
      <img
        v-if="selectedFurniture.has('chair')"
        key="chair-floor-shadow"
        :src="chairImage"
        class="chair-leg-shadow"
        aria-hidden="true"
        alt=""
        draggable="false"
      />

      <img
        v-for="layer in visibleLayers"
        :key="layer.key"
        :src="layer.src"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        :class="{
          'room-layer--bed': layer.key === 'bed',
          'room-layer--chair': layer.key === 'chair',
          'room-layer--closet': layer.key === 'closet',
          'room-layer--desk': layer.key === 'desk',
          'room-layer--lamp': layer.key === 'lamp',
          'room-layer--plant': layer.key === 'plant',
          'room-layer--window': layer.key === 'window',
        }"
        draggable="false"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.room-layer-enter-active,
.room-layer-leave-active {
  transition: opacity 150ms ease;
}

.room-layer-enter-from,
.room-layer-leave-to {
  opacity: 0;
}

.room-layer--bed {
  transform: translate(9.2%, 9.65%) scale(1.34);
  transform-origin: 51.1% 77.8%;
}

.room-layer--lamp {
  filter: drop-shadow(-2px 3px 2px rgb(91 71 57 / 18%));
  transform: translate(-8%, 10%) scale(0.9);
  transform-origin: center;
}

.room-layer--plant {
  filter: drop-shadow(4px 1px 2px rgb(91 71 57 / 32%)) drop-shadow(0 5px 2px rgb(91 71 57 / 28%))
    drop-shadow(4px 6px 4px rgb(91 71 57 / 14%));
  transform: translate(24.5%, -5.6%) scale(0.46);
  transform-origin: center;
}

.room-layer--closet {
  filter: drop-shadow(3px 1px 2px rgb(91 71 57 / 24%)) drop-shadow(5px 2px 5px rgb(91 71 57 / 9%))
    drop-shadow(-2px 4px 3px rgb(91 71 57 / 12%));
  transform: translate(-20.5%, -2.25%) scale(0.92);
  transform-origin: center;
}

.room-layer--chair,
.room-layer--desk {
  transform: translateY(1.5%) matrix(0.72, 0.065, 0, 0.72, 0, 0);
  transform-origin: 90% 67%;
}

.room-layer--desk {
  filter: drop-shadow(2px 3px 2px rgb(91 71 57 / 18%));
}

.room-layer--chair {
  transform: translate(-8%, -3.5%) matrix(0.72, 0.065, 0, 0.72, 0, 0);
}

.chair-leg-shadow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  object-fit: contain;
  clip-path: inset(72% 13% 8% 57%);
  filter: brightness(0) opacity(30%) blur(2px);
  transform: translate(-7.6%, -2.2%) matrix(0.72, 0.065, 0, 0.72, 0, 0);
  transform-origin: 90% 67%;
}

.desk-floor-shadow {
  position: absolute;
  top: 56%;
  left: 61%;
  width: 31%;
  height: 14.5%;
  pointer-events: none;
  background: radial-gradient(
    ellipse at 52% 48%,
    rgb(91 71 57 / 25%) 0%,
    rgb(91 71 57 / 23%) 52%,
    rgb(91 71 57 / 16%) 78%,
    rgb(91 71 57 / 5%) 100%
  );
  clip-path: polygon(32% 0, 100% 48%, 68% 100%, 0 52%);
  filter: blur(7px);
}

.room-layer--window {
  filter: drop-shadow(-2px 3px 2px rgb(91 71 57 / 28%))
    drop-shadow(-5px 7px 6px rgb(91 71 57 / 14%));
  transform: translate(-1.8%, -2.2%) matrix(0.96, -0.14, 0, 0.7, 0, 0);
  transform-origin: 29.5% 33.6%;
}

@media (prefers-reduced-motion: reduce) {
  .room-layer-enter-active,
  .room-layer-leave-active {
    transition: none;
  }
}
</style>
