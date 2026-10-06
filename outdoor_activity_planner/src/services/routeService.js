import {
  mapWaypointsToCoordinates,
  mapResponseToRoute
} from "../model/api/routeMapper";

const API_CONFIG = {
  baseUrl: "https://api.openrouteservice.org/v2/directions",
  apiKey: import.meta.env.VITE_OPEN_ROUTE_SERVICE_API_KEY,
  defaultProfile: "foot-hiking",
};

export async function getRoute(waypoints) {
  const coordinates = mapWaypointsToCoordinates(waypoints);

  const response = await fetch(
    `${API_CONFIG.baseUrl}/${API_CONFIG.defaultProfile}/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: API_CONFIG.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }),
    }
  );

  if (!response.ok) {
    throw new Error("Errore nella richiesta API");
  }

  const data = await response.json();
  return mapResponseToRoute(data);
}