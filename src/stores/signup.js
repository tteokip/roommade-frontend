import { defineStore } from 'pinia'
import { reactive } from 'vue'

const STORAGE_KEY = 'roommade-signup-info'

const emptyForm = () => ({
  email: '',
  password: '',
  name: '',
  birthDate: '',
  monthlyIncome: '',
  roadAddress: '',
  detailAddress: '',
  deposit: '',
  monthlyRent: '',
})

const loadForm = () => {
  try {
    return { ...emptyForm(), ...JSON.parse(sessionStorage.getItem(STORAGE_KEY)) }
  } catch {
    return emptyForm()
  }
}

export const useSignupStore = defineStore('signup', () => {
  const form = reactive(loadForm())

  function saveForm(values) {
    Object.assign(form, values)
    const { password: _password, ...safeForm } = form
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeForm))
  }

  function clearForm() {
    Object.assign(form, emptyForm())
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { form, saveForm, clearForm }
})
