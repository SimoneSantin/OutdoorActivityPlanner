import { useState } from 'react'
import HomeView from './homepage/HomeView'
import LoginView from './authentication/LoginView'
import PasswordRecoveryView from './authentication/PasswordRecoveryView'
import RegistrationView from './authentication/RegistrationView'

const APP_SECTIONS = {
  login: 'login',
  passwordRecovery: 'passwordRecovery',
  registration: 'registration',
  home: 'home',
}

function App() {
  const [currentSection, setCurrentSection] = useState(APP_SECTIONS.login)
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [loginFeedbackNotice, setLoginFeedbackNotice] = useState(null)

  function handleAuthenticationSuccess(user) {
    setAuthenticatedUser(user)
    setLoginFeedbackNotice(null)
    setCurrentSection(APP_SECTIONS.home)
  }

  function showLoginSection(feedbackNotice = null) {
    setLoginFeedbackNotice(feedbackNotice)
    setCurrentSection(APP_SECTIONS.login)
  }

  if (currentSection === APP_SECTIONS.registration) {
    return (
      <RegistrationView
        onRegistrationSuccess={handleAuthenticationSuccess}
        onShowLogin={() => showLoginSection()}
      />
    )
  }

  if (currentSection === APP_SECTIONS.passwordRecovery) {
    return (
      <PasswordRecoveryView
        onRecoverySuccess={(message) => showLoginSection({
          type: 'success',
          message,
        })}
        onShowLogin={() => showLoginSection()}
      />
    )
  }

  if (currentSection === APP_SECTIONS.home) {
    return <HomeView user={authenticatedUser} />
  }

  return (
    <LoginView
      feedbackNotice={loginFeedbackNotice}
      onLoginSuccess={handleAuthenticationSuccess}
      onShowPasswordRecovery={() => {
        setLoginFeedbackNotice(null)
        setCurrentSection(APP_SECTIONS.passwordRecovery)
      }}
      onShowRegistration={() => {
        setLoginFeedbackNotice(null)
        setCurrentSection(APP_SECTIONS.registration)
      }}
    />
  )
}

export default App
