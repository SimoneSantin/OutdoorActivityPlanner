import '../../style/components/AvatarButton.css'

/*
 * AvatarButton
 * Mostra il pulsante utente per accedere rapidamente al profilo.
 * utilizzo: <AvatarButton userName="Mario Rossi" initials="MR" onClick={handleProfileClick} />
 * Opzionalmente puoi usare `imageSrc` per mostrare un avatar reale e `actionLabel`
 * per personalizzare il testo secondario.
 */
function AvatarButton({
  userName,
  initials,
  imageSrc,
  actionLabel = 'Apri profilo',
  className = '',
  ...props
}) {
  const classes = ['ui-avatar-button', className].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} {...props}>
      {imageSrc ? (
        <img src={imageSrc} alt={userName} className="ui-avatar-button__image" />
      ) : (
        <span className="ui-avatar-button__fallback" aria-hidden="true">
          {initials}
        </span>
      )}
      <span className="ui-avatar-button__text">
        <strong className="ui-avatar-button__user">{userName}</strong>
        <small className="ui-avatar-button__meta">{actionLabel}</small>
      </span>
      <span className="ui-avatar-button__chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path
            d="M9.53 7.97a.75.75 0 0 1 1.06 0L14.62 12l-4.03 4.03a.75.75 0 1 1-1.06-1.06L12.5 12 9.53 9.03a.75.75 0 0 1 0-1.06Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  )
}

export default AvatarButton
