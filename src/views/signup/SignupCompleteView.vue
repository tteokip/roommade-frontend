<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SignupHeader from '@/components/signup/SignupHeader.vue'
import SignupProgress from '@/components/signup/SignupProgress.vue'
import { useSignupStore } from '@/stores/signup'

const router = useRouter()
const signupStore = useSignupStore()

const summary = computed(() => [
  { icon: 'user', label: '이름', value: signupStore.form.name || '-' },
  { icon: 'calendar', label: '생년월일', value: signupStore.form.birthDate || '-' },
  { icon: 'briefcase', label: '월소득', value: toWon(signupStore.form.monthlyIncome) },
  {
    icon: 'pin',
    label: '직장 주소',
    value:
      [signupStore.form.roadAddress, signupStore.form.detailAddress].filter(Boolean).join(' ') ||
      '-',
  },
  { icon: 'home', label: '보증금(상한치)', value: toWon(signupStore.form.deposit) },
  { icon: 'building', label: '월세 상한', value: toWon(signupStore.form.monthlyRent) },
])

function toWon(value) {
  if (!value) return '-'
  return `${(Number(String(value).replace(/,/g, '')) * 10_000).toLocaleString('ko-KR')}원`
}

function startDiagnosis() {
  window.alert('독립 진단 화면은 준비 중입니다.')
}

function goHome() {
  signupStore.clearForm()
  router.push('/')
}
</script>

<template>
  <main class="signup-page complete-page">
    <SignupHeader fallback="/signup/terms" />
    <SignupProgress :step="3" />

    <div class="content">
      <section class="celebration">
        <i v-for="index in 8" :key="index" :class="`confetti confetti-${index}`"></i>
        <div class="home-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="m9 22 15-12 15 12v17H9Z" />
            <path d="M20 27h8v8h-8Z" />
          </svg>
          <span>✓</span>
        </div>
        <h2>회원가입이<br /><em>완료</em>되었습니다!</h2>
        <p>룸메이드와 함께<br />당신의 독립을 준비해보세요.</p>
      </section>

      <section class="summary-card">
        <h3>입력한 정보 요약</h3>
        <dl>
          <div v-for="item in summary" :key="item.label" class="summary-row">
            <dt>
              <span class="summary-icon" aria-hidden="true">
                <svg v-if="item.icon === 'user'" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
                </svg>
                <svg v-else-if="item.icon === 'calendar'" viewBox="0 0 24 24">
                  <rect x="4" y="6" width="16" height="14" rx="2" />
                  <path d="M8 3v6M16 3v6M4 10h16" />
                </svg>
                <svg v-else-if="item.icon === 'briefcase'" viewBox="0 0 24 24">
                  <rect x="3" y="7" width="18" height="12" rx="2" />
                  <path d="M9 7V5h6v2M3 12h18" />
                </svg>
                <svg v-else-if="item.icon === 'pin'" viewBox="0 0 24 24">
                  <path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
                <svg v-else-if="item.icon === 'home'" viewBox="0 0 24 24">
                  <path d="m4 11 8-6 8 6v9H4Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24">
                  <path d="M5 21V4h14v17M3 21h18M9 8h2M14 8h2M9 12h2M14 12h2M9 16h2M14 16h2" />
                </svg>
              </span>
              {{ item.label }}
            </dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <div class="actions">
        <button type="button" class="signup-primary-button" @click="startDiagnosis">
          독립 진단 시작하기
        </button>
        <button type="button" class="home-button" @click="goHome">홈으로 이동</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.content {
  display: flex;
  min-height: calc(100dvh - 119px);
  padding: 3px 14px 18px;
  flex-direction: column;
}

.celebration {
  position: relative;
  padding: 8px 20px 23px;
  text-align: center;
}

.home-mark {
  position: relative;
  display: grid;
  width: 92px;
  height: 92px;
  margin: 0 auto 13px;
  place-items: center;
  border-radius: 50%;
  color: #7931f0;
  background: #eee7ff;
}

.home-mark svg {
  width: 46px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.home-mark span {
  position: absolute;
  right: 4px;
  bottom: 5px;
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  color: #fff;
  background: #7830ef;
  font-size: 11px;
  font-weight: 800;
}

.celebration h2 {
  margin: 0;
  font-size: 23px;
  line-height: 1.27;
}

.celebration em {
  color: #7a31ef;
  font-style: normal;
}

.celebration p {
  margin: 10px 0 0;
  color: #a0a2ad;
  font-size: 13px;
  line-height: 1.6;
}

.confetti {
  position: absolute;
  width: 7px;
  height: 12px;
  border-radius: 1px;
  transform: rotate(20deg);
}

.confetti-1 {
  top: 8px;
  left: 30px;
  background: #c477f5;
}
.confetti-2 {
  top: 45px;
  left: 10px;
  width: 6px;
  height: 6px;
  background: #9679f5;
}
.confetti-3 {
  top: 84px;
  left: 25px;
  background: #f4c747;
}
.confetti-4 {
  top: 127px;
  left: 6px;
  background: #ee9cca;
}
.confetti-5 {
  top: 8px;
  right: 31px;
  background: #f49dcc;
}
.confetti-6 {
  top: 45px;
  right: 10px;
  width: 6px;
  height: 6px;
  background: #9679f5;
}
.confetti-7 {
  top: 88px;
  right: 25px;
  background: #6cd6b2;
}
.confetti-8 {
  top: 126px;
  right: 7px;
  background: #f1ca4e;
}

.summary-card {
  overflow: hidden;
  border: 1px solid #e7e7ec;
  border-radius: 15px;
  box-shadow: 0 4px 14px rgb(30 30 50 / 8%);
}

.summary-card h3 {
  margin: 0;
  padding: 14px 15px 10px;
  font-size: 13px;
}

.summary-card dl {
  margin: 0;
}

.summary-row {
  display: flex;
  min-height: 43px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 15px;
  border-top: 1px solid #f0f0f3;
  font-size: 12px;
}

.summary-row dt {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  color: #777a88;
}

.summary-icon {
  display: inline-grid;
  width: 17px;
  height: 17px;
  place-items: center;
  color: #8d79a7;
}

.summary-icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.summary-row dd {
  overflow: hidden;
  margin: 0;
  color: #252735;
  font-weight: 800;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: grid;
  gap: 9px;
  margin-top: auto;
  padding-top: 12px;
}

.home-button {
  min-height: 47px;
  border: 1px solid #e0e1e6;
  border-radius: 12px;
  color: #7730ed;
  background: #fff;
  font-size: 14px;
  font-weight: 800;
}
</style>
