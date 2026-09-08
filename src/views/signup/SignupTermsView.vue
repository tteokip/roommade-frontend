<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signupUser } from '@/api/users'
import SignupHeader from '@/components/signup/SignupHeader.vue'
import SignupProgress from '@/components/signup/SignupProgress.vue'
import { useSignupStore } from '@/stores/signup'

const router = useRouter()
const signupStore = useSignupStore()
const selectedTerm = ref(null)
const isSubmitting = ref(false)
const submitError = ref('')
const agreements = ref({
  service: false,
  privacy: false,
  thirdParty: false,
})

onBeforeMount(() => {
  if (!signupStore.form.password) {
    router.replace({ path: '/signup/info', query: { reason: 'password-required' } })
  }
})

const terms = [
  { key: 'service', label: '(필수) 룸메이드 이용약관', required: true },
  { key: 'privacy', label: '(필수) 개인정보 수집 및 이용 동의', required: true },
  { key: 'thirdParty', label: '(필수) 개인정보 제3자 제공 동의', required: true },
]

const allChecked = computed(() => terms.every(({ key }) => agreements.value[key]))
const requiredChecked = computed(() =>
  terms.filter((term) => term.required).every(({ key }) => agreements.value[key]),
)

function toggleAll() {
  const next = !allChecked.value
  Object.keys(agreements.value).forEach((key) => (agreements.value[key] = next))
}

function parseManwon(value) {
  return Number(String(value).replace(/,/g, '')) * 10_000
}

async function completeSignup() {
  if (!requiredChecked.value || isSubmitting.value) return

  if (!signupStore.form.password) {
    submitError.value = '회원정보를 다시 입력해 주세요.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    await signupUser({
      email: signupStore.form.email,
      password: signupStore.form.password,
      name: signupStore.form.name,
      birthDate: signupStore.form.birthDate.replaceAll('.', '-'),
      monthlyIncome: parseManwon(signupStore.form.monthlyIncome),
      workplaceRoadAddress: signupStore.form.roadAddress || null,
      workplaceDetailAddress: signupStore.form.detailAddress || null,
      depositLimit: parseManwon(signupStore.form.deposit),
      monthlyRentLimit: parseManwon(signupStore.form.monthlyRent),
    })
    router.push('/signup/complete')
  } catch (error) {
    submitError.value =
      error.response?.data?.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="signup-page terms-page">
    <SignupHeader fallback="/signup/info" />
    <SignupProgress :step="2" />

    <div class="content">
      <section class="terms-notice">
        <span class="shield" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
        <div>
          <strong>서비스 이용을 위해<br />약관에 동의해 주세요</strong>
          <p>룸메이드의 모든 약관은 필수 동의의 항목입니다.</p>
        </div>
      </section>

      <section class="terms-card">
        <button type="button" class="all-term" @click="toggleAll">
          <span class="check" :class="{ checked: allChecked }">
            <svg viewBox="0 0 24 24"><path d="m7 12 3.2 3.2L17.5 8" /></svg>
          </span>
          <strong>모든 약관에 동의합니다</strong>
          <svg class="fold-icon" viewBox="0 0 24 24"><path d="m7 14 5-5 5 5" /></svg>
        </button>

        <div class="term-list">
          <label v-for="term in terms" :key="term.key" class="term-row">
            <input v-model="agreements[term.key]" type="checkbox" />
            <span class="check" :class="{ checked: agreements[term.key] }">
              <svg viewBox="0 0 24 24"><path d="m7 12 3.2 3.2L17.5 8" /></svg>
            </span>
            <span class="term-label">{{ term.label }}</span>
            <button type="button" class="view-term" @click.prevent="selectedTerm = term">
              보기 <span>›</span>
            </button>
          </label>
        </div>
      </section>

      <aside class="check-note">
        <strong>ⓘ 잠깐! 확인해 주세요</strong>
        <ul>
          <li>회원가입 후 입력한 정보는 마이페이지에서 언제든지 수정할 수 있어요.</li>
          <li>정확한 정보를 입력하시면 더 맞춤화된 서비스를 이용할 수 있어요.</li>
          <li>모든 정보는 안전하게 보호됩니다.</li>
        </ul>
      </aside>

      <div class="bottom-action">
        <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
        <button
          type="button"
          class="signup-primary-button"
          :disabled="!requiredChecked || isSubmitting"
          @click="completeSignup"
        >
          {{ isSubmitting ? '가입 처리 중...' : '동의하고 가입 완료' }}
        </button>
      </div>
    </div>

    <div v-if="selectedTerm" class="modal-backdrop" @click.self="selectedTerm = null">
      <section class="term-modal" role="dialog" aria-modal="true" :aria-label="selectedTerm.label">
        <header>
          <strong>{{ selectedTerm.label }}</strong>
          <button type="button" aria-label="닫기" @click="selectedTerm = null">×</button>
        </header>
        <p>
          약관 상세 내용이 들어갈 영역입니다. 현재는 화면 구현 단계이며, 실제 서비스 약관이 확정되면
          해당 내용으로 교체해 주세요.
        </p>
        <button type="button" class="modal-confirm" @click="selectedTerm = null">확인</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.terms-page {
  position: relative;
}

.content {
  display: flex;
  min-height: calc(100dvh - 119px);
  padding: 8px 14px 18px;
  flex-direction: column;
  gap: 16px;
}

.terms-notice {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 90px;
  padding: 17px 18px;
  border-radius: 17px;
  background: #f5f1ff;
}

.shield {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  color: #7931f0;
  background: #eae1ff;
}

.shield svg,
.check svg,
.fold-icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.shield svg {
  width: 23px;
}

.terms-notice strong {
  font-size: 14px;
  line-height: 1.45;
}

.terms-notice p {
  margin: 5px 0 0;
  color: #888b98;
  font-size: 10px;
}

.terms-card {
  overflow: hidden;
  border: 1px solid #e7e7ec;
  border-radius: 15px;
  box-shadow: 0 3px 12px rgb(30 30 50 / 7%);
}

.all-term,
.term-row {
  display: flex;
  width: 100%;
  align-items: center;
}

.all-term {
  gap: 10px;
  min-height: 50px;
  padding: 0 14px;
  border: 0;
  border-bottom: 1px solid #eeeef2;
  background: #fff;
  color: #272936;
  text-align: left;
}

.all-term strong {
  font-size: 13px;
}

.check {
  display: grid;
  flex: 0 0 auto;
  width: 21px;
  height: 21px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #e1e3e9;
}

.check.checked {
  background: #7c32f2;
}

.check svg {
  width: 14px;
  stroke-width: 2.5;
}

.fold-icon {
  width: 16px;
  margin-left: auto;
  color: #8f929f;
}

.term-list {
  padding: 0 14px;
}

.term-row {
  min-height: 47px;
  gap: 9px;
  color: #4f5260;
  font-size: 11px;
}

.term-row input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.term-label {
  min-width: 0;
  flex: 1;
}

.view-term {
  padding: 5px 0 5px 7px;
  border: 0;
  color: #a3a6b0;
  background: transparent;
  font-size: 10px;
}

.view-term span {
  font-size: 16px;
  vertical-align: -1px;
}

.check-note {
  padding: 15px 16px;
  border-radius: 14px;
  background: #f8f8fa;
  color: #777b89;
  font-size: 10px;
  line-height: 1.65;
}

.check-note strong {
  color: #333644;
  font-size: 11px;
}

.check-note ul {
  margin: 8px 0 0;
  padding-left: 14px;
}

.bottom-action {
  margin-top: auto;
}

.submit-error {
  margin: 0 0 9px;
  color: #db3545;
  font-size: 12px;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgb(20 18 27 / 40%);
}

.term-modal {
  width: min(100%, 362px);
  padding: 20px;
  border-radius: 18px;
  background: #fff;
}

.term-modal header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.term-modal header button {
  border: 0;
  background: transparent;
  font-size: 22px;
}

.term-modal p {
  color: #737684;
  font-size: 12px;
  line-height: 1.7;
}

.modal-confirm {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  background: #782ff0;
  font-weight: 700;
}
</style>
