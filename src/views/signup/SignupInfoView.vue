<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SignupHeader from '@/components/signup/SignupHeader.vue'
import SignupNotice from '@/components/signup/SignupNotice.vue'
import SignupProgress from '@/components/signup/SignupProgress.vue'
import { useSignupStore } from '@/stores/signup'

const router = useRouter()
const route = useRoute()
const signupStore = useSignupStore()
const form = reactive({ ...signupStore.form })
const touched = reactive({ email: false, password: false })

const requiredFields = [
  'email',
  'password',
  'name',
  'birthDate',
  'monthlyIncome',
  'roadAddress',
  'deposit',
  'monthlyRent',
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailError = computed(() => {
  if (!touched.email) return ''
  if (!form.email) return '이메일을 입력해 주세요.'
  if (!emailPattern.test(form.email)) return '올바른 이메일 형식으로 입력해 주세요.'
  return ''
})
const passwordError = computed(() => {
  if (!touched.password) return ''
  if (!form.password) return '비밀번호를 입력해 주세요.'
  if (form.password.length < 8) return '비밀번호는 8자 이상 입력해 주세요.'
  return ''
})
const isValid = computed(() => {
  return (
    requiredFields.every((key) => String(form[key]).trim()) &&
    emailPattern.test(form.email) &&
    form.password.length >= 8 &&
    form.birthDate.length === 10
  )
})

function formatBirthDate(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean)
  form.birthDate = parts.join('.')
  event.target.value = form.birthDate
}

function formatMoney(key, event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 12)
  form[key] = digits ? Number(digits).toLocaleString('ko-KR') : ''
  event.target.value = form[key]
}

function goNext() {
  if (!isValid.value) return
  signupStore.saveForm(form)
  router.push('/signup/terms')
}
</script>

<template>
  <main class="signup-page info-page">
    <SignupHeader />
    <SignupProgress :step="1" />

    <form class="content" @submit.prevent="goNext">
      <p v-if="route.query.reason === 'password-required'" class="page-message" role="alert">
        보안을 위해 비밀번호를 다시 입력해 주세요.
      </p>
      <SignupNotice
        title="독립을 위한 정보를 입력해주세요"
        description="입력한 정보는 자립 진단 및 홈 서비스에 활용돼요."
      />

      <fieldset>
        <legend>기본 정보</legend>
        <div class="field-control">
          <label class="input-box" :class="{ invalid: emailError }">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              v-model.trim="form.email"
              type="email"
              maxlength="255"
              autocomplete="email"
              placeholder="이메일을 입력해주세요"
              :aria-invalid="Boolean(emailError)"
              @blur="touched.email = true"
            />
          </label>
          <p v-if="emailError" class="field-error" role="alert">{{ emailError }}</p>
        </div>
        <div class="field-control">
          <label class="input-box" :class="{ invalid: passwordError }">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
            </svg>
            <input
              v-model="form.password"
              type="password"
              minlength="8"
              maxlength="64"
              autocomplete="new-password"
              placeholder="비밀번호를 입력해주세요 (8자 이상)"
              :aria-invalid="Boolean(passwordError)"
              @blur="touched.password = true"
            />
          </label>
          <p v-if="passwordError" class="field-error" role="alert">{{ passwordError }}</p>
        </div>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3" />
            <path d="M6.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
          </svg>
          <input
            v-model.trim="form.name"
            type="text"
            maxlength="20"
            placeholder="이름을 입력해주세요"
          />
        </label>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="6" width="16" height="14" rx="2" />
            <path d="M8 3v6M16 3v6M4 10h16" />
          </svg>
          <input
            :value="form.birthDate"
            type="text"
            inputmode="numeric"
            placeholder="생년월일을 입력해주세요 (YYYY.MM.DD)"
            @input="formatBirthDate"
          />
        </label>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="7" width="16" height="12" rx="2" />
            <path d="M9 7V5h6v2" />
          </svg>
          <input
            :value="form.monthlyIncome"
            type="text"
            inputmode="numeric"
            placeholder="월급(월소득)을 입력해주세요"
            @input="formatMoney('monthlyIncome', $event)"
          />
          <span class="unit">만원</span>
        </label>
      </fieldset>

      <fieldset>
        <legend>직장 주소</legend>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
          <input
            v-model.trim="form.roadAddress"
            type="text"
            placeholder="도로명 주소를 입력해주세요"
          />
        </label>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
          <input
            v-model.trim="form.detailAddress"
            type="text"
            placeholder="상세 주소를 입력해주세요 (선택)"
          />
        </label>
        <p class="hint">건물명, 층, 호수 등을 입력해주세요 (선택사항)</p>
      </fieldset>

      <fieldset>
        <legend>주거 예산 정보</legend>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m4 11 8-6 8 6v9H4Z" />
          </svg>
          <input
            :value="form.deposit"
            type="text"
            inputmode="numeric"
            placeholder="보증금은 얼마까지 생각하고 있나요?"
            @input="formatMoney('deposit', $event)"
          />
          <span class="unit">만원</span>
        </label>
        <label class="input-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <input
            :value="form.monthlyRent"
            type="text"
            inputmode="numeric"
            placeholder="월세는 얼마까지 생각하고 있나요?"
            @input="formatMoney('monthlyRent', $event)"
          />
          <span class="unit">만원</span>
        </label>
      </fieldset>

      <aside class="change-note">
        <span aria-hidden="true">♡</span>
        <div>
          <strong>나중에 변경할 수 있어요!</strong><br />입력한 정보는 마이페이지에서 수정할 수
          있습니다.
        </div>
      </aside>

      <div class="bottom-action">
        <button class="signup-primary-button" type="submit" :disabled="!isValid">다음</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.content {
  display: flex;
  min-height: calc(100dvh - 119px);
  padding: 0 14px 12px;
  flex-direction: column;
  gap: 15px;
}

fieldset {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 9px;
  padding: 0;
  font-size: 15px;
  font-weight: 800;
}

.input-box {
  display: flex;
  align-items: center;
  min-height: 45px;
  padding: 0 12px;
  border: 1px solid #e1e2e8;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.15s;
}

.input-box:focus-within {
  border-color: #9d6cf2;
  box-shadow: 0 0 0 2px rgb(124 50 242 / 8%);
}

.input-box.invalid {
  border-color: #e54858;
  box-shadow: 0 0 0 2px rgb(229 72 88 / 8%);
}

.field-control {
  display: grid;
  gap: 5px;
}

.field-error {
  margin: 0 3px;
  color: #dc3545;
  font-size: 11px;
  line-height: 1.4;
}

.input-box svg {
  flex: 0 0 auto;
  width: 17px;
  margin-right: 9px;
  fill: none;
  stroke: #aeb2c0;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.input-box input {
  min-width: 0;
  width: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  color: #222431;
  background: transparent;
  font-size: 13px;
}

.input-box input::placeholder {
  color: #acafba;
}

.unit {
  flex: 0 0 auto;
  color: #545866;
  font-size: 12px;
  font-weight: 700;
}

.hint {
  margin: -2px 2px 0;
  color: #a2a5b0;
  font-size: 11px;
}

.page-message {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: #b52c3b;
  background: #fff0f2;
  font-size: 12px;
  font-weight: 600;
}

.change-note {
  display: flex;
  gap: 9px;
  padding: 11px 12px;
  border-radius: 10px;
  color: #777b8b;
  background: #f4f1ff;
  font-size: 11px;
  line-height: 1.55;
}

.change-note span,
.change-note strong {
  color: #5e6070;
}

.bottom-action {
  margin-top: auto;
  padding-top: 3px;
}

@media (min-height: 790px) {
  .content {
    gap: 17px;
  }
}
</style>
