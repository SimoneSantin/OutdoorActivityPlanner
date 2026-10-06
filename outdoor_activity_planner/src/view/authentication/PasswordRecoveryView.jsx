import Button from '../components/Button'
import SidebarSection from '../components/SidebarSection'
import TextInput from '../components/TextInput'
import usePasswordRecoveryViewModel from '../../viewmodel/authentication/usePasswordRecoveryViewModel'
import appLogo from '../../assets/favicon.png'
import '../../style/authentication/AuthenticationView.css'

function PasswordRecoveryView({ onRecoverySuccess, onShowLogin }) {
  const {
    formValues,
    fieldErrors,
    feedback,
    isSubmitting,
    activeMethod,
    handleChange,
    handleSubmit,
  } = usePasswordRecoveryViewModel({ onRecoverySuccess })

  const feedbackClassName = feedback.type ? `authentication-feedback authentication-feedback--${feedback.type}` : ''

  return (
    <main className="authentication-page authentication-page--recovery">
      <section className="authentication-hero" aria-label="Introduzione recupero password">
        <div className="authentication-hero__content">
          <div className="authentication-hero__brand">
            <img src={appLogo} alt="Outdoor Activity Planner" className="authentication-hero__logo" />
            <span>Outdoor Activity Planner</span>
          </div>

          <div className="authentication-hero__copy">
            <h1>Recupera la password.</h1>
            <p>
              Inserisci l&apos;email associata al tuo account per ricevere
              il link con cui impostarne una nuova.
            </p>
          </div>
        </div>
      </section>

      <section className="authentication-panel" aria-label="Form di recupero password">
        <SidebarSection
          className="authentication-card"
          title="Recupero password"
          subtitle="Inserisci l'email registrata per ricevere il link di recupero."
        >
          <form className="authentication-form" onSubmit={handleSubmit} noValidate>
            <TextInput
              id="password-recovery-email"
              name="email"
              type="email"
              label="Email"
              placeholder="nome.cognome@email.it"
              autoComplete="email"
              value={formValues.email}
              error={fieldErrors.email}
              onChange={handleChange}
            />

            {feedback.message ? (
              <p className={feedbackClassName} role="status" aria-live="polite">
                {feedback.message}
              </p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && activeMethod === 'password-recovery'
                ? 'Invio link...'
                : 'Invia link di recupero'}
            </Button>
          </form>

          <Button
            variant="ghost"
            className="authentication-switch-button"
            onClick={onShowLogin}
            disabled={isSubmitting}
          >
            Torna al login
          </Button>
        </SidebarSection>
      </section>
    </main>
  )
}

export default PasswordRecoveryView
