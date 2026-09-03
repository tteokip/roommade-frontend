import apiClient from './client'

function unwrap(response) {
  return response.data.data
}

export function getTodayQuiz() {
  return apiClient.get('/quizzes/today').then(unwrap)
}

export function submitTodayQuizAnswer(selectedChoiceId) {
  return apiClient.post('/quizzes/today/attempts', { selectedChoiceId }).then(unwrap)
}
