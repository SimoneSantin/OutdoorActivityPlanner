const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

export async function searchPlaces(query) {
  const response = await fetch(
    `${NOMINATIM_SEARCH_URL}?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
  )

  if (!response.ok) {
    throw new Error('Errore durante la ricerca')
  }

  const data = await response.json()

  return data.map((item) => ({
    id: item.place_id,
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }))
}
