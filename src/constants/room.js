import bedImage from '@/assets/room-layer/bed-layer-v4.png'
import chairImage from '@/assets/room-layer/chair-layer.png'
import closetImage from '@/assets/room-layer/closet-layer.png'
import deskImage from '@/assets/room-layer/desk-layer.png'
import lampImage from '@/assets/room-layer/lamp-layer.png'
import plantImage from '@/assets/room-layer/pot-layer.png'
import windowImage from '@/assets/room-layer/window-layer.png'

export const ROOM_LAYER_DEFINITIONS = [
  {
    key: 'window',
    categoryName: '창문',
    label: '창문',
    assetFileName: 'window-layer.png',
    src: windowImage,
    icon: '🪟',
  },
  {
    key: 'closet',
    categoryName: '옷장',
    label: '옷장',
    assetFileName: 'closet-layer.png',
    src: closetImage,
    icon: '🚪',
  },
  {
    key: 'bed',
    categoryName: '침대',
    label: '침대',
    assetFileName: 'bed-layer-v4.png',
    src: bedImage,
    icon: '🛏️',
  },
  {
    key: 'desk',
    categoryName: '책상',
    label: '책상',
    assetFileName: 'desk-layer.png',
    src: deskImage,
    icon: '🖥️',
  },
  {
    key: 'chair',
    categoryName: '의자',
    label: '의자',
    assetFileName: 'chair-layer.png',
    src: chairImage,
    icon: '🪑',
  },
  {
    key: 'lamp',
    categoryName: '무드등',
    label: '무드등',
    assetFileName: 'lamp-layer.png',
    src: lampImage,
    icon: '💡',
  },
  {
    key: 'plant',
    categoryName: '화분',
    label: '화분',
    assetFileName: 'pot-layer.png',
    src: plantImage,
    icon: '🪴',
  },
]

const roomLayerByKey = new Map(ROOM_LAYER_DEFINITIONS.map((layer) => [layer.key, layer]))
const roomLayerByCategory = new Map(
  ROOM_LAYER_DEFINITIONS.map((layer) => [layer.categoryName, layer]),
)
const roomAssetByFileName = new Map(
  ROOM_LAYER_DEFINITIONS.map((layer) => [layer.assetFileName, layer.src]),
)

function getAssetFileName(assetUrl) {
  if (!assetUrl) return null

  return assetUrl.split(/[\\/]/).pop()?.split(/[?#]/)[0] ?? null
}

export function resolveRoomLayer(furniture) {
  if (typeof furniture === 'string') return roomLayerByKey.get(furniture) ?? null

  // 백엔드 연동 전 프런트 목업(예: 방 꾸미기 모드)에서 { key, variant } 형태로 넘기는 경우.
  if (furniture?.key && !furniture?.categoryName) {
    return roomLayerByKey.get(furniture.key) ?? null
  }

  const definition = roomLayerByCategory.get(furniture?.categoryName)
  if (!definition) return null

  const assetFileName = getAssetFileName(furniture.assetUrl)

  return {
    ...definition,
    furnitureId: furniture.furnitureId,
    name: furniture.name,
    src: roomAssetByFileName.get(assetFileName) ?? definition.src,
  }
}

export function getRoomLayerDefinition(categoryName) {
  return roomLayerByCategory.get(categoryName) ?? null
}
