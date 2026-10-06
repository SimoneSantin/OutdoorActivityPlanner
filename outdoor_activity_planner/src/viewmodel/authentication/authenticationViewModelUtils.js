export const AUTH_METHODS = Object.freeze({
  password: 'password',
  google: 'google',
  passwordRecovery: 'password-recovery',
})

export const INITIAL_AUTH_FORM_VALUES = Object.freeze({
  email: '',
  password: '',
})

const INITIAL_FEEDBACK = Object.freeze({
  type: '',
  message: '',
})

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const INVALID_FORM_MESSAGE = 'Controlla i dati inseriti e riprova.'

export function createEmptyFeedback() {
  return { ...INITIAL_FEEDBACK }
}

export function normalizeEmailPasswordValues({ email, password }) {
  return {
    email: email.trim(),
    password,
  }
}

export function clearFieldError(currentErrors, fieldName) {
  if (!currentErrors[fieldName]) {
    return currentErrors
  }

  return {
    ...currentErrors,
    [fieldName]: '',
  }
}

export function validateEmailField(email) {
  if (!email.trim()) {
    return 'Inserisci un indirizzo email.'
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Inserisci una mail valida.'
  }

  return ''
}
