import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function serializeWaypoint(waypoint) {
  return {
    id: waypoint.id,
    position: waypoint.position,
    label: waypoint.label || '',
  }
}

export async function saveRoute(route) {
  if (!route?.userId) {
    throw new Error('userId mancante nel percorso')
  }

  if (!route?.id) {
    throw new Error('id mancante nel percorso')
  }

  const routeRef = doc(
    collection(db, 'users', route.userId, 'routes'),
    route.id,
  )

  await setDoc(routeRef, {
    id: route.id,
    userId: route.userId,
    name: route.name,
    description: route.description,
    waypoints: route.waypoints.map(serializeWaypoint),
    createdAt: route.createdAt,
  })

  return route.id
}