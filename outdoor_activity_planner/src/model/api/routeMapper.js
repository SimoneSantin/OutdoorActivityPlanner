export function mapWaypointsToCoordinates(waypoints) {
  return waypoints.map(p => [p.lng, p.lat]);
}

export function mapResponseToRoute(data) {
  const feature = data.features[0];
  const summary = feature.properties.summary;

  return {
    coordinates: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distance: summary.distance,
    duration: summary.duration,
  };
}