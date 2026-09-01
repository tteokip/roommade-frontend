<script setup>
import { computed, ref } from 'vue'
import { AppCard, AppInput, FilterChipGroup } from '@/shared/ui'
import HouseEditableField from './HouseEditableField.vue'
import {
  formatArea,
  formatCommuteRange,
  formatOrFallback,
  formatStationWalk,
  formatWon,
  manwonInputToWon,
} from '@/utils/houseFormat'

const OPTION_TYPE_CHOICES = ['풀옵션', '부분옵션', '옵션 없음']

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  commute: {
    type: Object,
    default: () => ({ status: 'idle', minMinutes: null, maxMinutes: null, message: '' }),
  },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:field', 'recalculate-commute'])

function field(key) {
  return computed({
    get: () => props.modelValue[key],
    set: (value) => emit('update:field', key, value),
  })
}

const baseAddress = field('baseAddress')
const detailAddress = field('detailAddress')
const deposit = field('deposit')
const monthlyRent = field('monthlyRent')
const maintenanceFee = field('maintenanceFee')
const area = field('area')
const stationWalkMinutes = field('stationWalkMinutes')
const floorType = field('floorType')
const roomStructure = field('roomStructure')
const optionType = field('optionType')

const optionTypeChoices = computed(() =>
  OPTION_TYPE_CHOICES.map((value) => ({ value, label: value, disabled: props.disabled })),
)

function moneyDisplay(manwonText) {
  const won = manwonInputToWon(manwonText)
  return formatWon(Number.isFinite(won) ? won : null)
}

function toNumberOrNull(text) {
  if (text === '' || text === null || text === undefined) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : null
}

const depositDisplay = computed(() => moneyDisplay(deposit.value))
const monthlyRentDisplay = computed(() => moneyDisplay(monthlyRent.value))
const maintenanceFeeDisplay = computed(() => moneyDisplay(maintenanceFee.value))
const areaDisplay = computed(() => formatArea(toNumberOrNull(area.value)))
const stationWalkDisplay = computed(() =>
  formatStationWalk(toNumberOrNull(stationWalkMinutes.value)),
)

const commuteText = computed(() => {
  if (props.commute.status === 'success') {
    return formatCommuteRange(props.commute.minMinutes, props.commute.maxMinutes)
  }
  return ''
})

const REQUIRED_FIELD_ORDER = ['baseAddress', 'deposit', 'monthlyRent']
const activeField = ref(REQUIRED_FIELD_ORDER.find((key) => !props.modelValue[key]) ?? null)

function collapseField(key) {
  if (activeField.value === key) activeField.value = null
  if (key === 'baseAddress' || key === 'detailAddress') emit('recalculate-commute')
}
</script>

<template>
  <div>
    <AppCard padding="none" class="px-4">
      <HouseEditableField
        label="주소"
        icon="📍"
        required
        :display-text="formatOrFallback(baseAddress)"
        :is-empty="!baseAddress"
        :error="errors.baseAddress"
        :disabled="disabled"
        :editing="activeField === 'baseAddress'"
        @expand="activeField = 'baseAddress'"
        @collapse="collapseField('baseAddress')"
      >
        <AppInput
          v-model="baseAddress"
          placeholder="예: 서울특별시 관악구 신림동"
          :error="errors.baseAddress"
          :disabled="disabled"
        />
      </HouseEditableField>

      <HouseEditableField
        label="도로명 주소"
        icon="🛣️"
        :display-text="formatOrFallback(detailAddress)"
        :is-empty="!detailAddress"
        :disabled="disabled"
        :editing="activeField === 'detailAddress'"
        @expand="activeField = 'detailAddress'"
        @collapse="collapseField('detailAddress')"
      >
        <AppInput
          v-model="detailAddress"
          placeholder="예: 서울특별시 강남구 테헤란로 231"
          hint="도로명 주소를 입력하면 이 주소로 등록되고, 통근시간도 다시 계산돼요."
          :disabled="disabled"
        />
      </HouseEditableField>
    </AppCard>

    <div class="my-3 rounded-control bg-brand-lavender px-4 py-3">
      <p class="text-sm font-bold text-muted">🚌 예상 통근시간</p>

      <p
        v-if="commute.status === 'loading'"
        class="mt-1 flex items-center gap-2 text-sm font-bold text-body"
      >
        <span
          class="size-3.5 animate-spin rounded-full border-2 border-brand-primary-soft border-t-brand-primary"
          aria-hidden="true"
        />
        계산 중이에요...
      </p>
      <p v-else-if="commute.status === 'success'" class="mt-1 text-base font-extrabold text-ink">
        {{ commuteText }}
      </p>
      <p v-else-if="commute.status === 'error'" class="mt-1 text-sm font-medium text-danger">
        {{ commute.message }}
      </p>
      <p v-else class="mt-1 text-sm text-muted">주소를 입력하면 자동으로 계산해요.</p>

      <button
        type="button"
        class="mt-2 text-sm font-bold text-brand-primary underline underline-offset-2 disabled:cursor-not-allowed disabled:text-muted"
        :disabled="disabled || commute.status === 'loading' || (!baseAddress && !detailAddress)"
        @click="$emit('recalculate-commute')"
      >
        통근시간 다시 계산
      </button>
    </div>

    <AppCard padding="none" class="px-4">
      <HouseEditableField
        label="보증금"
        icon="🏦"
        required
        :display-text="depositDisplay"
        :is-empty="!deposit"
        :error="errors.deposit"
        :disabled="disabled"
        :editing="activeField === 'deposit'"
        @expand="activeField = 'deposit'"
        @collapse="collapseField('deposit')"
      >
        <AppInput
          v-model="deposit"
          type="number"
          inputmode="decimal"
          placeholder="예: 1000"
          :error="errors.deposit"
          :disabled="disabled"
        >
          <template #suffix>
            <span class="text-sm font-bold text-muted">만원</span>
          </template>
        </AppInput>
      </HouseEditableField>

      <HouseEditableField
        label="월세"
        icon="💰"
        required
        :display-text="monthlyRentDisplay"
        :is-empty="!monthlyRent"
        :error="errors.monthlyRent"
        :disabled="disabled"
        :editing="activeField === 'monthlyRent'"
        @expand="activeField = 'monthlyRent'"
        @collapse="collapseField('monthlyRent')"
      >
        <AppInput
          v-model="monthlyRent"
          type="number"
          inputmode="decimal"
          placeholder="예: 50"
          :error="errors.monthlyRent"
          :disabled="disabled"
        >
          <template #suffix>
            <span class="text-sm font-bold text-muted">만원</span>
          </template>
        </AppInput>
      </HouseEditableField>

      <HouseEditableField
        label="관리비"
        icon="🏢"
        :display-text="maintenanceFeeDisplay"
        :is-empty="!maintenanceFee"
        :error="errors.maintenanceFee"
        :disabled="disabled"
        :editing="activeField === 'maintenanceFee'"
        @expand="activeField = 'maintenanceFee'"
        @collapse="collapseField('maintenanceFee')"
      >
        <AppInput
          v-model="maintenanceFee"
          type="number"
          inputmode="decimal"
          placeholder="관리비가 없으면 비워 두세요."
          :error="errors.maintenanceFee"
          :disabled="disabled"
        >
          <template #suffix>
            <span class="text-sm font-bold text-muted">만원</span>
          </template>
        </AppInput>
      </HouseEditableField>

      <HouseEditableField
        label="면적"
        icon="📐"
        :display-text="areaDisplay"
        :is-empty="!area"
        :error="errors.area"
        :disabled="disabled"
        :editing="activeField === 'area'"
        @expand="activeField = 'area'"
        @collapse="collapseField('area')"
      >
        <AppInput
          v-model="area"
          type="number"
          inputmode="decimal"
          placeholder="예: 26.4"
          :error="errors.area"
          :disabled="disabled"
        />
      </HouseEditableField>

      <HouseEditableField
        label="역까지 도보 시간"
        icon="🚶"
        :display-text="stationWalkDisplay"
        :is-empty="!stationWalkMinutes"
        :error="errors.stationWalkMinutes"
        :disabled="disabled"
        :editing="activeField === 'stationWalkMinutes'"
        @expand="activeField = 'stationWalkMinutes'"
        @collapse="collapseField('stationWalkMinutes')"
      >
        <AppInput
          v-model="stationWalkMinutes"
          type="number"
          inputmode="numeric"
          placeholder="예: 7"
          :error="errors.stationWalkMinutes"
          :disabled="disabled"
        />
      </HouseEditableField>

      <HouseEditableField
        label="층 정보"
        icon="🏙️"
        :display-text="formatOrFallback(floorType)"
        :is-empty="!floorType"
        :error="errors.floorType"
        :disabled="disabled"
        :editing="activeField === 'floorType'"
        @expand="activeField = 'floorType'"
        @collapse="collapseField('floorType')"
      >
        <AppInput
          v-model="floorType"
          placeholder="예: 3층, 반지하"
          :error="errors.floorType"
          :disabled="disabled"
        />
      </HouseEditableField>

      <HouseEditableField
        label="방 구조"
        icon="🚪"
        :display-text="formatOrFallback(roomStructure)"
        :is-empty="!roomStructure"
        :error="errors.roomStructure"
        :disabled="disabled"
        :editing="activeField === 'roomStructure'"
        @expand="activeField = 'roomStructure'"
        @collapse="collapseField('roomStructure')"
      >
        <AppInput
          v-model="roomStructure"
          placeholder="예: 원룸, 투룸"
          :error="errors.roomStructure"
          :disabled="disabled"
        />
      </HouseEditableField>

      <HouseEditableField
        label="옵션"
        icon="🛁"
        :display-text="formatOrFallback(optionType)"
        :is-empty="!optionType"
        :disabled="disabled"
        :editing="activeField === 'optionType'"
        @expand="activeField = 'optionType'"
        @collapse="collapseField('optionType')"
      >
        <FilterChipGroup
          :model-value="optionType ? [optionType] : []"
          :options="optionTypeChoices"
          :multiple="false"
          @update:model-value="
            (value) => {
              optionType = value[0] ?? ''
              collapseField('optionType')
            }
          "
        />
      </HouseEditableField>
    </AppCard>
  </div>
</template>
