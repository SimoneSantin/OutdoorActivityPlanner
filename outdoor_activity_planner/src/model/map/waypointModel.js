export class WaypointModel {
  constructor(id, lat, lng, label = '') {
    this.id = id
    this.lat = lat
    this.lng = lng
    this.label = label
    this.position = [lat, lng]
  }

  static fromMapSelection({ lat, lng, label = '' }, index) {
    return new WaypointModel(
      `waypoint-${index}-${crypto.randomUUID()}`,
      Number(lat),
      Number(lng),
      label,
    )
  }
}