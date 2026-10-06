# Gestione Mappa

Questa pagina descrive il modulo di gestione della mappa del progetto.

## Obiettivo

La gestione della mappa consente di:

- visualizzare una mappa interattiva nella home;
- navigare liberamente (pan e zoom);
- cercare una localita tramite barra di ricerca;
- visualizzare suggerimenti dinamici durante la ricerca;
- selezionare una localita e centrare la mappa su di essa;
- selezionare un punto sulla mappa per aggiungere un waypoint;
- visualizzare waypoint multipli sulla mappa;
- visualizzare il percorso passante per tutti i waypoint selezionati;
- aggiornare automaticamente il percorso quando i waypoint cambiano;
- rimuovere un waypoint selezionato per modificare il percorso.

## Componenti coinvolti

- `MapCanvas`: componente principale che gestisce la mappa e le interazioni.
- `SearchBar`: componente per l'inserimento del testo e la visualizzazione dei suggerimenti.
- `useMapViewModel`: view model che gestisce stato e logica della mappa.
- `WaypointModel`: model utilizzato per rappresentare i waypoint selezionati sulla mappa.
- `mapSearchService`: service dedicato alla ricerca delle localita.
- `routeService`: service dedicato al recupero del percorso a partire dai waypoint.
- `routeMapper`: mapper utilizzato per convertire waypoint e risposta API nel formato interno dell'applicazione.
- `react-leaflet`: libreria utilizzata per integrare la mappa in React.
- `OpenStreetMap`: provider delle tile della mappa.
- `Nominatim API`: servizio utilizzato per la ricerca delle localita.
- `OpenRouteService`: servizio utilizzato per calcolare il percorso tra waypoint.

## Flussi principali

### Visualizzazione mappa

- La mappa viene mostrata nella schermata principale dell'applicazione.
- Il componente `MapCanvas` inizializza la mappa con un centro e uno zoom di default.
- L'utente puo:
  - spostarsi sulla mappa tramite drag;
  - effettuare zoom avanti e indietro.
- La mappa utilizza OpenStreetMap come tile provider.

### Ricerca zona

- L'utente inserisce una query nella barra di ricerca (`SearchBar`).
- Dopo un breve debounce, viene effettuata una chiamata alla API Nominatim.
- I risultati vengono mostrati come lista di suggerimenti.
- L'utente seleziona un suggerimento.
- La mappa viene centrata automaticamente sulla posizione selezionata.

### Aggiunta waypoint

- L'utente puo selezionare un punto direttamente sulla mappa.
- Ogni selezione crea un nuovo waypoint.
- Il waypoint viene visualizzato con lo stesso indicatore grafico utilizzato per i punti mostrati durante la ricerca.
- I waypoint vengono mantenuti in una lista e possono essere multipli.

### Visualizzazione percorso

- Se sono presenti almeno due waypoint, viene richiesto il calcolo del percorso al service dedicato.
- Il percorso restituito viene visualizzato sulla mappa come linea che collega i punti selezionati.
- Quando viene aggiunto un nuovo waypoint, il percorso viene ricalcolato automaticamente.
- Quando un waypoint viene rimosso, il percorso viene aggiornato in modo coerente con i punti rimanenti.
- In caso di errore nel recupero del percorso, viene comunque mostrata una linea di collegamento diretta tra i waypoint gia selezionati.

### Rimozione waypoint

- L'utente puo selezionare un waypoint gia presente sulla mappa.
- Cliccando nuovamente sul marker, il waypoint viene rimosso.
- Dopo la rimozione, i waypoint rimanenti vengono automaticamente rinumerati.
- La rimozione avviene aggiornando lo stato dei waypoint nel view model.

### Salvataggio percorso

- Quando è presente almeno un waypoint, viene mostrata una sidebar dedicata alla creazione del percorso.
- L'utente può inserire:
  - nome del percorso (obbligatorio);
  - descrizione (opzionale).
- Al click sul pulsante "Salva percorso":
  - viene validato il nome;
  - viene verificata la presenza di almeno un waypoint;
  - viene recuperato l'utente autenticato;
  - viene creato un oggetto `RouteModel`.

- Il percorso viene salvato su Firestore nella collection specifica dello user
- I dati salvati includono:
  - id del percorso;
  - userId;
  - nome;
  - descrizione;
  - lista dei waypoint;
  - timestamp di creazione.

- Dopo il salvataggio:
  - i waypoint vengono resettati;
  - il form viene svuotato;
  - la sidebar viene chiusa automaticamente;
  - viene mostrato un messaggio di conferma temporaneo.

- In caso di errore:
  - viene mostrato un messaggio all'utente;
  - il salvataggio non viene completato.

## Dati utilizzati

I dati delle localita vengono recuperati tramite Nominatim e includono:

```json
{
  "place_id": "id",
  "display_name": "nome completo della localita",
  "lat": "latitudine",
  "lon": "longitudine"
}
```

Questi dati vengono utilizzati per:

- mostrare i suggerimenti all'utente;
- aggiornare la posizione della mappa.

I waypoint vengono invece modellati con una struttura logica di questo tipo:

```json
{
  "id": "waypoint-1",
  "lat": 45.4642,
  "lng": 9.19,
  "position": [45.4642, 9.19]
}
```

Il percorso viene gestito con una struttura logica di questo tipo:

```json
{
  "coordinates": [
    [45.4642, 9.19],
    [45.47, 9.2]
  ],
  "distance": 1000,
  "duration": 600
}
```

Questi dati vengono utilizzati per:

- tracciare il percorso sulla mappa;
- aggiornare dinamicamente la linea quando i waypoint cambiano;
- mantenere disponibili distanza e durata per eventuali estensioni;

## Test

I test automatici coprono i seguenti aspetti:

- rendering del contenitore della mappa;
- presenza della barra di ricerca;
- configurazione corretta di OpenStreetMap come tile provider;
- impostazione del centro e dello zoom iniziali;
- esecuzione della chiamata API durante la ricerca;
- visualizzazione dei suggerimenti;
- selezione di un suggerimento;
- aggiornamento della posizione della mappa;
- gestione degli errori nella ricerca;
- creazione di un waypoint al click sulla mappa;
- visualizzazione di waypoint multipli;
- visualizzazione del percorso quando esistono almeno due waypoint;
- aggiornamento del percorso quando viene aggiunto un nuovo waypoint;
- rimozione di un waypoint tramite selezione del marker;
- aggiornamento corretto della lista dei waypoint dopo la rimozione;
- rinumerazione dei waypoint dopo la rimozione;
- aggiornamento automatico del percorso dopo la rimozione di un waypoint;
- normalizzazione della risposta del service di routing.
- Salvataggio percorso con messaggio di errore se il nome è vuoto
- Salvataggio corretto del percorso
- Reset dello stato dopo il salvataggio del percorso

## Limitazioni

- Non tutte le vie o indirizzi sono presenti nel database OpenStreetMap.
- I risultati della ricerca dipendono dalla qualita dei dati OSM.
- Possibili ambiguita nei nomi delle localita.
- Il servizio Nominatim pubblico ha limitazioni di utilizzo.
- Il calcolo del percorso dipende dalla disponibilita del servizio OpenRouteService e dalla corretta configurazione della relativa API key.
