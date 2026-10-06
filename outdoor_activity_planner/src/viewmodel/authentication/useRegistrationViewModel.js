import { useState } from 'react'
import {
  registerUserWithEmailAndPassword,
  registerUserWithGoogle,
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

export function validateRegistrationForm({ email, password }) {
  const errors = {}
  const emailError = validateEmailField(email)

  if (emailError) {
    errors.email = emailError
  }

  if (!password) {
    errors.password = 'Inserisci una password.'
  } else if (password.length < 6) {
    errors.password = 'La password deve contenere almeno 6 caratteri.'
  }

  return errors
}

function mapRegistrationError(error) {
  if (error?.code === 'auth/email-already-in-use') {
    return 'Questa mail e gia registrata.'
  }

  if (error?.code === 'auth/popup-closed-by-user') {
    return 'Registrazione Google annullata prima del completamento.'
  }

  return 'Registrazione non riuscita. Riprova tra qualche istante.'
}

function useRegistrationViewModel({ onRegistrationSuccess } = {}) {
  const [formValues, setFormValues] = useState(INITIAL_AUTH_FORM_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [feedback, setFeedback] = useState(createEmptyFeedback)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeMethod, setActiveMethod] = useState('')
  const [registeredUser, setRegisteredUser] = useState(null)

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

  function handleRegistrationSuccess(user, message) {
    setRegisteredUser(user)
    setFormValues(INITIAL_AUTH_FORM_VALUES)
    setFeedback({
      type: 'success',
      message,
    })

    onRegistrationSuccess?.(user)
  }

  async function executeRegistration({ method, register, getSuccessMessage }) {
    setActiveMethod(method)
    setIsSubmitting(true)
    setFieldErrors({})
    setFeedback(createEmptyFeedback())

    try {
      const userRecord = await register()
      const user = UserModel.fromRecord(userRecord)

      handleRegistrationSuccess(user, getSuccessMessage(user))
    } catch (error) {
      setFeedback({
        type: 'error',
        message: mapRegistrationError(error),
      })
    } finally {
      setIsSubmitting(false)
      setActiveMethod('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedValues = normalizeEmailPasswordValues(formValues)
    const validationErrors = validateRegistrationForm(normalizedValues)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setFeedback({
        type: 'error',
        message: INVALID_FORM_MESSAGE,
      })
      return
    }

    await executeRegistration({
      method: AUTH_METHODS.password,
      register: () => registerUserWithEmailAndPassword(normalizedValues),
      getSuccessMessage: (user) => `Account creato con successo per ${user.email}.`,
    })
  }

  async function handleGoogleRegistration() {
    await executeRegistration({
      method: AUTH_METHODS.google,
      register: () => registerUserWithGoogle(),
      getSuccessMessage: (user) => `Account Google creato con successo per ${user.email}.`,
    })
  }

  return {
    formValues,
    fieldErrors,
    feedback,
    isSubmitting,
    activeMethod,
    registeredUser,
    handleChange,
    handleSubmit,
    handleGoogleRegistration,
  }
}

export default useRegistrationViewModel
