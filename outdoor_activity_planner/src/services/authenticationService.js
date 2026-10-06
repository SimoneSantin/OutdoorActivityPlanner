import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const USERS_COLLECTION = 'users'
const AUTHENTICATION_PROVIDERS = Object.freeze({
  password: 'password',
  google: 'google',
})

const USER_RECORD_PERSISTENCE_DEPENDENCIES = {
  db,
  doc,
  setDoc,
  serverTimestamp,
}

const GOOGLE_AUTHENTICATION_SERVICE_DEPENDENCIES = {
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  ...USER_RECORD_PERSISTENCE_DEPENDENCIES,
}

const EMAIL_PASSWORD_REGISTRATION_SERVICE_DEPENDENCIES = {
  auth,
  createUserWithEmailAndPassword,
  ...USER_RECORD_PERSISTENCE_DEPENDENCIES,
}

const EMAIL_PASSWORD_LOGIN_SERVICE_DEPENDENCIES = {
  auth,
  signInWithEmailAndPassword,
}

const PASSWORD_RESET_SERVICE_DEPENDENCIES = {
  auth,
  sendPasswordResetEmail,
}

function buildAuthenticatedUserData(user, fallbackEmail = '', provider) {
  return {
    uid: user.uid,
    email: user.email ?? fallbackEmail,
    provider,
  }
}

async function saveUserRecordToFirestore(
  user,
  provider,
  dependencies = USER_RECORD_PERSISTENCE_DEPENDENCIES,
) {
  const {
    db: dbInstance,
    doc: createDocumentReference,
    setDoc: writeDocument,
    serverTimestamp: createServerTimestamp,
  } = dependencies

  const createdAt = createServerTimestamp()
  const userRecord = {
    ...buildAuthenticatedUserData(user, '', provider),
    createdAt,
  }

  const userDocumentReference = createDocumentReference(
    dbInstance,
    USERS_COLLECTION,
    userRecord.uid,
  )

  await writeDocument(userDocumentReference, {
    ...userRecord,
  })

  return userRecord
}

async function signInWithGooglePopup(
  dependencies = GOOGLE_AUTHENTICATION_SERVICE_DEPENDENCIES,
) {
  const {
    auth: authInstance,
    signInWithPopup: openPopup,
    GoogleAuthProvider: GoogleProvider,
  } = dependencies

  const googleProvider = new GoogleProvider()
  const credential = await openPopup(authInstance, googleProvider)

  return credential.user
}

async function signInWithGoogleAndSaveUserRecord(
  dependencies = GOOGLE_AUTHENTICATION_SERVICE_DEPENDENCIES,
) {
  const authenticatedUser = await signInWithGooglePopup(dependencies)

  return saveUserRecordToFirestore(
    authenticatedUser,
    AUTHENTICATION_PROVIDERS.google,
    dependencies,
  )
}

export async function registerUserWithEmailAndPassword(
  { email, password },
  dependencies = EMAIL_PASSWORD_REGISTRATION_SERVICE_DEPENDENCIES,
) {
  const {
    auth: authInstance,
    createUserWithEmailAndPassword: createUser,
  } = dependencies

  const credential = await createUser(authInstance, email, password)

  return saveUserRecordToFirestore(
    buildAuthenticatedUserData(credential.user, email, AUTHENTICATION_PROVIDERS.password),
    AUTHENTICATION_PROVIDERS.password,
    dependencies,
  )
}

export async function registerUserWithGoogle(
  dependencies = GOOGLE_AUTHENTICATION_SERVICE_DEPENDENCIES,
) {
  return signInWithGoogleAndSaveUserRecord(dependencies)
}

export async function signInUserWithEmailAndPassword(
  { email, password },
  dependencies = EMAIL_PASSWORD_LOGIN_SERVICE_DEPENDENCIES,
) {
  const {
    auth: authInstance,
    signInWithEmailAndPassword: signInUser,
  } = dependencies

  const credential = await signInUser(authInstance, email, password)

  return buildAuthenticatedUserData(
    credential.user,
    email,
    AUTHENTICATION_PROVIDERS.password,
  )
}

export async function signInUserWithGoogle(
  dependencies = GOOGLE_AUTHENTICATION_SERVICE_DEPENDENCIES,
) {
  return signInWithGoogleAndSaveUserRecord(dependencies)
}

export async function sendPasswordResetLink(
  email,
  dependencies = PASSWORD_RESET_SERVICE_DEPENDENCIES,
) {
  const {
    auth: authInstance,
    sendPasswordResetEmail: sendRecoveryEmail,
  } = dependencies

  await sendRecoveryEmail(authInstance, email)

  return { email }
}
