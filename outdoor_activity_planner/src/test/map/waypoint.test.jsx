import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import MapCanvas from '../../view/components/MapCanvas'
import { getRoute } from '../../services/routeService'

const mapContainerMock = vi.fn()
const tileLayerMock = vi.fn()
const markerMock = vi.fn()
const polylineMock = vi.fn()
const setViewMock = vi.fn()
let registeredMapEvents = {}

function getSearchInput() {
  return screen.getByPlaceholderText('Cerca una localita')
}

vi.mock('leaflet', () => ({
  divIcon: (options) => ({
    ...options,
    label: String(options.html).replace(/<[^>]+>/g, ''),
  }),
}))

vi.mock('react-leaflet', () => ({
  MapContainer: (props) => {
    mapContainerMock(props)
    return <div data-testid="map-container">{props.children}</div>
  },
  TileLayer: (props) => {
    tileLayerMock(props)
    return <div data-testid="tile-layer" />
  },
  Marker: (props) => {
    markerMock(props)

    return (
      <button
        type="button"
        data-testid="marker"
        onClick={() => props.eventHandlers?.click?.()}
      >
        {props.icon?.label}
      </button>
    )
  },
  Polyline: (props) => {
    polylineMock(props)

    return <div data-testid="route-polyline">{JSON.stringify(props.positions)}</div>
  },
}))

vi.mock('../../services/routeService', () => ({
  getRoute: vi.fn(),
}))

vi.mock('react-leaflet/hooks', () => ({
  useMap: () => ({
    setView: setViewMock,
  }),
  useMapEvents: (events) => {
    registeredMapEvents = events
    return {
      on: vi.fn(),
      off: vi.fn(),
    }
  },
}))

describe('MapCanvas', () => {
  beforeEach(() => {
    mapContainerMock.mockClear()
    tileLayerMock.mockClear()
    markerMock.mockClear()
    polylineMock.mockClear()
    setViewMock.mockClear()
    registeredMapEvents = {}

    global.fetch = vi.fn()
    vi.mocked(getRoute).mockImplementation(async (waypoints) => ({
      coordinates: [],
      distance: 0,
      duration: 0,
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('numera progressivamente anche i waypoint aggiunti dalla ricerca', async () => {
    vi.useRealTimers()

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          place_id: 1,
          display_name: 'Milano, Lombardia, Italia',
          lat: '45.4642',
          lon: '9.19',
        },
      ],
    })

    render(<MapCanvas />)

    fireEvent.change(getSearchInput(), { target: { value: 'Mil' } })

    const suggestion = await screen.findByText('Milano, Lombardia, Italia')
    await act(async () => {
      fireEvent.click(suggestion)
    })

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.52, lng: 9.24 } })
    })

    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
    expect(markers[0].textContent).toBe('1')
    expect(markers[1].textContent).toBe('2')
  })

  test('crea un waypoint usando lo stesso marker della ricerca', async () => {
    render(<MapCanvas />)

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.5, lng: 9.21 } })
    })

    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(1)
    expect(markers[0].textContent).toBe('1')
  })

  test('consente di aggiungere waypoint multipli', async () => {
    render(<MapCanvas />)

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.5, lng: 9.21 } })
    })
    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.52, lng: 9.24 } })
    })

    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
    expect(markers[0].textContent).toBe('1')
    expect(markers[1].textContent).toBe('2')
  })

  // Verifica che cliccando un waypoint esistente questo venga rimosso dalla mappa
  test('rimuove un waypoint quando il marker viene riselezionato', async () => {
    render(<MapCanvas />)

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.5, lng: 9.21 } })
    })

    expect(screen.getAllByTestId('marker')).toHaveLength(1)

    await act(async () => {
      fireEvent.click(screen.getByTestId('marker'))
    })

    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  // Verifica che, rimuovendo uno dei waypoint presenti, restino visibili solo quelli non selezionati
  test('rimuove solo il waypoint selezionato lasciando invariati gli altri', async () => {
    render(<MapCanvas />)

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.5, lng: 9.21 } })
    })

    await act(async () => {
      registeredMapEvents.click({ latlng: { lat: 45.52, lng: 9.24 } })
    })

    let markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)

    await act(async () => {
      fireEvent.click(markers[0])
    })

    markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(1)
    
    expect(markers[0].textContent).toBe('1')

  })
})
