import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../view/App'
import PasswordRecoveryView from '../../view/authentication/PasswordRecoveryView'
import { sendPasswordResetLink } from '../../services/authenticationService'

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

describe('Story 1.3 - Recupero password', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sendPasswordResetEmailMock.mockResolvedValue(undefined)
    setDocMock.mockResolvedValue(undefined)
    serverTimestampMock.mockReturnValue('mocked-server-timestamp')
  })

  it('richiede una mail valida prima di inviare il link di recupero password', async () => {
    const user = userEvent.setup()

    render(<PasswordRecoveryView />)

    await user.click(screen.getByRole('button', { name: 'Invia link di recupero' }))

    expect(screen.getByText('Inserisci un indirizzo email.')).toBeInTheDocument()
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled()
  })

  it('invia il link di recupero password se la mail e presente e torna alla login', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Hai dimenticato la password?' }))
    await user.type(screen.getByLabelText('Email'), 'utente@example.com')
    await user.click(screen.getByRole('button', { name: 'Invia link di recupero' }))

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      'utente@example.com',
    )
    expect(await screen.findByRole('heading', { name: 'Login utente' })).toBeInTheDocument()
    expect(
      screen.getByText('Abbiamo inviato un link per il recupero password a utente@example.com.'),
    ).toBeInTheDocument()
  })

  it('mostra un messaggio di errore se la mail non e presente', async () => {
    const user = userEvent.setup()

    sendPasswordResetEmailMock.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    })

    render(<PasswordRecoveryView />)

    await user.type(screen.getByLabelText('Email'), 'utente.sconosciuto@example.com')
    await user.click(screen.getByRole('button', { name: 'Invia link di recupero' }))

    expect(
      await screen.findByText('Non esiste alcun account associato a questa email.'),
    ).toBeInTheDocument()
  })
})

describe('authenticationService password recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sendPasswordResetEmailMock.mockResolvedValue(undefined)
  })

  it('invia il link di recupero password alla mail fornita', async () => {
    const result = await sendPasswordResetLink('service.login@example.com')

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      'service.login@example.com',
    )
    expect(result).toEqual({
      email: 'service.login@example.com',
    })
  })
})
