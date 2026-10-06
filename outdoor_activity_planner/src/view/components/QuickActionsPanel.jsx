import Button from './Button'
import SidebarSection from './SidebarSection'
import '../../style/components/QuickActionsPanel.css'

/*
 * QuickActionsPanel
 * Mostra un gruppo di azioni principali in formato sezione riutilizzabile.
 * utilizzo: <QuickActionsPanel title="Azioni rapide" actions={[{ label: "Nuovo percorso" }]} />
 */
function QuickActionsPanel({
  title,
  subtitle,
  actions = [],
  children,
  className = '',
}) {
  return (
    <SidebarSection title={title} subtitle={subtitle} className={className}>
      <div className="quick-actions-panel__list">
        {children ||
          actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || 'primary'}
              size={action.size || 'md'}
              onClick={action.onClick}
              leadingIcon={action.leadingIcon}
              trailingIcon={action.trailingIcon}
            >
              {action.label}
            </Button>
          ))}
      </div>
    </SidebarSection>
  )
}

export default QuickActionsPanel
