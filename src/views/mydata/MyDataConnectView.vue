<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { completeMyDataOnboardingForCurrentUser } from '@/utils/mydataOnboarding'

const router = useRouter()
const step = ref('intro')
const isConnecting = ref(false)
const selectedAccountIds = ref([])

const accounts = [
  {
    id: 1,
    bank: 'KB국민은행',
    name: 'KB마이핏통장',
    number: '123456-**-789012',
    balance: 8450000,
    color: '#ffcc32',
    initials: 'KB',
  },
  {
    id: 2,
    bank: '신한은행',
    name: '쏠편한 입출금통장',
    number: '110-***-456789',
    balance: 2380000,
    color: '#4b7df3',
    initials: '신한',
  },
  {
    id: 3,
    bank: '카카오뱅크',
    name: '입출금통장',
    number: '3333-**-1234567',
    balance: 1120000,
    color: '#ffe500',
    initials: 'k',
  },
]

const canComplete = computed(() => selectedAccountIds.value.length > 0)

function startConnection() {
  if (isConnecting.value) return
  isConnecting.value = true

  // 실제 마이데이터 인증 API 연동 시 이 부분을 인증 결과 처리로 교체한다.
  window.setTimeout(() => {
    isConnecting.value = false
    step.value = 'accounts'
  }, 700)
}

function toggleAccount(id) {
  if (selectedAccountIds.value.includes(id)) {
    selectedAccountIds.value = selectedAccountIds.value.filter((accountId) => accountId !== id)
  } else {
    selectedAccountIds.value.push(id)
  }
}

function completeSelection() {
  if (!canComplete.value) return
  completeMyDataOnboardingForCurrentUser()
  step.value = 'complete'
}

function goHome() {
  router.push('/home')
}
</script>

<template>
  <main class="mydata-page">
    <header class="page-header">
      <button
        v-if="step === 'accounts'"
        type="button"
        class="back-button"
        aria-label="이전 화면"
        @click="step = 'intro'"
      >
        <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <h1>마이데이터 연동</h1>
    </header>

    <div v-if="step !== 'complete'" class="step-indicator" aria-label="마이데이터 연동 진행 단계">
      <div class="step-item active">
        <span>1</span>
        <small>정보 연동</small>
      </div>
      <div class="step-line" :class="{ active: step === 'accounts' }"></div>
      <div class="step-item" :class="{ active: step === 'accounts' }">
        <span>2</span>
        <small>계좌 선택</small>
      </div>
    </div>

    <section v-if="step === 'intro'" class="intro-view">
      <div class="hero-graphic" aria-hidden="true">
        <div class="link-ring ring-left">
          <svg viewBox="0 0 24 24">
            <path d="M4 10.5 12 4l8 6.5V20H4Z" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </div>
        <span class="link-dots"><i></i><i></i><i></i></span>
        <div class="link-ring ring-right">
          <svg viewBox="0 0 24 24">
            <path d="M4 8h16M6 8V5h12v3M6 8v11M18 8v11M3 19h18M9 12v3M15 12v3" />
          </svg>
        </div>
      </div>

      <div class="intro-copy">
        <span class="eyebrow">나의 독립 준비, 한눈에</span>
        <h2>흩어진 금융 정보를<br /><em>한 번에 연결해요</em></h2>
        <p>나의 금융 정보를 연결하고<br />맞춤형 독립 진단을 받아보세요.</p>
      </div>

      <aside class="security-note">
        <svg viewBox="0 0 24 24">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        마이데이터 표준에 따라 안전하게 연동됩니다.
      </aside>

      <div class="bottom-action">
        <button
          type="button"
          class="primary-button"
          :disabled="isConnecting"
          @click="startConnection"
        >
          <span v-if="isConnecting" class="spinner"></span>
          {{ isConnecting ? '금융기관 연결 중...' : '마이데이터 연동 시작하기' }}
        </button>
      </div>
    </section>

    <section v-else-if="step === 'accounts'" class="accounts-view">
      <div class="accounts-copy">
        <span class="wallet-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 7.5h14a2 2 0 0 1 2 2V19H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13v3.5" />
            <path d="M15 12h7v4h-7a2 2 0 0 1 0-4Z" />
          </svg>
        </span>
        <h2>독립 자금을 준비할<br />계좌를 선택해 주세요</h2>
        <p>선택한 계좌를 기준으로 독립 준비 현황을 분석해요.<br />최소 1개 이상 선택해 주세요.</p>
      </div>

      <div class="account-summary">
        <span
          >연결된 계좌 <strong>{{ accounts.length }}</strong></span
        >
        <span class="selected-count">{{ selectedAccountIds.length }}개 선택</span>
      </div>

      <div class="account-list">
        <button
          v-for="account in accounts"
          :key="account.id"
          type="button"
          class="account-card"
          :class="{ selected: selectedAccountIds.includes(account.id) }"
          :aria-pressed="selectedAccountIds.includes(account.id)"
          @click="toggleAccount(account.id)"
        >
          <span class="bank-logo" :style="{ background: account.color }">{{
            account.initials
          }}</span>
          <span class="account-info">
            <small>{{ account.bank }}</small>
            <strong>{{ account.name }}</strong>
            <span>{{ account.number }}</span>
          </span>
          <span class="account-side">
            <i class="select-check">
              <svg viewBox="0 0 24 24"><path d="m7 12 3.2 3.2L17.5 8" /></svg>
            </i>
            <strong>{{ account.balance.toLocaleString('ko-KR') }}원</strong>
          </span>
        </button>
      </div>

      <aside class="selection-note">선택한 계좌는 마이페이지에서 언제든지 변경할 수 있어요.</aside>

      <div class="bottom-action">
        <button
          type="button"
          class="primary-button"
          :disabled="!canComplete"
          @click="completeSelection"
        >
          {{
            canComplete
              ? `${selectedAccountIds.length}개 계좌 선택 완료`
              : '계좌를 1개 이상 선택해 주세요'
          }}
        </button>
      </div>
    </section>

    <section v-else class="complete-view">
      <div class="complete-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m7 12 3.2 3.2L17.5 8" /></svg>
      </div>
      <span class="eyebrow">연동 완료</span>
      <h2>독립 준비를 위한<br />첫걸음을 시작했어요!</h2>
      <p>
        선택한 {{ selectedAccountIds.length }}개 계좌를 바탕으로<br />나만의 독립 계획을
        만들어드릴게요.
      </p>
      <div class="complete-card">
        <span>연결된 마이데이터</span><strong>정상</strong> <span>독립 준비 계좌</span
        ><strong>{{ selectedAccountIds.length }}개</strong>
      </div>
      <div class="bottom-action">
        <button type="button" class="primary-button" @click="goHome">룸메이드 시작하기</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.mydata-page {
  width: 100%;
  max-width: 390px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #fff;
}

.page-header {
  position: relative;
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.back-button {
  position: absolute;
  left: 14px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #343642;
  background: #f3f3f6;
}

.back-button svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.step-indicator {
  display: flex;
  height: 60px;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
}

.step-item {
  display: grid;
  justify-items: center;
  gap: 4px;
  color: #b1b4bf;
}

.step-item span {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 50%;
  color: #a6a9b5;
  background: #e9eaf0;
  font-size: 11px;
  font-weight: 800;
}

.step-item small {
  font-size: 11px;
}

.step-item.active {
  color: #762fec;
}

.step-item.active span {
  color: #fff;
  background: #7931ef;
}

.step-line {
  width: 82px;
  height: 2px;
  margin: 11px 9px 0;
  background: #e3e3e9;
}

.step-line.active {
  background: #7931ef;
}

.intro-view,
.accounts-view,
.complete-view {
  display: flex;
  min-height: calc(100dvh - 124px);
  padding: 4px 16px 18px;
  flex-direction: column;
}

.hero-graphic {
  display: flex;
  height: 138px;
  align-items: center;
  justify-content: center;
}

.link-ring {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  border-radius: 22px;
}

.ring-left {
  color: #7630ec;
  background: #eee7ff;
  transform: rotate(-4deg);
}

.ring-right {
  color: #574c76;
  background: #f2eff8;
  transform: rotate(4deg);
}

.link-ring svg {
  width: 34px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.link-dots {
  display: flex;
  gap: 4px;
  margin: 0 7px;
}

.link-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9c6df1;
}

.intro-copy,
.accounts-copy {
  text-align: center;
}

.intro-copy {
  margin-top: 8px;
}

.eyebrow {
  color: #7a31ed;
  font-size: 12px;
  font-weight: 800;
}

.intro-copy h2,
.accounts-copy h2,
.complete-view h2 {
  margin: 7px 0 8px;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.35;
}

.intro-copy h2 em {
  color: #7830ee;
  font-style: normal;
}

.intro-copy p,
.accounts-copy p,
.complete-view > p {
  margin: 0;
  color: #8d909d;
  font-size: 13px;
  line-height: 1.65;
}

.security-note,
.selection-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 13px;
  color: #8d909c;
  font-size: 11px;
}

.security-note svg {
  width: 14px;
  fill: none;
  stroke: #7a31ed;
  stroke-width: 1.8;
}

.bottom-action {
  margin-top: auto;
  padding-top: 18px;
}

.intro-view .security-note {
  margin-top: 42px;
}

.intro-view .bottom-action {
  margin-top: clamp(34px, 6vh, 58px);
  padding-top: 0;
}

.primary-button {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #8239f5, #6c22e8);
  box-shadow: 0 7px 16px rgb(116 45 238 / 23%);
  font-size: 15px;
  font-weight: 800;
}

.primary-button:disabled {
  color: #a3a6b0;
  background: #ececf1;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgb(255 255 255 / 35%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.accounts-copy {
  padding: 2px 0 17px;
}

.wallet-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 10px;
  place-items: center;
  border-radius: 18px;
  color: #7830ed;
  background: #eee7ff;
}

.wallet-icon svg {
  width: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.account-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 1px 9px;
  color: #60636f;
  font-size: 12px;
}

.account-summary strong,
.selected-count {
  color: #7630ec;
  font-weight: 800;
}

.account-list {
  display: grid;
  gap: 9px;
}

.account-card {
  display: flex;
  min-height: 87px;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border: 1px solid #e5e5eb;
  border-radius: 15px;
  color: #232530;
  background: #fff;
  text-align: left;
  transition: 0.15s ease;
}

.account-card.selected {
  border-color: #8a48ef;
  background: #faf8ff;
  box-shadow: 0 0 0 2px rgb(122 49 237 / 8%);
}

.bank-logo {
  display: grid;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  color: #252525;
  font-size: 11px;
  font-weight: 900;
}

.account-info {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 2px;
}

.account-info small,
.account-info span {
  color: #9295a1;
  font-size: 10px;
}

.account-info strong {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-side {
  display: grid;
  flex: 0 0 auto;
  align-self: stretch;
  justify-items: end;
  align-content: space-between;
}

.account-side > strong {
  font-size: 12px;
}

.select-check {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 1px solid #d8dae1;
  border-radius: 50%;
  color: transparent;
  background: #fff;
}

.selected .select-check {
  border-color: #7931ef;
  color: #fff;
  background: #7931ef;
}

.select-check svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.selection-note {
  padding: 11px;
  border-radius: 10px;
  background: #f7f5fc;
}

.complete-view {
  min-height: calc(100dvh - 64px);
  align-items: center;
  padding-top: 70px;
  text-align: center;
}

.complete-mark {
  display: grid;
  width: 92px;
  height: 92px;
  margin-bottom: 20px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #7931ef;
  box-shadow: 0 10px 25px rgb(121 49 239 / 25%);
}

.complete-mark svg {
  width: 48px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.complete-card {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr auto;
  gap: 15px;
  margin-top: 32px;
  padding: 18px;
  border-radius: 15px;
  background: #f7f4fd;
  font-size: 13px;
  text-align: left;
}

.complete-card span {
  color: #777a87;
}

.complete-card strong {
  color: #7130de;
}

.complete-view .bottom-action {
  width: 100%;
}

@media (max-height: 720px) {
  .hero-graphic {
    height: 108px;
  }
  .link-ring {
    width: 56px;
    height: 56px;
  }

  .intro-view .security-note {
    margin-top: 28px;
  }

  .intro-view .bottom-action {
    margin-top: 28px;
  }
}
</style>
