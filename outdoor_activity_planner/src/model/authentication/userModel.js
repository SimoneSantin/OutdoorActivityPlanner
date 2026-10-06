export class UserModel {
  constructor(uid, email, provider, createdAt = null) {
    this.uid = uid
    this.email = email
    this.provider = provider
    this.createdAt = createdAt
  }

  static fromRecord(record) {
    if (!record) {
      return null
    }

    return new UserModel(
      record.uid,
      record.email,
      record.provider,
      record.createdAt ?? null,
    )
  }

  static fromFirestore(documentSnapshot) {
    if (!documentSnapshot?.exists()) {
      return null
    }

    const documentData = documentSnapshot.data()

    return new UserModel(
      documentData.uid ?? documentSnapshot.id,
      documentData.email,
      documentData.provider,
      documentData.createdAt ?? null,
    )
  }
}
