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

// GET /info?league=...&team=...&season=...
$league = $_GET['league'] ?? null;
$team = $_GET['team'] ?? null;
$season = $_GET['season'] ?? '2024';

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
$dati = chiama_api("teams?id=" . $team_id);
$raw = $dati['response'][0] ?? null;

if (!$raw) {
    http_response_code(404);
    echo json_encode(["error" => "Nessun dato trovato per questa squadra."]);
    exit;
}

// Risposta
echo json_encode([
    "club" => [
        "nome" => $raw['team']['name'],
        "paese" => $raw['team']['country'],
        "fondazione" => $raw['team']['founded'],
        "logo" => $raw['team']['logo']
    ],
    "stadio" => [
        "nome" => $raw['venue']['name'],
        "citta" => $raw['venue']['city'],
        "indirizzo" => $raw['venue']['address'],
        "capienza" => $raw['venue']['capacity'],
        "manto" => $raw['venue']['surface']
    ]
]);
