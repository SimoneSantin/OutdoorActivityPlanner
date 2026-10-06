import '../../style/components/SearchBar.css'

/*
 * SearchBar
 * Mostra un campo di ricerca pronto all'uso con icona integrata e stile coerente con la UI.
 * utilizzo: <SearchBar value={query} onChange={handleChange} placeholder="Cerca un percorso" />
 * Puoi usarlo come input controllato tramite `value` e `onChange`, oppure solo con `placeholder`.
 */


function SearchBar({
  value,
  onChange,
  placeholder = 'Cerca',
  className = '',
  suggestions = [],
  onSelectSuggestion,
  ...props
}) {
  const classes = ['ui-search-bar', className].filter(Boolean).join(' ')

  return (
    <div className="ui-search-bar-wrapper">
      <label className={classes}>
        <span className="ui-search-bar__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path
              d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.44 4.44 1.06-1.06-4.44-4.44A6.5 6.5 0 0 0 10.5 4Zm0 1.5A5 5 0 1 1 7 7a4.98 4.98 0 0 1 3.5-1.5Z"
              fill="currentColor"
            />
          </svg>
        </span>

        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      </label>

      {suggestions.length > 0 && (
        <ul className="ui-search-bar__suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="ui-search-bar__suggestion-item"
                onClick={() => onSelectSuggestion?.(suggestion)}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar