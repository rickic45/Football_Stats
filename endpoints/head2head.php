<?php
function chiama_api($endpoint) {
    $url = API_URL . $endpoint;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "x-apisports-key: " . API_KEY
    ]);

    $risposta = curl_exec($ch);
    $errore = curl_error($ch);
    curl_close($ch);

    if ($errore) {
        http_response_code(500);
        echo json_encode(["errore" => "Errore di connessione: " . $errore]);
        exit;
    }

    $dati = json_decode($risposta, true);
    if ($dati === null) {
        http_response_code(500);
        echo json_encode(["errore" => "Risposta API non valida"]);
        exit;
    }

    return $dati;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

// GET /head2head?league=...&team=...&opponent=...&season=...
$league = $_GET['league'] ?? null;
$team = $_GET['team'] ?? null;
$opponent = $_GET['opponent'] ?? null;
$season = $_GET['season'] ?? '2024';

if (!$league || !$team || !$opponent) {
    http_response_code(400);
    echo json_encode(["error" => "Parametri 'league', 'team' e 'opponent' obbligatori"]);
    exit;
}

if ($opponent === $team) {
    http_response_code(400);
    echo json_encode(["error" => "La squadra e l'avversario non possono essere uguali."]);
    exit;
}

// Valida stagione
$stagioni_valide = ['2022', '2023', '2024'];
if (!in_array($season, $stagioni_valide)) {
    http_response_code(400);
    echo json_encode(["error" => "Stagione non valida. Usa 2022, 2023 o 2024."]);
    exit;
}

// Valida lega
if (!isset($leagues[$league])) {
    http_response_code(404);
    echo json_encode(["error" => "Lega non trovata."]);
    exit;
}

$league_id = $leagues[$league];

// Valida squadre
if (!isset($teams[$league][$team])) {
    http_response_code(404);
    echo json_encode(["error" => "Squadra non trovata in questa lega."]);
    exit;
}

if (!isset($teams[$league][$opponent])) {
    http_response_code(404);
    echo json_encode(["error" => "Avversario non trovato in questa lega."]);
    exit;
}

$team_id = $teams[$league][$team];
$opponent_id = $teams[$league][$opponent];

// Chiama API
$dati = chiama_api("fixtures?team=" . $team_id . "&league=" . $league_id . "&season=" . $season);
$fixture = $dati['response'] ?? [];

if (!$fixture) {
    http_response_code(404);
    echo json_encode(["error" => "Nessuna partita trovata per questa stagione."]);
    exit;
}

// Filtra solo le partite testa a testa
$h2h = [];
foreach ($fixture as $f) {
    $home = $f['teams']['home']['id'];
    $away = $f['teams']['away']['id'];
    if (($home === $team_id && $away === $opponent_id) || ($home === $opponent_id && $away === $team_id)) {
        $h2h[] = $f;
    }
}

if (!$h2h) {
    http_response_code(404);
    echo json_encode(["error" => "Nessuna partita testa a testa trovata tra le due squadre in questa stagione."]);
    exit;
}

// Mappa ogni partita
$partite = [];
foreach ($h2h as $f) {
    $finita = $f['fixture']['status']['short'] === 'FT';
    $in_casa = $f['teams']['home']['id'] === $team_id;

    $risultato = null;
    $esito = null;

    if ($finita) {
        $gol_fatti = $in_casa ? $f['goals']['home'] : $f['goals']['away'];
        $gol_subiti = $in_casa ? $f['goals']['away'] : $f['goals']['home'];

        if ($gol_fatti > $gol_subiti) $esito = 'V';
        elseif ($gol_fatti === $gol_subiti) $esito = 'P';
        else $esito = 'S';

        $risultato = [
            "casa" => $f['goals']['home'],
            "trasferta" => $f['goals']['away']
        ];
    }

    $partite[] = [
        "giornata" => $f['league']['round'],
        "data" => substr($f['fixture']['date'], 0, 10),
        "stadio" => $f['fixture']['venue']['name'] ?? null,
        "casa" => [
            "squadra" => $f['teams']['home']['name'],
            "logo" => $f['teams']['home']['logo']
        ],
        "trasferta" => [
            "squadra" => $f['teams']['away']['name'],
            "logo" => $f['teams']['away']['logo']
        ],
        "risultato" => $risultato,
        "esito" => $esito,
        "stato" => $f['fixture']['status']['long']
    ];
}

// Statistiche
$finite = [];
foreach ($partite as $p) {
    if ($p['esito'] !== null) {
        $finite[] = $p;
    }
}
$vittorie = 0;
$pareggi = 0;
$sconfitte = 0;
foreach ($finite as $p) {
    if ($p['esito'] === 'V') $vittorie++;
    elseif ($p['esito'] === 'P') $pareggi++;
    else $sconfitte++;
}

echo json_encode([
    "stagione" => (int)$season,
    "riepilogo" => [
        "vittorie" => $vittorie,
        "pareggi" => $pareggi,
        "sconfitte" => $sconfitte
    ],
    "partite" => $partite
]);
