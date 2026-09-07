<script setup>
import { nextTick, ref } from 'vue'
import { toPng } from 'html-to-image'

import RoomPreview from '@/components/room/RoomPreview.vue'
import { BottomSheet } from '@/shared/ui'
import { shareRoomToKakao } from '@/utils/kakaoShare'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  furniture: { type: Array, default: () => [] },
  readinessScore: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

const shareCard = ref(null)
const isCreatingImage = ref(false)
const feedbackMessage = ref('')

function close() {
  emit('update:modelValue', false)
}

async function createRoomImage() {
  await nextTick()

  await document.fonts?.ready
  const images = [...shareCard.value.querySelectorAll('img')]
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', resolve, { once: true })
      })
    }),
  )

  const dataUrl = await toPng(shareCard.value, {
    backgroundColor: '#ffffff',
    cacheBust: true,
    pixelRatio: 1,
  })
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  return {
    dataUrl,
    file: new File([blob], 'roommade-my-room.png', { type: 'image/png' }),
  }
}

function downloadDataUrl(dataUrl) {
  const link = document.createElement('a')
  link.download = 'roommade-my-room.png'
  link.href = dataUrl
  link.click()
}

function canOpenKakaoTalkApp() {
  if (navigator.userAgentData?.mobile) return true

  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    /Windows/i.test(navigator.userAgent)
  )
}

async function downloadImage() {
  if (isCreatingImage.value) return
  isCreatingImage.value = true
  feedbackMessage.value = ''

  try {
    const { dataUrl } = await createRoomImage()
    downloadDataUrl(dataUrl)
    feedbackMessage.value = '내 방 이미지를 저장했어요.'
  } catch {
    feedbackMessage.value = '이미지를 만들지 못했어요. 다시 시도해 주세요.'
  } finally {
    isCreatingImage.value = false
  }
}

async function shareRoom(channel) {
  if (isCreatingImage.value) return
  isCreatingImage.value = true
  feedbackMessage.value = ''

  try {
    const { dataUrl, file } = await createRoomImage()

    if (channel === '카카오톡') {
      if (!canOpenKakaoTalkApp()) {
        downloadDataUrl(dataUrl)
        feedbackMessage.value = '이 기기에서는 카카오톡 앱을 열 수 없어 이미지를 대신 저장했어요.'
        return
      }

      await shareRoomToKakao(file, props.readinessScore)
      feedbackMessage.value = '카카오톡에서 공유할 대상을 선택해 주세요.'
      return
    }

    const shareData = {
      title: '룸메이드에서 꾸민 내 방',
      text: `내가 꾸민 나만의 방이에요! 자립 준비도 ${Math.round(props.readinessScore)}%`,
      files: [file],
    }

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share(shareData)
      feedbackMessage.value = `${channel}에서 공유할 앱을 선택해 주세요.`
      return
    }

    downloadDataUrl(dataUrl)
    feedbackMessage.value = '이미지를 저장했어요. 앱에서 이미지를 선택해 공유해 주세요.'
  } catch (error) {
    if (error?.name !== 'AbortError') {
      feedbackMessage.value = '공유 화면을 열지 못했어요. 다시 시도해 주세요.'
    }
  } finally {
    isCreatingImage.value = false
  }
}
</script>

<template>
  <BottomSheet
    :model-value="modelValue"
    :close-on-backdrop="!isCreatingImage"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="relative pb-1">
      <button
        type="button"
        class="absolute -right-1 -top-3 z-10 grid size-10 place-items-center rounded-full bg-slate-100 text-2xl text-muted"
        aria-label="공유 화면 닫기"
        @click="close"
      >
        ×
      </button>

      <header class="px-10 text-center">
        <h2 class="text-2xl font-black text-ink">내 방 공유하기</h2>
        <p class="mt-1 text-sm font-medium text-muted">내가 꾸민 방을 친구들에게 자랑해보세요!</p>
      </header>

      <div
        ref="shareCard"
        class="mt-5 rounded-[24px] border border-brand-primary/25 bg-white p-4 shadow-sm"
      >
        <div>
          <strong class="text-xl font-black text-brand-primary">룸메이드</strong>
        </div>

        <div class="mt-3 overflow-hidden rounded-[20px]">
          <RoomPreview :furniture="furniture" />
        </div>

        <p class="mt-4 text-center text-lg font-extrabold text-ink">
          내가 꾸민 나만의 방이에요! ✨
        </p>
      </div>

      <section
        class="mt-4 rounded-[22px] border border-line px-4 py-4"
        aria-labelledby="share-method-title"
      >
        <h3 id="share-method-title" class="text-center text-base font-extrabold text-body">
          공유 방법 선택
        </h3>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex flex-col items-center gap-2 text-sm font-bold text-body"
            @click="shareRoom('카카오톡')"
          >
            <span
              class="grid size-14 place-items-center rounded-full bg-[#FEE500]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 48 48" class="size-9 fill-[#191919]">
                <path
                  d="M24 8C13.5 8 5 14.7 5 23c0 5.3 3.5 9.9 8.8 12.6L11.6 43l8.5-5.2c1.3.2 2.6.3 3.9.3 10.5 0 19-6.7 19-15.1S34.5 8 24 8Z"
                />
              </svg>
            </span>
            카카오톡
          </button>

          <button
            type="button"
            class="flex flex-col items-center gap-2 text-sm font-bold text-body"
            @click="shareRoom('더 보기')"
          >
            <span
              class="grid size-14 place-items-center rounded-full bg-brand-primary-soft text-2xl font-black text-body"
              aria-hidden="true"
              >•••</span
            >
            더 보기
          </button>
        </div>
      </section>

      <button
        type="button"
        class="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-control border border-brand-primary/40 bg-brand-primary-soft text-base font-extrabold text-brand-primary disabled:opacity-60"
        :disabled="isCreatingImage"
        @click="downloadImage"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-6 fill-none stroke-current"
          stroke-width="2.2"
          aria-hidden="true"
        >
          <path
            d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ isCreatingImage ? '이미지 만드는 중...' : '이미지 저장하기' }}
      </button>
      <p class="mt-2 min-h-5 text-center text-xs font-medium text-muted" role="status">
        {{ feedbackMessage || '저장된 이미지는 다운로드 폴더에서 확인할 수 있어요.' }}
      </p>
    </div>
  </BottomSheet>
</template>
