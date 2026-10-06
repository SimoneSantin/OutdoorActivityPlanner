import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../view/App'
import LoginView from '../../view/authentication/LoginView'
import {
  signInUserWithEmailAndPassword,
  signInUserWithGoogle,
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

describe('Story 1.2 - Login utente', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    signInWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        uid: 'login-user-123',
        email: 'utente@example.com',
      },
    })

    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        uid: 'registered-user-123',
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
    sendPasswordResetEmailMock.mockResolvedValue(undefined)
  })

  it('mostra la login come landing page dell applicazione', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Login utente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accedi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continua con Google' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hai dimenticato la password?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crea un account' })).toBeInTheDocument()
  })

  it('richiede email valida e password prima del login', async () => {
    const user = userEvent.setup()

    render(<LoginView />)

    await user.type(screen.getByLabelText('Email'), 'mail-non-valida')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    expect(screen.getByText('Inserisci una mail valida.')).toBeInTheDocument()
    expect(screen.getByText('Inserisci la password.')).toBeInTheDocument()
    expect(signInWithEmailAndPasswordMock).not.toHaveBeenCalled()
  })

  it('consente il login solo con credenziali valide', async () => {
    const user = userEvent.setup()

    render(<LoginView />)

    await user.type(screen.getByLabelText('Email'), 'utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      'utente@example.com',
      'password123',
    )
    expect(
      await screen.findByText('Accesso effettuato con successo per utente@example.com.'),
    ).toBeInTheDocument()
  })

  it('mostra un messaggio di errore se le credenziali non sono valide', async () => {
    const user = userEvent.setup()

    signInWithEmailAndPasswordMock.mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    })

    render(<LoginView />)

    await user.type(screen.getByLabelText('Email'), 'utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password-sbagliata')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    expect(
      await screen.findByText('Credenziali non valide. Controlla email e password.'),
    ).toBeInTheDocument()
  })

  it('reindirizza alla home dopo un login riuscito', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Email'), 'utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument()
    expect(screen.getByLabelText('Mappa principale')).toBeInTheDocument()
  })

  it('consente il login con Google e reindirizza alla home', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Continua con Google' }))

    expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument()
    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(GoogleAuthProviderMock).toHaveBeenCalledTimes(1)
  })

  it('mostra un messaggio di errore se il popup Google viene chiuso', async () => {
    const user = userEvent.setup()

    signInWithPopupMock.mockRejectedValueOnce({
      code: 'auth/popup-closed-by-user',
    })

    render(<LoginView />)

    await user.click(screen.getByRole('button', { name: 'Continua con Google' }))

    expect(
      await screen.findByText('Accesso Google annullato prima del completamento.'),
    ).toBeInTheDocument()
  })

  it('apre la pagina di recupero password dalla login', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Hai dimenticato la password?' }))

    expect(screen.getByRole('heading', { name: 'Recupero password' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invia link di recupero' })).toBeInTheDocument()
  })

  it('integra il passaggio alla registrazione e porta alla home dopo il completamento', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Crea un account' }))

    expect(screen.getByRole('heading', { name: 'Registrazione utente' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'nuovo.utente@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crea account' }))

    expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })
})

describe('authenticationService login', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    signInWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        uid: 'service-login-user',
        email: 'service.login@example.com',
      },
    })
  })

  it('normalizza il risultato del login con email e password', async () => {
    const result = await signInUserWithEmailAndPassword({
      email: 'service.login@example.com',
      password: 'password123',
    })

    expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      'service.login@example.com',
      'password123',
    )

    expect(result).toEqual({
      uid: 'service-login-user',
      email: 'service.login@example.com',
      provider: 'password',
    })
  })

  it('normalizza e persiste il risultato del login con Google', async () => {
    signInWithPopupMock.mockResolvedValueOnce({
      user: {
        uid: 'service-google-login-user',
        email: 'service.google@example.com',
      },
    })

    docMock.mockImplementation((dbInstance, collectionName, documentId) => ({
      dbInstance,
      collectionName,
      documentId,
    }))

    setDocMock.mockResolvedValueOnce(undefined)
    serverTimestampMock.mockReturnValueOnce('service-google-server-timestamp')

    const result = await signInUserWithGoogle()

    expect(GoogleAuthProviderMock).toHaveBeenCalledTimes(1)
    expect(signInWithPopupMock).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      expect.any(GoogleAuthProviderMock),
    )
    expect(docMock).toHaveBeenCalledWith(
      { name: 'firestore-instance' },
      'users',
      'service-google-login-user',
    )
    expect(setDocMock).toHaveBeenCalledWith(
      {
        dbInstance: { name: 'firestore-instance' },
        collectionName: 'users',
        documentId: 'service-google-login-user',
      },
      {
        uid: 'service-google-login-user',
        email: 'service.google@example.com',
        provider: 'google',
        createdAt: 'service-google-server-timestamp',
      },
    )
    expect(result).toEqual({
      uid: 'service-google-login-user',
      email: 'service.google@example.com',
      provider: 'google',
      createdAt: 'service-google-server-timestamp',
    })
  })
})
