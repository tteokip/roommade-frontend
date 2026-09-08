const CURRENT_USER_EMAIL_KEY = 'roommade-current-user-email'
const ONBOARDING_KEY_PREFIX = 'roommade-mydata-onboarding:'

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function rememberCurrentUser(email) {
  sessionStorage.setItem(CURRENT_USER_EMAIL_KEY, normalizeEmail(email))
}

export function hasCompletedMyDataOnboarding(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false
  return localStorage.getItem(`${ONBOARDING_KEY_PREFIX}${normalizedEmail}`) === 'completed'
}

export function completeMyDataOnboardingForCurrentUser() {
  const email = sessionStorage.getItem(CURRENT_USER_EMAIL_KEY)
  if (!email) return false

  localStorage.setItem(`${ONBOARDING_KEY_PREFIX}${email}`, 'completed')
  return true
}
