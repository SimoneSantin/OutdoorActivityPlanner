import '../../style/authentication/AuthenticationView.css'
import '../../style/mapView/homePage.css'
import MapCanvas from '../components/MapCanvas'
import TopBar from '../components/TopBar'

function HomeView() {
  return (
    <div className="app-shell">
      <TopBar
        appName="Outdoor Activity Planner"
        userName="Lorenzo Colombo"
        userInitials="LC"
      />

      <main className="home-layout">
        <section className="map-stage" aria-label="Mappa principale">
          <MapCanvas />
        </section>
      </main>
    </div>
  )
}

export default HomeView