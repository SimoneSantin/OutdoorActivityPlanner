import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegistrationView from '../../view/authentication/RegistrationView'
import { UserModel } from '../../model/authentication/userModel'
import {
  registerUserWithEmailAndPassword,
  registerUserWithGoogle,
} from '../../services/authenticationService'

const {
  createUserWithEmailAndPasswordMock,
  sendPasswordResetEmailMock,
  signInWithEmailAndPasswordMock,
  signInWithPopupMock,
  GoogleAuthProviderMock,
  docMock,
  setDocMock,
  serverTimestampMock,
} = vi.hoisted(() => ({
  createUserWithEmailAndPasswordMock: vi.fn(),
  sendPasswordResetEmailMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  signInWithPopupMock: vi.fn(),
  GoogleAuthProviderMock: vi.fn(function GoogleAuthProvider() {}),
  docMock: vi.fn(),
  setDocMock: vi.fn(),
  serverTimestampMock: vi.fn(),
}))

vi.mock('../../services/firebase', () => ({
  auth: { name: 'auth-instance' },
  db: { name: 'firestore-instance' },
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signInWithPopup: signInWithPopupMock,
  GoogleAuthProvider: GoogleAuthProviderMock,
}))

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}))

describe('Story 1.1 - Registrazione utente', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        uid: 'user-123',
        email: 'nuovo.utente@example.com',
      },
    })

    signInWithPopupMock.mockResolvedValue({
      user: {
        uid: 'google-user-123',
        email: 'utente.google@example.com',
      },
    })

    docMock.mockImplementation((dbInstance, collectionName, documentId) => ({
      dbInstance,
      collectionName,
      documentId,
    }))

    setDocMock.mockResolvedValue(undefined)
    serverTimestampMock.mockReturnValue('mocked-server-timestamp')
  })

  it('permette allo user di effettuare la registrazione tramite form', () => {
    render(<RegistrationView />)

    expect(screen.getByRole('heading', { name: 'Registrazione utente' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crea account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continua con Google' })).toBeInTheDocument()
  })

  it('richiede una mail e una password validi prima di procedere con la registrazione', async () => {
    const user = userEvent.setup()

    render(<RegistrationView />)

    await user.type(screen.getByLabelText('Email'), 'mail-non-valida')
    await user.type(screen.getByLabelText(/Password/i), '123')
    await user.click(screen.getByRole('button', { name: 'Crea account' }))

    expect(screen.getByText('Inserisci una mail valida.')).toBeInTheDocument()
    expect(
      screen.getByText('La password deve contenere almeno 6 caratteri.'),
    ).toBeInTheDocument()
    expect(createUserWithEmailAndPasswordMock).not.toHaveBeenCalled()
  })

  it('crea l’account quando la registrazione con email e password va a buon fine', async () => {
    const user = userEvent.setup()

    render(<RegistrationView />)

    await user.type(screen.getByLabelText('Email'), 'nuovo.utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crea account' }))

    expect(
      await screen.findByText('Account creato con successo per nuovo.utente@example.com.'),
    ).toBeInTheDocument()
  })

  it('mostra un messaggio di errore se la mail e gia registrata', async () => {
    const user = userEvent.setup()

    createUserWithEmailAndPasswordMock.mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
    })

    render(<RegistrationView />)

    await user.type(screen.getByLabelText('Email'), 'nuovo.utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crea account' }))

    expect(await screen.findByText('Questa mail e gia registrata.')).toBeInTheDocument()
  })

  it('crea l’account anche con Google quando la registrazione va a buon fine', async () => {
    const user = userEvent.setup()

    render(<RegistrationView />)

    await user.click(screen.getByRole('button', { name: 'Continua con Google' }))

    expect(
      await screen.findByText('Account Google creato con successo per utente.google@example.com.'),
    ).toBeInTheDocument()
  })
})

describe('authenticationService', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        uid: 'model-user-1',
        email: 'model@example.com',
      },
    })

    signInWithPopupMock.mockResolvedValue({
      user: {
        uid: 'google-model-user-1',
        email: 'google.model@example.com',
      },
    })

    docMock.mockImplementation((dbInstance, collectionName, documentId) => ({
      dbInstance,
      collectionName,
      documentId,
    }))

    setDocMock.mockResolvedValue(undefined)
    serverTimestampMock.mockReturnValue('model-server-timestamp')
  })

  it('salva su firestore l’utente registrato con email e password nella collection users', async () => {
    const result = await registerUserWithEmailAndPassword({
      email: 'model@example.com',
      password: 'password123',
    })

    expect(result).toEqual({
      uid: 'model-user-1',
      email: 'model@example.com',
      provider: 'password',
      createdAt: 'model-server-timestamp',
    })

    expect(docMock).toHaveBeenCalledWith(
      { name: 'firestore-instance' },
      'users',
      'model-user-1',
    )

    expect(setDocMock).toHaveBeenCalledWith(
      {
        dbInstance: { name: 'firestore-instance' },
        collectionName: 'users',
        documentId: 'model-user-1',
      },
      {
        uid: 'model-user-1',
        email: 'model@example.com',
        provider: 'password',
        createdAt: 'model-server-timestamp',
      },
    )
  })

  it('salva su firestore l’utente registrato con Google nella collection users', async () => {
    const result = await registerUserWithGoogle()

    expect(result).toEqual({
      uid: 'google-model-user-1',
      email: 'google.model@example.com',
      provider: 'google',
      createdAt: 'model-server-timestamp',
    })

    expect(GoogleAuthProviderMock).toHaveBeenCalledTimes(1)
    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(docMock).toHaveBeenCalledWith(
      { name: 'firestore-instance' },
      'users',
      'google-model-user-1',
    )

    expect(setDocMock).toHaveBeenCalledWith(
      {
        dbInstance: { name: 'firestore-instance' },
        collectionName: 'users',
        documentId: 'google-model-user-1',
      },
      {
        uid: 'google-model-user-1',
        email: 'google.model@example.com',
        provider: 'google',
        createdAt: 'model-server-timestamp',
      },
    )
  })
})

describe('userModel', () => {
  it('normalizza un record utente nel model applicativo', () => {
    const user = UserModel.fromRecord({
      uid: 'user-record-1',
      email: 'record@example.com',
      provider: 'google',
      createdAt: 'record-created-at',
    })

    expect(user).toBeInstanceOf(UserModel)
    expect(user).toEqual({
      uid: 'user-record-1',
      email: 'record@example.com',
      provider: 'google',
      createdAt: 'record-created-at',
    })
  })

  it('parsa un documento firestore nel model utente', () => {
    const snapshot = {
      id: 'firestore-user-1',
      exists: () => true,
      data: () => ({
        email: 'firestore@example.com',
        provider: 'password',
        createdAt: 'firestore-created-at',
      }),
    }

    const user = UserModel.fromFirestore(snapshot)

    expect(user).toBeInstanceOf(UserModel)
    expect(user).toEqual({
      uid: 'firestore-user-1',
      email: 'firestore@example.com',
      provider: 'password',
      createdAt: 'firestore-created-at',
    })
  })
})
