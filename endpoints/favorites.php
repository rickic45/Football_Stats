<?php
$file = __DIR__ . '/../data/favorites.json';
$preferiti = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($preferiti);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $league = $body['league'] ?? null;
    $team = $body['team'] ?? null;

    if (!$league || !$team) {
        http_response_code(400);
        echo json_encode(["error" => "league e team obbligatori"]);
        exit;
    }

    // Cerca se già presente
    $trovato = -1;
    foreach ($preferiti as $i => $p) {
        if ($p['league'] === $league && $p['team'] === $team) {
            $trovato = $i;
            break;
        }
    }

    if ($trovato !== -1) {
        array_splice($preferiti, $trovato, 1);
        $azione = 'rimossa';
    } else {
        $preferiti[] = ['league' => $league, 'team' => $team];
        $azione = 'aggiunta';
    }

    file_put_contents($file, json_encode($preferiti));
    echo json_encode(["azione" => $azione, "preferiti" => $preferiti]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Metodo non consentito"]);