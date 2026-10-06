# Autenticazione

Questa pagina descrive il modulo di autenticazione del progetto.

## Obiettivo

L'autenticazione consente di:

- creare un nuovo account;
- accedere con credenziali valide;
- richiedere il recupero password tramite email;
- mostrare un errore in caso di login non valido;
- reindirizzare l'utente alla home dopo autenticazione riuscita.

## Componenti coinvolti

- `LoginView`: landing page dell'applicazione e schermata di accesso.
- `PasswordRecoveryView`: schermata dedicata al recupero password.
- `RegistrationView`: schermata di registrazione utente.
- `HomeView`: home mostrata dopo login o registrazione completati.
- `App`: coordina la navigazione locale tra login, registrazione e home.
- `useLoginViewModel`: gestisce stato, validazione e submit del login.
- `usePasswordRecoveryViewModel`: gestisce stato, validazione e submit del recupero password.
- `useRegistrationViewModel`: gestisce stato, validazione e submit della registrazione.
- `authenticationViewModelUtils`: raccoglie la logica condivisa dei view model.
- `authenticationService`: incapsula le chiamate a Firebase Authentication e Firestore.
- `UserModel`: normalizza il record utente usato nell'applicazione.

## Flussi principali

### Login

- La landing page dell'app e `LoginView`.
- L'utente puo accedere con email e password oppure con Google.
- Il view model valida i dati inseriti prima di invocare il service.
- Se le credenziali non sono valide viene mostrato un messaggio di errore.
- Se il login va a buon fine l'utente viene reindirizzato alla home.

### Recupero password

- Dalla login l'utente puo aprire una schermata dedicata di recupero password.
- In `PasswordRecoveryView` inserisce l'email associata all'account.
- Se l'email esiste viene inviato un link di recupero e l'utente torna alla login.
- Se l'email non esiste viene mostrato un messaggio di errore.

### Registrazione

- L'utente puo registrarsi con email e password oppure con Google.
- Se i dati non sono validi il form mostra gli errori.
- In caso di registrazione riuscita viene creato o aggiornato il record utente in Firestore.
- Al termine del flusso l'utente viene reindirizzato alla home.

## Dati salvati

Per ogni utente viene salvato un documento in `users/{uid}` con questa struttura logica:

```json
{
  "uid": "user-id",
  "email": "utente@example.com",
  "provider": "password | google",
  "createdAt": "serverTimestamp()"
}
```

## Test

I test automatici coprono i seguenti aspetti:

- rendering delle schermate principali;
- validazione dei form;
- login e registrazione con email/password;
- login e registrazione con Google;
- recupero password con email valida o non presente;
- navigazione tra login e schermata di recupero password;
- gestione dei messaggi di errore;
- redirect alla home;
- persistenza e normalizzazione del record utente.
