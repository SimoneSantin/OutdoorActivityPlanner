import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import MapCanvas from '../../view/components/MapCanvas'

const saveRouteMock = vi.fn()
const setViewMock = vi.fn()
let registeredMapEvents = {}

vi.mock('../../services/routeSavingService', () => ({
  saveRoute: (...args) => saveRouteMock(...args),
}))

vi.mock('../../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user' },
  },
}))

vi.mock('leaflet', () => ({
  divIcon: (options) => ({
    ...options,
    label: String(options.html).replace(/<[^>]+>/g, ''),
  }),
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
  Polyline: () => <div data-testid="polyline" />,
  Marker: (props) => (
    <button
      type="button"
      data-testid="marker"
      onClick={() => props.eventHandlers?.click?.()}
    >
      {props.icon?.label}
    </button>
  ),
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

describe('Salvataggio percorso', () => {
  beforeEach(() => {
    saveRouteMock.mockClear()
    setViewMock.mockClear()
    registeredMapEvents = {}
  })

  // Verifica che venga mostrato un errore se l'utente prova a salvare senza inserire un nome
  test('mostra errore se il nome è vuoto', async () => {
    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.2 },
      })
    })

    fireEvent.click(screen.getByText('Salva percorso'))

    expect(
      await screen.findByText('Inserisci un nome per il percorso'),
    ).toBeInTheDocument()
  })

  // Verifica che il percorso venga salvato correttamente quando è presente almeno un waypoint e il nome è valido
  test('salva correttamente il percorso', async () => {
    saveRouteMock.mockResolvedValue('route-1')

    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.2 },
      })
    })

    fireEvent.change(screen.getByPlaceholderText('Inserisci un nome'), {
      target: { value: 'Percorso test' },
    })

    fireEvent.click(screen.getByText('Salva percorso'))

    expect(saveRouteMock).toHaveBeenCalledTimes(1)

    expect(saveRouteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user',
        name: 'Percorso test',
      }),
    )

    expect(
      await screen.findByText('Percorso salvato correttamente'),
    ).toBeInTheDocument()
  })

  // Verifica che dopo il salvataggio il form venga svuotato e la sidebar si chiuda
  test('resetta lo stato dopo il salvataggio', async () => {
    saveRouteMock.mockResolvedValue('route-1')

    render(<MapCanvas />)

    act(() => {
      registeredMapEvents.click({
        latlng: { lat: 45.5, lng: 9.2 },
      })
    })

    const nameInput = screen.getByPlaceholderText('Inserisci un nome')

    fireEvent.change(nameInput, {
      target: { value: 'Percorso test' },
    })

    fireEvent.click(screen.getByText('Salva percorso'))

    await screen.findByText('Percorso salvato correttamente')

    expect(screen.queryByPlaceholderText('Inserisci un nome')).not.toBeInTheDocument()
    expect(screen.queryByText('Salva percorso')).not.toBeInTheDocument()
  })
})