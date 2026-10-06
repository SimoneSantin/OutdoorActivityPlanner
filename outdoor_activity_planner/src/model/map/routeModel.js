export class RouteModel {
  constructor(id, userId, name, description, waypoints, createdAt) {
    this.id = id
    this.userId = userId
    this.name = name
    this.description = description
    this.waypoints = waypoints
    this.createdAt = createdAt
  }

  static create({ userId, name, description, waypoints }) {
    return new RouteModel(
      `route-${crypto.randomUUID()}`,
      userId,
      name,
      description,
      waypoints,
      new Date().toISOString(),
    )
  }
}