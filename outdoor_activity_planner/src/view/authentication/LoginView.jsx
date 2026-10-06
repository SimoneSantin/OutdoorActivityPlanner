import Button from '../components/Button'
import SidebarSection from '../components/SidebarSection'
import TextInput from '../components/TextInput'
import useLoginViewModel from '../../viewmodel/authentication/useLoginViewModel'
import appLogo from '../../assets/favicon.png'
import '../../style/authentication/AuthenticationView.css'

function LoginView({ feedbackNotice, onLoginSuccess, onShowPasswordRecovery, onShowRegistration }) {
  const {
    formValues,
    fieldErrors,
    feedback,
    isSubmitting,
    activeMethod,
    authenticatedUser,
    handleChange,
    handleSubmit,
    handleGoogleLogin,
  } = useLoginViewModel({ onLoginSuccess, feedbackNotice })

  const feedbackClassName = feedback.type ? `authentication-feedback authentication-feedback--${feedback.type}` : ''

  return (
    <main className="authentication-page authentication-page--login">
      <section className="authentication-hero" aria-label="Introduzione login">
        <div className="authentication-hero__content">
          <div className="authentication-hero__brand">
            <img src={appLogo} alt="Outdoor Activity Planner" className="authentication-hero__logo" />
            <span>Outdoor Activity Planner</span>
          </div>

          <div className="authentication-hero__copy">
            <h1>Accedi ai tuoi percorsi.</h1>
            <p>
              Effettua il login con email e password per ritrovare rapidamente
              le tue attivita e continuare a pianificare.
            </p>
          </div>
        </div>
      </section>

      <section className="authentication-panel" aria-label="Form di login">
        <SidebarSection
          className="authentication-card"
          title="Login utente"
          subtitle="Inserisci le tue credenziali per accedere all'applicazione."
        >
          <form className="authentication-form" onSubmit={handleSubmit} noValidate>
            <TextInput
              id="login-email"
              name="email"
              type="email"
              label="Email"
              placeholder="nome.cognome@email.it"
              autoComplete="email"
              value={formValues.email}
              error={fieldErrors.email}
              onChange={handleChange}
            />

            <TextInput
              id="login-password"
              name="password"
              type="password"
              label="Password"
              placeholder="Inserisci la password"
              autoComplete="current-password"
              value={formValues.password}
              error={fieldErrors.password}
              onChange={handleChange}
            />

            <Button
              variant="ghost"
              className="authentication-inline-action"
              onClick={onShowPasswordRecovery}
              disabled={isSubmitting}
            >
              Hai dimenticato la password?
            </Button>

            {feedback.message ? (
              <p className={feedbackClassName} role="status" aria-live="polite">
                {feedback.message}
              </p>
            ) : null}

            {authenticatedUser ? (
              <p className="authentication-user-summary">
                Accesso eseguito come <strong>{authenticatedUser.email}</strong>
              </p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && activeMethod === 'password' ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          <div className="authentication-divider" aria-hidden="true">
            <span>oppure</span>
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            leadingIcon={(
              <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <path
                  d="M21.81 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.56h5.53c-.11.89-.72 2.24-2.08 3.14l-.02.12 3 2.28.21.02c1.96-1.77 2.97-4.38 2.97-7.32Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.2 21.9c2.71 0 4.99-.87 6.65-2.36l-3.17-2.42c-.85.58-1.98.99-3.48.99-2.65 0-4.9-1.74-5.71-4.14l-.12.01-3.12 2.37-.04.11c1.65 3.2 5.03 5.44 8.99 5.44Z"
                  fill="#34A853"
                />
                <path
                  d="M6.49 13.97a5.8 5.8 0 0 1-.34-1.97c0-.69.12-1.36.33-1.97l-.01-.13-3.16-2.4-.1.04A9.72 9.72 0 0 0 2.2 12c0 1.56.38 3.03 1.02 4.33l3.27-2.36Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.2 5.9c1.89 0 3.17.8 3.9 1.47l2.85-2.72C17.18 3.08 14.91 2.1 12.2 2.1c-3.96 0-7.34 2.24-8.99 5.44l3.27 2.49c.82-2.4 3.07-4.13 5.72-4.13Z"
                  fill="#EA4335"
                />
              </svg>
            )}
          >
            {isSubmitting && activeMethod === 'google'
              ? 'Accesso Google...'
              : 'Continua con Google'}
          </Button>

          <Button
            variant="ghost"
            className="authentication-switch-button"
            onClick={onShowRegistration}
            disabled={isSubmitting}
          >
            Crea un account
          </Button>
        </SidebarSection>
      </section>
    </main>
  )
}

export default LoginView
