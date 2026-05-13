# API RESTful per Statistiche di Calcio

Questa API fornisce dati sulle squadre di calcio, classifiche, partite e confronti testa a testa.

## Endpoint Disponibili

- `GET /info?league={lega}&team={squadra}&season={stagione}`
  - Restituisce informazioni sulla squadra e il suo stadio.

- `GET /standings?league={lega}&team={squadra}&season={stagione}`
  - Restituisce la classifica del campionato con la squadra evidenziata.

- `GET /fixtures?league={lega}&team={squadra}&season={stagione}`
  - Restituisce tutte le partite della squadra nella stagione.

- `GET /head2head?league={lega}&team={squadra}&opponent={avversario}&season={stagione}`
  - Restituisce le partite testa a testa tra due squadre.

## Parametri Comuni

- `league`: Il codice della lega (es. 'serie-a', 'premier-league').
- `team`: Lo slug della squadra (es. 'juventus', 'milan').
- `season`: L'anno della stagione (2022, 2023, 2024).
- `opponent`: Lo slug dell'avversario (solo per head2head).

## Configurazione

### File .env

Il file `.env` contiene la chiave API per accedere ai dati esterni. Questo file **NON deve essere condiviso** quando si carica il progetto su un repository pubblico (GitHub), perché contiene informazioni sensibili.

Esempio contenuto di `.env`:
```
API_KEY=la_tua_chiave_api_qui
```

Per ottenere una chiave API, registrati su [Football API Sports](https://v3.football.api-sports.io/).

### File .htaccess

Il file `.htaccess` è un file di configurazione per il server Apache. Permette di riscrivere gli URL in modo che tutte le richieste vengano indirizzate a `index.php`, che poi gestisce il routing interno.

Contenuto di `.htaccess`:
```
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php?url=$1 [L,QSA]
```

Questo significa che un URL come `/standings?league=serie-a&team=juventus` viene riscritto internamente come `index.php?url=standings&league=serie-a&team=juventus`.

## Come Usare

1. Assicurati di avere un server PHP con Apache (o simile) che supporti .htaccess.
2. Inserisci la tua chiave API nel file `.env`.
3. Carica i file sul server.
4. Fai richieste GET agli endpoint sopra.

## Esempi di Richieste

- `/info?league=serie-a&team=juventus&season=2024`
- `/standings?league=premier-league&team=arsenal&season=2023`
- `/fixtures?league=bundesliga&team=bayern-munich&season=2024`
- `/head2head?league=serie-a&team=juventus&opponent=milan&season=2024`

## Sicurezza

- Il file `.env` non viene tracciato da Git (aggiungilo a `.gitignore`).
- La chiave API è protetta perché non è nel codice sorgente.

## Semplificazioni per Studenti

Il codice è stato semplificato per studenti di quinta superiore:
- Uso di cicli `foreach` invece di funzioni avanzate come `array_map`.
- Commenti chiari in italiano.
- Struttura semplice senza framework complessi.
