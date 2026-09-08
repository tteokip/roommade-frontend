<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ZodError } from 'zod'

import { login } from '@/api/user'
import roommadeMark from '@/assets/roommade-mark.svg'
import { hasCompletedMyDataOnboarding, rememberCurrentUser } from '@/utils/mydataOnboarding'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const passwordInputType = computed(() => (showPassword.value ? 'text' : 'password'))

function getErrorMessage(error) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? '입력값을 다시 확인해주세요.'
  }

  if (error.response?.status === 401) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

async function submitLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await login({ email: email.value, password: password.value })
    rememberCurrentUser(email.value)

    const nextRoute = hasCompletedMyDataOnboarding(email.value)
      ? { name: 'home' }
      : { name: 'mydata-connect' }
    await router.push(nextRoute)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

async function goToSignup() {
  await router.push({ name: 'signup-info' })
}
</script>

<template>
  <main class="min-h-screen bg-[#fcfbff] px-6 py-14 text-[#17112d] sm:px-10">
    <section class="mx-auto flex w-full max-w-[470px] flex-col">
      <header class="text-center">
        <div class="mx-auto size-28" aria-hidden="true">
          <img :src="roommadeMark" alt="" class="size-full object-contain" />
        </div>
        <h1 class="mt-3 text-[3rem] font-black tracking-[-0.11em]">룸메이드</h1>
        <p class="mt-3 text-lg font-medium tracking-[-0.04em] text-[#9ca3b3]">
          당신의 독립, <strong class="font-bold text-[#7c3aed]">룸메이드</strong>가 함께 준비해요.
        </p>
      </header>

      <section class="mt-16">
        <h2 class="text-4xl font-extrabold tracking-[-0.06em]">로그인</h2>
        <p class="mt-4 text-xl text-[#7d8493]">룸메이드 계정으로 로그인해 주세요.</p>

        <form class="mt-12 space-y-4" @submit.prevent="submitLogin">
          <label class="block">
            <span class="sr-only">이메일</span>
            <span
              class="flex h-20 items-center rounded-[1.8rem] border-2 border-[#e5e7eb] bg-white px-6 focus-within:border-[#8b3dff]"
            >
              <svg
                viewBox="0 0 24 24"
                class="mr-4 h-7 w-7 shrink-0 fill-none stroke-[#9ca3b3] stroke-[1.8]"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                maxlength="255"
                required
                placeholder="이메일을 입력하세요"
                class="min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-[#a2a8b4]"
              />
            </span>
          </label>

          <label class="block">
            <span class="sr-only">비밀번호</span>
            <span
              class="flex h-20 items-center rounded-[1.8rem] border-2 border-[#e5e7eb] bg-white px-6 focus-within:border-[#8b3dff]"
            >
              <svg
                viewBox="0 0 24 24"
                class="mr-4 h-7 w-7 shrink-0 fill-none stroke-[#9ca3b3] stroke-[1.8]"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                v-model="password"
                :type="passwordInputType"
                autocomplete="current-password"
                maxlength="64"
                required
                placeholder="비밀번호를 입력하세요"
                class="min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-[#a2a8b4]"
              />
              <button
                type="button"
                class="ml-3 flex h-10 w-10 items-center justify-center rounded-full text-[#a2a8b4] hover:bg-[#f2efff] hover:text-[#7c3aed]"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
                @click="showPassword = !showPassword"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-7 w-7 fill-none stroke-current stroke-[1.8]"
                  aria-hidden="true"
                >
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </span>
          </label>

          <p v-if="errorMessage" class="px-2 text-sm font-medium text-[#d14343]" role="alert">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="mt-6 h-20 w-full rounded-[1.8rem] bg-gradient-to-r from-[#8338f4] to-[#7629dc] text-2xl font-bold text-white shadow-[0_14px_25px_rgba(124,58,237,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="my-7 flex items-center gap-4 text-base text-[#a2a8b4]" aria-hidden="true">
          <span class="h-px flex-1 bg-[#e5e7eb]" />
          <span>또는</span>
          <span class="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        <button
          type="button"
          class="flex h-20 w-full items-center justify-between gap-3 rounded-[1.8rem] border-2 border-[#e5e7eb] bg-white px-6 text-base text-[#7d8493] transition hover:border-[#c6a5ff]"
          @click="goToSignup"
        >
          <span class="whitespace-nowrap">룸메이드가 처음이신가요?</span>
          <span class="shrink-0 whitespace-nowrap font-bold text-[#7c3aed]"
            >회원가입하기&nbsp; ›</span
          >
        </button>
      </section>
    </section>
  </main>
</template>
