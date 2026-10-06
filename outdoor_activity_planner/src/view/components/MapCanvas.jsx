import '../../style/components/MapCanvas.css'
import { useEffect } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import 'leaflet/dist/leaflet.css'
import useMapViewModel from '../../viewmodel/map/useMapViewModel'
import SearchBar from './SearchBar'

const ROUTE_STYLE = {
  color: '#1d7a55',
  weight: 5,
  opacity: 0.9,
}

function createWaypointIcon(index) {
  return divIcon({
    className: 'map-canvas__waypoint-icon',
    html: `<span class="map-canvas__waypoint-icon-label">${index}</span>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  })
}

function MapSearchController({ selectedPlacePosition, selectedPlaceZoom }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedPlacePosition) {
      return
    }

    map.setView(selectedPlacePosition, selectedPlaceZoom, {
      animate: true,
    })
  }, [map, selectedPlacePosition, selectedPlaceZoom])

  return null
}

function MapInteractionController({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng)
    },
  })

  return null
}

function formatWaypointDescription(waypoint, index) {
  if (waypoint.label) {
    return waypoint.label
  }

  const [lat, lng] = waypoint.position
  return `Waypoint ${index + 1} · ${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

function MapCanvas() {
  const {
    mapCenter,
    mapZoom,
    selectedPlaceZoom,
    query,
    suggestions,
    error,
    selectedPlacePosition,
    waypoints,
    routeCoordinates,
    isSidebarOpen,
    routeName,
    routeDescription,
    saveError,
    isSaving,
    saveSuccessMessage,
    handleQueryChange,
    handleSuggestionSelection,
    handleMapSelection,
    handleWaypointRemoval,
    handleRouteNameChange,
    handleRouteDescriptionChange,
    handleRouteSave,
  } = useMapViewModel()

  return (
    <section
      className={`map-layout ${isSidebarOpen ? 'map-layout--with-sidebar' : ''}`}
    >
      <div className="map-layout__map-wrapper">
        <section className="map-canvas">
          <div className="map-canvas__map">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapInteractionController onMapClick={handleMapSelection} />

              <MapSearchController
                selectedPlacePosition={selectedPlacePosition}
                selectedPlaceZoom={selectedPlaceZoom}
              />

              {routeCoordinates.length >= 2 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={ROUTE_STYLE}
                />
              )}

              {waypoints.map((waypoint, index) => (
                <Marker
                  key={waypoint.id}
                  position={waypoint.position}
                  icon={createWaypointIcon(index + 1)}
                  eventHandlers={{
                    click: () => handleWaypointRemoval(waypoint.id),
                  }}
                />
              ))}
            </MapContainer>
          </div>

          <div className="map-canvas__overlay">
            <div className="map-stage__search">
              <SearchBar
                value={query}
                onChange={handleQueryChange}
                suggestions={suggestions}
                onSelectSuggestion={handleSuggestionSelection}
                placeholder="Cerca una localita"
              />

              {error && <div className="map-stage__error">{error}</div>}
              {saveSuccessMessage && (
                <div className="map-stage__success">{saveSuccessMessage}</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isSidebarOpen && (
        <aside className="map-layout__sidebar">
          <div className="route-sidebar">
            <div className="route-sidebar__header">
              <h2>Percorso corrente</h2>
              <p>{waypoints.length} waypoint selezionati</p>
            </div>

            <div className="route-sidebar__waypoints">
              {waypoints.map((waypoint, index) => (
                <div key={waypoint.id} className="route-sidebar__waypoint-card">
                  <div className="route-sidebar__waypoint-index">
                    {index + 1}
                  </div>

                  <div className="route-sidebar__waypoint-content">
                    <p className="route-sidebar__waypoint-title">
                      {waypoint.label || `Waypoint ${index + 1}`}
                    </p>
                    <p className="route-sidebar__waypoint-subtitle">
                      {formatWaypointDescription(waypoint, index)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="route-sidebar__save-section">
              <label className="route-sidebar__field">
                <span>Nome percorso</span>
                <input
                  type="text"
                  value={routeName}
                  onChange={handleRouteNameChange}
                  placeholder="Inserisci un nome"
                />
              </label>

              <label className="route-sidebar__field">
                <span>Descrizione</span>
                <textarea
                  value={routeDescription}
                  onChange={handleRouteDescriptionChange}
                  placeholder="Aggiungi una descrizione"
                  rows={4}
                />
              </label>

              {saveError && (
                <div className="route-sidebar__error">{saveError}</div>
              )}

              <button
                type="button"
                className="route-sidebar__save-button"
                onClick={handleRouteSave}
                disabled={isSaving}
              >
                {isSaving ? 'Salvataggio...' : 'Salva percorso'}
              </button>
            </div>
          </div>
        </aside>
      )}
    </section>
  )
}

export default MapCanvas