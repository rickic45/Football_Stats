# FootballStats

Web service per consultare statistiche calcistiche delle 5 principali leghe europee, costruita con HTML/CSS/JS per il frontend e PHP per il backend. I dati sono reperiti da [API-Football](https://www.api-football.com/).

---

## Funzionalità

| Sezione | Descrizione |
|---|---|
| **Info squadra** | Nome, paese, anno di fondazione, stadio, città, capienza e tipo di manto; permette inoltre l'aggiunta ai preferiti |
| **Classifica** | Tabella completa della lega con punti, gol, differenza reti e forma recente; la squadra selezionata viene evidenziata |
| **Partite** | Elenco di tutte le gare della stagione con data, stadio e risultato |
| **Testa a Testa** | Confronto diretto tra due squadre nelle stagioni 2022-2024: riepilogo vittorie/pareggi/sconfitte e lista delle singole partite |
| **Preferiti** | Lista delle squadre salvate nei preferiti, con opzione di reindirizzamento alle informazioni o la rimozione |

---

## Leghe supportate

- Serie A
- Premier League
- La Liga
- Bundesliga
- Ligue 1

---

## Struttura del progetto

```
├── index.php               # Router PHP
├── .htaccess               # Riscrittura URL
├── .env                    # Chiave API
├── data/
    ├── leagues.json        # Risoluzione campionato ID
    └── teams.json          # Risoluzione squadra ID
    └── favorites.json      # Lista preferiti
├── frontend/
    ├── index.html          # Interfaccia utente
    ├── style.css           # Stile
    └── script.js           # Logica frontend 
└── endpoints/
    ├── info.php            # Informazioni squadra
    ├── standings.php       # Classifica
    ├── fixtures.php        # Partite
    ├── head2head.php       # Testa a testa
    └── favorites.php       # Squadre preferite
```

---

## Installazione

1. Clona il repository su un server con **PHP** e **Apache**.
2. Copia `.env.example` in `.env` e inserisci la tua chiave API:
3. Assicurati che `mod_rewrite` sia abilitato e che `.htaccess` venga letto.
4. Apri `index.html` nel browser.

---

## Come funziona

Il frontend chiama sempre `/football-api/index.php?url=<endpoint>&league=...&team=...&season=...`. Il file index.PHP valida i parametri, risolve gli ID tramite i JSON locali e inoltra la richiesta ai vari endpoints che effettueranno la chiamata ad API-Football

