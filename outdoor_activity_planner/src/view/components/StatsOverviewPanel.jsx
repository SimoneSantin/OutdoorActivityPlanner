import SidebarSection from './SidebarSection'
import '../../style/components/StatsOverviewPanel.css'

/*
 * StatsOverviewPanel
 * Mostra una raccolta di metriche sintetiche in card compatte e riutilizzabili.
 * utilizzo: <StatsOverviewPanel title="Panoramica" stats={[{ value: "12", label: "Percorsi" }]} />
 */
function StatsOverviewPanel({ title, subtitle, stats = [], className = '' }) {
  return (
    <SidebarSection title={title} subtitle={subtitle} className={className}>
      <div className="stats-overview-panel__grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stats-overview-panel__card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </SidebarSection>
  )
}

export default StatsOverviewPanel
