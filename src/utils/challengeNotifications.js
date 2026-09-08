const CURRENT_USER_EMAIL_KEY = 'roommade-current-user-email'
const NOTIFICATIONS_KEY_PREFIX = 'roommade-challenge-notifications:'
const MAX_NOTIFICATION_COUNT = 30

function getStorageKey() {
  const currentUser = window.sessionStorage.getItem(CURRENT_USER_EMAIL_KEY) ?? 'current-session'
  return `${NOTIFICATIONS_KEY_PREFIX}${currentUser}`
}

function normalizeChallengeDate(value) {
  if (Array.isArray(value)) {
    const [year, month, day] = value
    return [year, month, day]
      .map((part, index) => String(part).padStart(index ? 2 : 4, '0'))
      .join('-')
  }

  return String(value).slice(0, 10)
}

export function loadChallengeNotifications() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(getStorageKey()) ?? '[]')
    if (!Array.isArray(stored)) return []

    return stored.filter(
      (notification) =>
        typeof notification?.id === 'string' &&
        typeof notification.challengeDate === 'string' &&
        Number.isInteger(notification.achievedLevel) &&
        Number.isInteger(notification.rewardCoin) &&
        typeof notification.read === 'boolean',
    )
  } catch {
    return []
  }
}

function saveChallengeNotifications(notifications) {
  try {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(notifications))
  } catch {
    // 저장소를 사용할 수 없으면 현재 화면에서만 알림을 유지한다.
  }
}

export function recordChallengeReward(result) {
  const notifications = loadChallengeNotifications()
  if (!result?.rewardCoin || !result.achievedLevel) {
    return { notifications, notification: null, isNew: false }
  }

  const challengeDate = normalizeChallengeDate(result.challengeDate)
  const id = `daily-challenge:${challengeDate}`
  const existingNotification = notifications.find((notification) => notification.id === id)
  if (existingNotification) {
    return { notifications, notification: existingNotification, isNew: false }
  }

  const notification = {
    id,
    type: 'DAILY_CHALLENGE_REWARD',
    challengeDate,
    achievedLevel: result.achievedLevel,
    rewardCoin: result.rewardCoin,
    read: false,
  }
  const nextNotifications = [notification, ...notifications].slice(0, MAX_NOTIFICATION_COUNT)
  saveChallengeNotifications(nextNotifications)

  return { notifications: nextNotifications, notification, isNew: true }
}

export function markAllChallengeNotificationsRead(notifications) {
  const nextNotifications = notifications.map((notification) => ({
    ...notification,
    read: true,
  }))
  saveChallengeNotifications(nextNotifications)
  return nextNotifications
}
