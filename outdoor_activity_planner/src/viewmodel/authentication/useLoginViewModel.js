import { useEffect, useState } from 'react'
import {
  signInUserWithEmailAndPassword,
  signInUserWithGoogle,
} from '../../services/authenticationService'
import { UserModel } from '../../model/authentication/userModel'
import {
  AUTH_METHODS,
  clearFieldError,
  createEmptyFeedback,
  INITIAL_AUTH_FORM_VALUES,
  INVALID_FORM_MESSAGE,
  normalizeEmailPasswordValues,
  validateEmailField,
} from './authenticationViewModelUtils'

export function validateLoginForm({ email, password }) {
  const errors = {}
  const emailError = validateEmailField(email)

  if (emailError) {
    errors.email = emailError
  }

  if (!password) {
    errors.password = 'Inserisci la password.'
  }

  return errors
}

function mapLoginError(error) {
  if (error?.code === 'auth/popup-closed-by-user') {
    return 'Accesso Google annullato prima del completamento.'
  }

  if (
    error?.code === 'auth/invalid-credential'
    || error?.code === 'auth/wrong-password'
    || error?.code === 'auth/user-not-found'
    || error?.code === 'auth/invalid-email'
  ) {
    return 'Credenziali non valide. Controlla email e password.'
  }

  return 'Accesso non riuscito. Riprova tra qualche istante.'
}
function useLoginViewModel({ onLoginSuccess, feedbackNotice } = {}) {
  const [formValues, setFormValues] = useState(INITIAL_AUTH_FORM_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [feedback, setFeedback] = useState(createEmptyFeedback)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeMethod, setActiveMethod] = useState('')
  const [authenticatedUser, setAuthenticatedUser] = useState(null)

  useEffect(() => {
    if (!feedbackNotice?.message) {
      return
    }

    setFeedback(feedbackNotice)
  }, [feedbackNotice])

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

  function handleAuthenticationSuccess(user, successMessage) {
    setAuthenticatedUser(user)
    setFormValues(INITIAL_AUTH_FORM_VALUES)
    setFeedback({
      type: 'success',
      message: successMessage,
    })

    onLoginSuccess?.(user)
  }

  async function executeAction({ method, action, onSuccess, mapErrorMessage }) {
    setActiveMethod(method)
    setIsSubmitting(true)
    setFieldErrors({})
    setFeedback(createEmptyFeedback())

    try {
      const result = await action()
      onSuccess(result)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: mapErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
      setActiveMethod('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedValues = normalizeEmailPasswordValues(formValues)
    const validationErrors = validateLoginForm(normalizedValues)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setFeedback({
        type: 'error',
        message: INVALID_FORM_MESSAGE,
      })
      return
    }

    await executeAction({
      method: AUTH_METHODS.password,
      action: () => signInUserWithEmailAndPassword(normalizedValues),
      onSuccess: (userRecord) => {
        const user = UserModel.fromRecord(userRecord)

        handleAuthenticationSuccess(user, `Accesso effettuato con successo per ${user.email}.`)
      },
      mapErrorMessage: mapLoginError,
    })
  }

  async function handleGoogleLogin() {
    await executeAction({
      method: AUTH_METHODS.google,
      action: () => signInUserWithGoogle(),
      onSuccess: (userRecord) => {
        const user = UserModel.fromRecord(userRecord)

        handleAuthenticationSuccess(user, `Accesso Google effettuato con successo per ${user.email}.`)
      },
      mapErrorMessage: mapLoginError,
    })
  }

  return {
    formValues,
    fieldErrors,
    feedback,
    isSubmitting,
    activeMethod,
    authenticatedUser,
    handleChange,
    handleSubmit,
    handleGoogleLogin,
  }
}

export default useLoginViewModel
