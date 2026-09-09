import { getCurrentUserEmail } from './mydataOnboarding.js'

function getCompletionKey() {
  const email = getCurrentUserEmail()
  // 이전 개발용 ID 기록은 계정 간 공유되었으므로 새 키로 분리한다.
  return email ? `roommade:daily-life-intro-completed:email:${email}` : null
}

export function hasCompletedDailyLifeIntro() {
  const completionKey = getCompletionKey()
  if (!completionKey) return false
  try {
    return window.localStorage.getItem(completionKey) === 'true'
  } catch {
    return false
  }
}

export function completeDailyLifeIntro() {
  const completionKey = getCompletionKey()
  if (!completionKey) return
  try {
    window.localStorage.setItem(completionKey, 'true')
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 현재 화면에서만 종료 상태를 유지한다.
  }
}
