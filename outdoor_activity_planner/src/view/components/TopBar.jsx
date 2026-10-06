import AvatarButton from './AvatarButton'
import Button from './Button'
import appLogo from '../../assets/favicon.png'
import '../../style/components/TopBar.css'

/*
 * TopBar
 * Costruisce la barra superiore dell'app con logo, nome applicazione e azioni utente.
 * utilizzo: <TopBar appName="Outdoor Planner" userName="Mario Rossi" userInitials="MR" />
 * Supporta `onHomeClick`, `onProfileClick`, `onLogoutClick`, `logoSrc` e `logoAlt`.
 */
function TopBar({
  appName,
  userName,
  userInitials,
  logoSrc = appLogo,
  logoAlt = 'Logo applicazione',
  onHomeClick,
  onProfileClick,
  onLogoutClick,
}) {
  return (
    <header className="top-bar">
      <button type="button" className="top-bar__brand" onClick={onHomeClick}>
        <img src={logoSrc} alt={logoAlt} className="top-bar__brand-logo" />
        <span className="top-bar__brand-text">{appName}</span>
      </button>

      <div className="top-bar__actions">
        <Button variant="ghost" size="sm" onClick={onLogoutClick}>
          Logout
        </Button>
        <AvatarButton
          userName={userName}
          initials={userInitials}
          actionLabel="Sezione profilo"
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}

export default TopBar
