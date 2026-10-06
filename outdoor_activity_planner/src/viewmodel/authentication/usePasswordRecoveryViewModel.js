import { useState } from 'react'
import { sendPasswordResetLink } from '../../services/authenticationService'
import {
  AUTH_METHODS,
  clearFieldError,
  createEmptyFeedback,
  INVALID_FORM_MESSAGE,
  validateEmailField,
} from './authenticationViewModelUtils'

const INITIAL_PASSWORD_RECOVERY_FORM_VALUES = Object.freeze({
  email: '',
})

export function validatePasswordRecoveryForm({ email }) {
  const errors = {}
  const emailError = validateEmailField(email)

  if (emailError) {
    errors.email = emailError
  }

  return errors
}

function mapPasswordRecoveryError(error) {
  if (error?.code === 'auth/user-not-found') {
    return 'Non esiste alcun account associato a questa email.'
  }

  if (error?.code === 'auth/invalid-email') {
    return 'Inserisci una mail valida.'
  }

  return 'Recupero password non riuscito. Riprova tra qualche istante.'
}

function usePasswordRecoveryViewModel({ onRecoverySuccess } = {}) {
  const [formValues, setFormValues] = useState(INITIAL_PASSWORD_RECOVERY_FORM_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [feedback, setFeedback] = useState(createEmptyFeedback)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeMethod, setActiveMethod] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setFieldErrors((currentErrors) => clearFieldError(currentErrors, name))

    if (feedback.type) {
      setFeedback(createEmptyFeedback())
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedValues = {
      email: formValues.email.trim(),
    }

    const validationErrors = validatePasswordRecoveryForm(normalizedValues)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setFeedback({
        type: 'error',
        message: INVALID_FORM_MESSAGE,
      })
      return
    }

    setActiveMethod(AUTH_METHODS.passwordRecovery)
    setIsSubmitting(true)
    setFieldErrors({})
    setFeedback(createEmptyFeedback())

    try {
      const result = await sendPasswordResetLink(normalizedValues.email)
      const successMessage = `Abbiamo inviato un link per il recupero password a ${result.email}.`

      setFeedback({
        type: 'success',
        message: successMessage,
      })

      onRecoverySuccess?.(successMessage)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: mapPasswordRecoveryError(error),
      })
    } finally {
      setIsSubmitting(false)
      setActiveMethod('')
    }
  }

  return {
    formValues,
    fieldErrors,
    feedback,
    isSubmitting,
    activeMethod,
    handleChange,
    handleSubmit,
  }
}

export default usePasswordRecoveryViewModel
