<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");

// Carica configurazione e chiave API
$env = parse_ini_file(__DIR__ . '/.env');
define('API_KEY', $env['API_KEY']);
define('API_URL', 'https://v3.football.api-sports.io/');

// Carica squadre e leghe da file JSON
$leagues = json_decode(file_get_contents(__DIR__ . '/data/leagues.json'), true);
$teams = json_decode(file_get_contents(__DIR__ . '/data/teams.json'),   true);

$endpoint = isset($_GET['url']) ? $_GET['url'] : '';
<<<<<<< HEAD
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}
=======
>>>>>>> f278699 (Aggiunta preferiti)

// Inoltra la richiesta all'endpoint corretto
switch ($endpoint) {
    case 'info':
        require __DIR__ . '/endpoints/info.php';
        break;
    case 'standings':
        require __DIR__ . '/endpoints/standings.php';
        break;
    case 'fixtures':
        require __DIR__ . '/endpoints/fixtures.php';
        break;
    case 'head2head':
        require __DIR__ . '/endpoints/head2head.php';
        break;
<<<<<<< HEAD
=======
    case 'favorites':  
	require __DIR__ . '/endpoints/favorites.php';
	break;
    
>>>>>>> f278699 (Aggiunta preferiti)
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint non trovato"]);
        break;
<<<<<<< HEAD
}
=======
}
>>>>>>> f278699 (Aggiunta preferiti)
