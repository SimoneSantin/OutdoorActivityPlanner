import '../../style/components/IconButton.css'

/*
 * IconButton
 * Renderizza un pulsante compatto pensato per azioni rapide con icona e testo opzionale.
 * utilizzo: <IconButton icon={<MapIcon />} aria-label="Apri mappa">Mappa</IconButton>
 * Passa `icon` con un elemento JSX e, opzionalmente, `children` per una label visibile.
 */
function IconButton({
  icon,
  children,
  className = '',
  size = 'md',
  type = 'button',
  ...props
}) {
  const classes = ['ui-icon-button', `ui-icon-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {icon ? <span className="ui-icon-button__icon">{icon}</span> : null}
      {children ? <span className="ui-icon-button__label">{children}</span> : null}
    </button>
  )
}

export default IconButton
