import SidebarSection from './SidebarSection'
import '../../style/components/ActivitySuggestionsPanel.css'

/*
 * ActivitySuggestionsPanel
 * Mostra una lista di suggerimenti o contenuti descrittivi in card ordinate.
 * utilizzo: <ActivitySuggestionsPanel title="Suggerimenti" activities={[{ title: "Trail", description: "...", meta: "Facile" }]} />
 */
function ActivitySuggestionsPanel({
  title,
  subtitle,
  activities = [],
  className = '',
}) {
  return (
    <SidebarSection title={title} subtitle={subtitle} className={className}>
      <div className="activity-suggestions-panel__list">
        {activities.map((activity) => (
          <article key={activity.title} className="activity-suggestions-panel__card">
            <div className="activity-suggestions-panel__meta">{activity.meta}</div>
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
          </article>
        ))}
      </div>
    </SidebarSection>
  )
}

export default ActivitySuggestionsPanel
