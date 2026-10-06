import '../../style/components/SidebarSection.css'

/*
 * SidebarSection
 * Organizza contenuti della sidebar in una sezione con titolo, sottotitolo e corpo personalizzabile.
 * utilizzo: <SidebarSection title="Filtri" subtitle="Seleziona le opzioni">{contenuto}</SidebarSection>
 * Accetta `title`, opzionalmente `subtitle`, e i contenuti desiderati dentro `children`.
 */
function SidebarSection({ title, subtitle, children, className = '' }) {
  const classes = ['sidebar-section', className].filter(Boolean).join(' ')

  return (
    <section className={classes}>
      <div className="sidebar-section__header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="sidebar-section__body">{children}</div>
    </section>
  )
}

export default SidebarSection
