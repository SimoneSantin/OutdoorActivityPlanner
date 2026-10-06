import '../../style/components/Button.css'

/*
 * Button
 * Renderizza un pulsante generico riutilizzabile con varianti visive e dimensioni diverse.
 * utilizzo: <Button variant="primary" size="md">Salva</Button>
 * Supporta `variant` (`primary`, `secondary`, `ghost`), `size` e, se serve,
 * `leadingIcon` o `trailingIcon` per aggiungere icone accanto al testo.
 */

function Button({
  children,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {leadingIcon ? <span className="ui-button__icon">{leadingIcon}</span> : null}
      <span className="ui-button__label">{children}</span>
      {trailingIcon ? <span className="ui-button__icon">{trailingIcon}</span> : null}
    </button>
  )
}

export default Button
