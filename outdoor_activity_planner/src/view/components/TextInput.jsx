import '../../style/components/TextInput.css'

/*
 * TextInput
 * Mostra un campo di inserimento testo riutilizzabile con label, messaggio di supporto e stato errore.
 * utilizzo: <TextInput label="Nome percorso" placeholder="Inserisci un nome" value={name} onChange={handleChange} />
 */
function TextInput({
  id,
  label,
  helperText,
  error,
  className = '',
  inputClassName = '',
  type = 'text',
  ...props
}) {
  const wrapperClasses = ['ui-text-input', error ? 'ui-text-input--error' : '', className]
    .filter(Boolean)
    .join(' ')

  const inputClasses = ['ui-text-input__field', inputClassName].filter(Boolean).join(' ')
  const hintId = id ? `${id}-hint` : undefined

  return (
    <label className={wrapperClasses} htmlFor={id}>
      {label ? <span className="ui-text-input__label">{label}</span> : null}

      <input
        id={id}
        type={type}
        className={inputClasses}
        aria-invalid={Boolean(error)}
        aria-describedby={helperText || error ? hintId : undefined}
        {...props}
      />

      {helperText || error ? (
        <span id={hintId} className="ui-text-input__hint">
          {error || helperText}
        </span>
      ) : null}
    </label>
  )
}

export default TextInput
