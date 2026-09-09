import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { completeDailyLifeIntro, hasCompletedDailyLifeIntro } from './dailyLifeIntro.js'
import { rememberCurrentUser } from './mydataOnboarding.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

beforeEach(() => {
  globalThis.sessionStorage = createStorage()
  globalThis.window = { localStorage: createStorage() }
})

test('완료 기록은 로그인 계정별로 분리하고 재로그인 후 유지한다', () => {
  rememberCurrentUser('demo02@roommade.com')
  completeDailyLifeIntro()
  assert.equal(hasCompletedDailyLifeIntro(), true)

  rememberCurrentUser('demo03@roommade.com')
  assert.equal(hasCompletedDailyLifeIntro(), false)
  completeDailyLifeIntro()
  assert.equal(hasCompletedDailyLifeIntro(), true)

  rememberCurrentUser(' DEMO02@roommade.com ')
  assert.equal(hasCompletedDailyLifeIntro(), true)
})

test('기존 개발용 ID 완료 기록은 새 계정의 온보딩을 생략하지 않는다', () => {
  window.localStorage.setItem('roommade:daily-life-intro-completed:1', 'true')
  rememberCurrentUser('demo03@roommade.com')
  assert.equal(hasCompletedDailyLifeIntro(), false)
})

test('로그인 계정이 없으면 공통 완료 기록을 만들지 않는다', () => {
  completeDailyLifeIntro()
  rememberCurrentUser('demo03@roommade.com')
  assert.equal(hasCompletedDailyLifeIntro(), false)
})
