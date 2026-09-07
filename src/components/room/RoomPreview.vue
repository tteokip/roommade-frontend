<script setup>
import { computed } from 'vue'

import roomImage from '@/assets/room-layer/empty_room.png'
import { ROOM_LAYER_DEFINITIONS, resolveRoomLayer } from '@/constants/room'

import cozyBedImage from '@/assets/room-layer/cozy-cottage/bed-layer.png'
import cozyChairImage from '@/assets/room-layer/cozy-cottage/chair-layer.png'
import cozyClosetImage from '@/assets/room-layer/cozy-cottage/closet-layer.png'
import cozyDeskImage from '@/assets/room-layer/cozy-cottage/desk-layer.png'
import cozyLampImage from '@/assets/room-layer/cozy-cottage/lamp-layer.png'
import cozyPlantImage from '@/assets/room-layer/cozy-cottage/pot-layer.png'
import cozyWindowImage from '@/assets/room-layer/cozy-cottage/window-layer.png'

import oakBedImage from '@/assets/room-layer/warm-oak/bed-layer.png'
import oakChairImage from '@/assets/room-layer/warm-oak/chair-layer.png'
import oakClosetImage from '@/assets/room-layer/warm-oak/closet-layer.png'
import oakDeskImage from '@/assets/room-layer/warm-oak/desk-layer.png'
import oakLampImage from '@/assets/room-layer/warm-oak/lamp-layer.png'
import oakPlantImage from '@/assets/room-layer/warm-oak/pot-layer.png'
import oakWindowImage from '@/assets/room-layer/warm-oak/window-layer.png'

const props = defineProps({
  furniture: {
    type: Array,
    default: () => [],
  },
  // 상점에서 고를 수 있는 가구 디자인 세트. 좌표는 'default' 기준으로 잡혀 있고,
  // 새 세트를 추가할 때는 되도록 같은 좌표(같은 1254x1254 캔버스 안 같은 위치/크기)로 맞춰서
  // room-layer--* 클래스를 그대로 재사용할 수 있게 하는 게 목표다. 원본 좌표가 많이 달라서
  // 그대로 재사용할 수 없는 레이어만 layerTransformOverrides 에 variant별 클래스를 추가한다.
  variant: {
    type: String,
    default: 'default',
  },
})

const variantImages = {
  'cozy-cottage': {
    window: cozyWindowImage,
    closet: cozyClosetImage,
    bed: cozyBedImage,
    desk: cozyDeskImage,
    chair: cozyChairImage,
    lamp: cozyLampImage,
    plant: cozyPlantImage,
  },
  'warm-oak': {
    window: oakWindowImage,
    closet: oakClosetImage,
    bed: oakBedImage,
    desk: oakDeskImage,
    chair: oakChairImage,
    lamp: oakLampImage,
    plant: oakPlantImage,
  },
}

// variant 원본이 default와 같은 좌표로 그려지지 않은 레이어만 여기에 전용 클래스를 추가한다.
// 없는 레이어는 room-layer--{key} 공용 클래스를 그대로 쓴다.
const layerTransformOverrides = {
  'cozy-cottage': {
    bed: 'room-layer--bed-cozy-cottage',
  },
  'warm-oak': {
    bed: 'room-layer--bed-warm-oak',
    chair: 'room-layer--chair-warm-oak',
    closet: 'room-layer--closet-warm-oak',
    desk: 'room-layer--desk-warm-oak',
    lamp: 'room-layer--lamp-warm-oak',
    plant: 'room-layer--plant-warm-oak',
    window: 'room-layer--window-warm-oak',
  },
}

const activeImages = computed(() => variantImages[props.variant] ?? null)

const activeOverrides = computed(() => layerTransformOverrides[props.variant] ?? {})

const chairShadowClass = computed(() =>
  props.variant === 'warm-oak' ? 'chair-leg-shadow chair-leg-shadow--warm-oak' : 'chair-leg-shadow',
)

const visibleLayers = computed(() => {
  const selectedLayers = new Map()

  props.furniture.forEach((furniture) => {
    if (typeof furniture === 'object' && furniture.placed === false) return

    const layer = resolveRoomLayer(furniture)
    if (layer) {
      selectedLayers.set(layer.key, {
        ...layer,
        src: activeImages.value?.[layer.key] ?? layer.src,
        layerClass: activeOverrides.value[layer.key] ?? `room-layer--${layer.key}`,
      })
    }
  })

  return ROOM_LAYER_DEFINITIONS.map((definition) => selectedLayers.get(definition.key)).filter(
    Boolean,
  )
})

const selectedFurniture = computed(() => new Set(visibleLayers.value.map((layer) => layer.key)))
const chairLayer = computed(() => visibleLayers.value.find((layer) => layer.key === 'chair'))

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
        v-if="chairLayer"
        key="chair-floor-shadow"
        :src="chairLayer.src"
        :class="chairShadowClass"
        aria-hidden="true"
        alt=""
        draggable="false"
      />

      <img
        v-for="layer in visibleLayers"
        :key="layer.furnitureId ?? layer.key"
        :src="layer.src"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        :class="layer.layerClass"
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

.room-layer--bed-cozy-cottage {
  transform: translate(4.06%, 7.47%) scale(1.122, 1.233);
  transform-origin: 51.1% 77.8%;
}

.room-layer--bed-warm-oak {
  transform: translate(8.3%, 12.4%) scale(1.31, 1.34);
  transform-origin: 51.1% 77.8%;
}

.room-layer--lamp {
  filter: drop-shadow(-2px 3px 2px rgb(91 71 57 / 18%));
  transform: translate(-8%, 10%) scale(0.9);
  transform-origin: center;
}

.room-layer--lamp-warm-oak {
  filter: drop-shadow(-2px 3px 2px rgb(91 71 57 / 18%));
  transform: translate(-6.24%, 9.12%) scale(0.893, 0.803);
  transform-origin: center;
}

.room-layer--plant {
  filter: drop-shadow(4px 1px 2px rgb(91 71 57 / 32%)) drop-shadow(0 5px 2px rgb(91 71 57 / 28%))
    drop-shadow(4px 6px 4px rgb(91 71 57 / 14%));
  transform: translate(24.5%, -5.6%) scale(0.46);
  transform-origin: center;
}

.room-layer--plant-warm-oak {
  filter: drop-shadow(4px 1px 2px rgb(91 71 57 / 32%)) drop-shadow(0 5px 2px rgb(91 71 57 / 28%))
    drop-shadow(4px 6px 4px rgb(91 71 57 / 14%));
  transform: translate(23.91%, -11.41%) scale(0.475, 0.529);
  transform-origin: center;
}

.room-layer--closet {
  filter: drop-shadow(3px 1px 2px rgb(91 71 57 / 24%)) drop-shadow(5px 2px 5px rgb(91 71 57 / 9%))
    drop-shadow(-2px 4px 3px rgb(91 71 57 / 12%));
  transform: translate(-20.5%, -2.25%) scale(0.92);
  transform-origin: center;
}

.room-layer--closet-warm-oak {
  filter: drop-shadow(3px 1px 2px rgb(91 71 57 / 24%)) drop-shadow(5px 2px 5px rgb(91 71 57 / 9%))
    drop-shadow(-2px 4px 3px rgb(91 71 57 / 12%));
  transform: translate(-20.49%, 1.32%) scale(0.93, 1.011);
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

.room-layer--desk-warm-oak {
  filter: drop-shadow(2px 3px 2px rgb(91 71 57 / 18%));
  transform: translate(-0.05%, -5.78%) matrix(0.868, 0.0784, 0, 0.992, 0, 0);
  transform-origin: 90% 67%;
}

.room-layer--chair {
  transform: translate(-8%, -3.5%) matrix(0.72, 0.065, 0, 0.72, 0, 0);
}

.room-layer--chair-warm-oak {
  transform: translate(-2.74%, -11.25%) matrix(0.931, 0.0841, 0, 1.013, 0, 0);
  transform-origin: 90% 67%;
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

.chair-leg-shadow--warm-oak {
  transform: translate(-2.74%, -11.25%) matrix(0.931, 0.0841, 0, 1.013, 0, 0);
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

.room-layer--window-warm-oak {
  filter: drop-shadow(-2px 3px 2px rgb(91 71 57 / 28%))
    drop-shadow(-5px 7px 6px rgb(91 71 57 / 14%));
  transform: translate(-1.8%, -0.13%) matrix(0.951, -0.1387, 0, 0.807, 0, 0);
  transform-origin: 29.5% 33.6%;
}

@media (prefers-reduced-motion: reduce) {
  .room-layer-enter-active,
  .room-layer-leave-active {
    transition: none;
  }
}
</style>
