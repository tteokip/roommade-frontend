const userId = import.meta.env.VITE_DEV_USER_ID || '1'
const completionKey = `roommade:daily-life-intro-completed:${userId}`

export function hasCompletedDailyLifeIntro() {
  try {
    return window.localStorage.getItem(completionKey) === 'true'
  } catch {
    return false
  }
}

export function completeDailyLifeIntro() {
  try {
    window.localStorage.setItem(completionKey, 'true')
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 현재 화면에서만 종료 상태를 유지한다.
  }
}
