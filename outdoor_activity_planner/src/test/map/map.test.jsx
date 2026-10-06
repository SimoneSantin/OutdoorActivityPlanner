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
    return <div data-testid="marker">{props.icon?.label}</div>
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

  function getSearchInput() {
    return screen.getByRole('searchbox')
  }

  test('renderizza il contenitore della mappa', () => {
    render(<MapCanvas />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  test('mostra la barra di ricerca', () => {
    render(<MapCanvas />)

    expect(getSearchInput()).toBeInTheDocument()
  })

  test('configura OpenStreetMap come tile provider', () => {
    render(<MapCanvas />)

    expect(tileLayerMock).toHaveBeenCalled()

    const props = tileLayerMock.mock.calls[0][0]

    expect(props.url).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    expect(props.attribution).toContain('OpenStreetMap')
  })

  test('imposta centro e zoom iniziali corretti', () => {
    render(<MapCanvas />)

    expect(mapContainerMock).toHaveBeenCalled()

    const props = mapContainerMock.mock.calls[0][0]

    expect(props.center).toEqual([45.4642, 9.19])
    expect(props.zoom).toBe(11)
  })

  test('non esegue la fetch con meno di 2 caratteri', () => {
    vi.useFakeTimers()

    render(<MapCanvas />)

    fireEvent.change(getSearchInput(), {
      target: { value: 'M' },
    })

    vi.advanceTimersByTime(400)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('esegue la fetch e mostra i suggerimenti', async () => {
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

    fireEvent.change(getSearchInput(), {
      target: { value: 'Mil' },
    })

    expect(
      await screen.findByText('Milano, Lombardia, Italia'),
    ).toBeInTheDocument()
  })

  test('seleziona un suggerimento e centra la mappa', async () => {
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

    const input = getSearchInput()

    fireEvent.change(input, {
      target: { value: 'Mil' },
    })

    const suggestion = await screen.findByText('Milano, Lombardia, Italia')

    await act(async () => {
      fireEvent.click(suggestion)
    })

    expect(input.value).toBe('Milano, Lombardia, Italia')
    
    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(1)
    expect(markers[0].textContent).toBe('1') 
    
    expect(setViewMock).toHaveBeenCalledWith(
      [45.4642, 9.19],
      13,
      { animate: true },
    )
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
    expect(markerMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ position: [45.5, 9.21] }),
    )
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

})
