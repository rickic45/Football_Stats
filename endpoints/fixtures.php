<?php

// Funzione per chiamare API Football per la richiesta dei dati
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

if ($_SERVER['REQUEST_METHOD']!== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

// Estrae i vari parametri
$league = $_GET['league'] ?? null;
$team = $_GET['team'] ?? null;
$season = $_GET['season'] ?? '2024';

// Si assicura che league e team siano selezionati
if (!$league || !$team) {
    http_response_code(400);
    echo json_encode(["error" => "Parametri 'league' e 'team' obbligatori"]);
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

// Valida squadra
if (!isset($teams[$league][$team])) {
    http_response_code(404);
    echo json_encode(["error" => "Squadra non trovata in questa lega."]);
    exit;
}

$team_id = $teams[$league][$team];

// Chiama API
$dati = chiama_api("fixtures?team=" . $team_id . "&league=" . $league_id . "&season=" . $season);
$fixture = $dati['response'] ?? [];

if (!$fixture) {
    http_response_code(404);
    echo json_encode(["error" => "Nessuna partita trovata."]);
    exit;
}

// Semplifica ogni partita e la stampa in formato json
$partite = [];
foreach ($fixture as $f) {
    $finita = $f['fixture']['status']['short'] === 'FT';

    $partite[] = [
        "giornata" => $f['league']['round'],
        "data" => substr($f['fixture']['date'], 0, 10),
        "stadio" => $f['fixture']['venue']['name'] ?? null,
        "citta" => $f['fixture']['venue']['city'] ?? null,
        "casa" => [
            "squadra" => $f['teams']['home']['name'],
            "logo" => $f['teams']['home']['logo']
        ],
        "trasferta" => [
            "squadra" => $f['teams']['away']['name'],
            "logo" => $f['teams']['away']['logo']
        ],
        "risultato" => $finita ? [
            "casa" => $f['goals']['home'],
            "trasferta" => $f['goals']['away']
        ] : null,
        "stato" => $f['fixture']['status']['long']
    ];
}

echo json_encode([
    "stagione" => (int)$season,
    "totale_partite" => count($partite),
    "partite" => $partite
]);
