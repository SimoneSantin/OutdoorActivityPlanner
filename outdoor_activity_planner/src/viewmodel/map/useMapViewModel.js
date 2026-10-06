import { useEffect, useState } from 'react'
import { WaypointModel } from '../../model/map/waypointModel'
import { RouteModel } from '../../model/map/routeModel'
import { searchPlaces } from '../../services/mapSearchService'
import { getRoute } from '../../services/routeService'
import { saveRoute } from '../../services/routeSavingService'
import { auth } from '../../services/firebase'

const DEFAULT_MAP_CENTER = [45.4642, 9.19]
const DEFAULT_MAP_ZOOM = 11
const SELECTED_PLACE_ZOOM = 13
const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
const SAVE_SUCCESS_MESSAGE_DURATION_MS = 3000

function useMapViewModel() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [error, setError] = useState('')
  const [waypoints, setWaypoints] = useState([])
  const [route, setRoute] = useState(null)

  const [routeName, setRouteName] = useState('')
  const [routeDescription, setRouteDescription] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('')

  function appendWaypoint({ lat, lng, label = '' }) {
    setWaypoints((currentWaypoints) => [
      ...currentWaypoints,
      WaypointModel.fromMapSelection(
        { lat, lng, label },
        currentWaypoints.length + 1,
      ),
    ])
  }

  function removeWaypointById(waypointId) {
    setWaypoints((currentWaypoints) =>
      currentWaypoints.filter((waypoint) => waypoint.id !== waypointId),
    )
  }

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setError('')
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setError('')
        setSuggestions(await searchPlaces(trimmedQuery))
      } catch (requestError) {
        console.error(requestError)
        setSuggestions([])
        setError('Impossibile completare la ricerca')
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    let isCurrentEffect = true

    if (waypoints.length < 2) {
      setRoute(null)
      return () => {
        isCurrentEffect = false
      }
    }

    async function updateRoute() {
      try {
        const nextRoute = await getRoute(waypoints)

        if (isCurrentEffect) {
          setRoute(nextRoute)
        }
      } catch (routeError) {
        console.error(routeError)

        if (isCurrentEffect) {
          setRoute({
            coordinates: waypoints.map((waypoint) => waypoint.position),
          })
        }
      }
    }

    updateRoute()

    return () => {
      isCurrentEffect = false
    }
  }, [waypoints])

  useEffect(() => {
    if (!saveSuccessMessage) {
      return
    }

    const timeoutId = setTimeout(() => {
      setSaveSuccessMessage('')
    }, SAVE_SUCCESS_MESSAGE_DURATION_MS)

    return () => clearTimeout(timeoutId)
  }, [saveSuccessMessage])

  function handleQueryChange(event) {
    setQuery(event.target.value)

    if (error) {
      setError('')
    }
  }

  function handleSuggestionSelection(place) {
    setSelectedPlace(place)
    setQuery(place.label)
    setSuggestions([])
    setError('')

    appendWaypoint({
      lat: place.lat,
      lng: place.lng,
      label: place.label,
    })
  }

  function handleMapSelection({ lat, lng }) {
    appendWaypoint({ lat, lng })
  }

  function handleWaypointRemoval(waypointId) {
    removeWaypointById(waypointId)
  }

  function handleRouteNameChange(event) {
    setRouteName(event.target.value)

    if (saveError) {
      setSaveError('')
    }

    if (saveSuccessMessage) {
      setSaveSuccessMessage('')
    }
  }

  function handleRouteDescriptionChange(event) {
    setRouteDescription(event.target.value)

    if (saveError) {
      setSaveError('')
    }

    if (saveSuccessMessage) {
      setSaveSuccessMessage('')
    }
  }

  async function handleRouteSave() {
    const currentUser = auth.currentUser

    if (!currentUser?.uid) {
      setSaveError('Utente non autenticato')
      setSaveSuccessMessage('')
      return
    }

    const trimmedName = routeName.trim()
    const trimmedDescription = routeDescription.trim()

    if (!trimmedName) {
      setSaveError('Inserisci un nome per il percorso')
      setSaveSuccessMessage('')
      return
    }

    if (waypoints.length === 0) {
      setSaveError('Aggiungi almeno un waypoint')
      setSaveSuccessMessage('')
      return
    }

    try {
      setIsSaving(true)
      setSaveError('')
      setSaveSuccessMessage('')

      const routeToSave = RouteModel.create({
        userId: currentUser.uid,
        name: trimmedName,
        description: trimmedDescription,
        waypoints,
      })

      await saveRoute(routeToSave)

      setWaypoints([])
      setRoute(null)
      setRouteName('')
      setRouteDescription('')
      setSelectedPlace(null)
      setQuery('')
      setSuggestions([])
      setSaveSuccessMessage('Percorso salvato correttamente')
    } catch (saveRequestError) {
      console.error(saveRequestError)
      setSaveError(
        saveRequestError.message || 'Impossibile salvare il percorso',
      )
      setSaveSuccessMessage('')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    mapCenter: DEFAULT_MAP_CENTER,
    mapZoom: DEFAULT_MAP_ZOOM,
    selectedPlaceZoom: SELECTED_PLACE_ZOOM,
    query,
    suggestions,
    error,
    selectedPlacePosition: selectedPlace
      ? [selectedPlace.lat, selectedPlace.lng]
      : null,
    waypoints,
    routeCoordinates: route?.coordinates || [],
    isSidebarOpen: waypoints.length > 0,
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
  }
}

export default useMapViewModel