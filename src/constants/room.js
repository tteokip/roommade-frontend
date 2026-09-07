const roomLayerModules = import.meta.glob(
  ['@/assets/room-layer/*.png', '@/assets/room-layer/*/*.png'],
  {
    eager: true,
    import: 'default',
  },
)

const roomThumbnailModules = import.meta.glob('@/assets/room-layer/thumbnails/*/*.png', {
  eager: true,
  import: 'default',
})

export const ROOM_VARIANTS = [
  { key: 'default', label: '기본' },
  { key: 'warm-oak', label: '내추럴 우드' },
  { key: 'cozy-cottage', label: '로맨틱 코티지' },
]

const roomVariantKeys = new Set(ROOM_VARIANTS.map((variant) => variant.key))
const roomVariantLabelByKey = new Map(ROOM_VARIANTS.map((variant) => [variant.key, variant.label]))

export const ROOM_LAYER_DEFINITIONS = [
  {
    key: 'window',
    categoryName: '창문',
    label: '창문',
    assetFileName: 'window-layer.png',
    icon: '🪟',
  },
  {
    key: 'closet',
    categoryName: '옷장',
    label: '옷장',
    assetFileName: 'closet-layer.png',
    icon: '🚪',
  },
  {
    key: 'bed',
    categoryName: '침대',
    label: '침대',
    assetFileName: 'bed-layer-v4.png',
    variantAssetFileName: 'bed-layer.png',
    icon: '🛏️',
  },
  {
    key: 'desk',
    categoryName: '책상',
    label: '책상',
    assetFileName: 'desk-layer.png',
    icon: '🖥️',
  },
  {
    key: 'chair',
    categoryName: '의자',
    label: '의자',
    assetFileName: 'chair-layer.png',
    icon: '🪑',
  },
  {
    key: 'lamp',
    categoryName: '무드등',
    label: '무드등',
    assetFileName: 'lamp-layer.png',
    icon: '💡',
  },
  {
    key: 'plant',
    categoryName: '화분',
    label: '화분',
    assetFileName: 'pot-layer.png',
    icon: '🪴',
  },
]

const roomLayerByKey = new Map(ROOM_LAYER_DEFINITIONS.map((layer) => [layer.key, layer]))
const roomLayerByCategory = new Map(
  ROOM_LAYER_DEFINITIONS.map((layer) => [layer.categoryName, layer]),
)
function getRoomAssetPath(assetUrl) {
  if (!assetUrl) return null

  const normalizedUrl = assetUrl.replaceAll('\\', '/').split(/[?#]/)[0]
  const roomLayerMarker = '/room-layer/'
  const markerIndex = normalizedUrl.lastIndexOf(roomLayerMarker)

  return markerIndex >= 0 ? normalizedUrl.slice(markerIndex + roomLayerMarker.length) : null
}

function getModuleSource(modules, relativePath, marker) {
  if (!relativePath) return null

  const normalizedSuffix = `${marker}/${relativePath}`
  return Object.entries(modules).find(([path]) =>
    path.replaceAll('\\', '/').endsWith(normalizedSuffix),
  )?.[1]
}

function getVariantAssetPath(definition, variant) {
  if (variant === 'default') return definition.assetFileName

  return `${variant}/${definition.variantAssetFileName ?? definition.assetFileName}`
}

function getAssetVariant(assetPath) {
  const variant = assetPath?.split('/')[0]
  return roomVariantKeys.has(variant) ? variant : 'default'
}

export function resolveRoomLayer(furniture, fallbackVariant = 'default') {
  const definition =
    typeof furniture === 'string'
      ? roomLayerByKey.get(furniture)
      : (roomLayerByCategory.get(furniture?.categoryName) ?? roomLayerByKey.get(furniture?.key))
  if (!definition) return null

  const requestedAssetPath =
    typeof furniture === 'string' ? null : getRoomAssetPath(furniture.assetUrl)
  const selectedFallbackVariant =
    typeof furniture === 'object' && furniture?.variant ? furniture.variant : fallbackVariant
  const fallbackAssetPath = getVariantAssetPath(definition, selectedFallbackVariant)
  const assetPath = requestedAssetPath ?? fallbackAssetPath
  const variant = getAssetVariant(assetPath)
  const defaultAssetPath = getVariantAssetPath(definition, 'default')
  const src =
    getModuleSource(roomLayerModules, assetPath, '/room-layer') ??
    getModuleSource(roomLayerModules, defaultAssetPath, '/room-layer')
  const thumbnailSrc = getModuleSource(
    roomThumbnailModules,
    `${variant}/${definition.key}.png`,
    '/room-layer/thumbnails',
  )

  // 백엔드 furniture.name은 "웜 오크 침대"처럼 예전 디자인 세트 이름을 그대로 담고 있을 수 있다.
  // 화면에 보여줄 디자인 세트 이름은 항상 ROOM_VARIANTS 라벨 기준으로 다시 만든다.
  const variantLabel = roomVariantLabelByKey.get(variant)
  const name =
    typeof furniture === 'string'
      ? definition.label
      : variant !== 'default' && variantLabel
        ? `${variantLabel} ${definition.label}`
        : furniture.name

  return {
    ...definition,
    furnitureId: typeof furniture === 'string' ? undefined : furniture.furnitureId,
    name,
    assetPath,
    variant,
    src,
    thumbnailSrc,
  }
}

export function getRoomLayerDefinition(categoryName) {
  return roomLayerByCategory.get(categoryName) ?? null
}
