import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MapCanvas from '../../view/components/MapCanvas'
import { getRoute } from '../../services/routeService'

const mapContainerMock = vi.fn()
const tileLayerMock = vi.fn()
const markerMock = vi.fn()
const polylineMock = vi.fn()
const setViewMock = vi.fn()
let registeredMapEvents = {}

function createRouteResponse(coordinates) {
  return {
    ok: true,
    json: async () => ({
      features: [
        {
          geometry: {
            coordinates,
          },
          properties: {
            summary: {
              distance: 1000,
              duration: 600,
            },
          },
        },
      ],
    }),
  }
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

describe('getRoute', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('recupera un percorso', async () => {
    global.fetch.mockResolvedValue(
      createRouteResponse([
        [9.19, 45.4642],
        [9.2, 45.47],
      ]),
    )

    const waypoints = [
      { lat: 45.4642, lng: 9.19 },
      { lat: 45.47, lng: 9.2 },
    ]

    const result = await getRoute(waypoints)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/foot-hiking/geojson'),
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(result).toEqual({
      coordinates: [
        [45.4642, 9.19],
        [45.47, 9.2],
      ],
      distance: 1000,
      duration: 600,
    })
  })
})

describe('MapCanvas route', () => {
  beforeEach(() => {
    mapContainerMock.mockClear()
    tileLayerMock.mockClear()
    markerMock.mockClear()
    polylineMock.mockClear()
    setViewMock.mockClear()
    registeredMapEvents = {}

    global.fetch = vi.fn(async (_url, options = {}) => {
      const requestBody = options.body
        ? JSON.parse(options.body)
        : { coordinates: [] }

      return createRouteResponse(requestBody.coordinates)
    })
  })

  it('non mostra il percorso con meno di due waypoint', () => {
    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.21 },
      })
    })

    expect(screen.getAllByTestId('marker')).toHaveLength(1)
    expect(screen.queryByTestId('route-polyline')).not.toBeInTheDocument()
  })

  it('traccia il percorso quando esistono almeno due waypoint', async () => {
    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.21 },
      })
    })

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.52, lng: 9.24 },
      })
    })

    expect(
      await screen.findByText('[[45.5,9.21],[45.52,9.24]]'),
    ).toBeInTheDocument()
    expect(polylineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        positions: [[45.5, 9.21], [45.52, 9.24]],
      }),
    )
  })

  it('aggiorna il percorso quando viene aggiunto un nuovo waypoint', async () => {
    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.21 },
      })
    })

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.52, lng: 9.24 },
      })
    })

    await screen.findByTestId('route-polyline')

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.55, lng: 9.27 },
      })
    })

    expect(
      await screen.findByText('[[45.5,9.21],[45.52,9.24],[45.55,9.27]]'),
    ).toBeInTheDocument()
  })

  it('aggiorna automaticamente il percorso quando un waypoint viene rimosso', async () => {
    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.21 },
      })
    })

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.52, lng: 9.24 },
      })
    })

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.55, lng: 9.27 },
      })
    })

    expect(
      await screen.findByText('[[45.5,9.21],[45.52,9.24],[45.55,9.27]]'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getAllByTestId('marker')[1])

    expect(
      await screen.findByText('[[45.5,9.21],[45.55,9.27]]'),
    ).toBeInTheDocument()
  })
})
