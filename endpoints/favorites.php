<?php
$file = __DIR__ . '/../data/favorites.json';
$preferiti = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// GET: Restituisce la lista dei preferiti
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($preferiti);
    exit;
}

// POST: Aggiunge una squadra ai preferiti
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $league = $body['league'] ?? null;
    $team = $body['team'] ?? null;

    if (!$league || !$team) {
        http_response_code(400);
        echo json_encode(["error" => "league e team obbligatori"]);
        exit;
    }

    // Controlla se già presente
    foreach ($preferiti as $p) {
        if ($p['league'] === $league && $p['team'] === $team) {
            http_response_code(409); // Conflict
            echo json_encode(["error" => "Squadra già nei preferiti"]);
            exit;
        }
    }
    
    // Aggiunge la squadra
    $preferiti[] = ['league' => $league, 'team' => $team];
    file_put_contents($file, json_encode($preferiti));
    
    echo json_encode(["azione" => "aggiunta", "preferiti" => $preferiti]);
    exit;
}

// DELETE: Rimuove una squadra dai preferiti
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $league = $body['league'] ?? null;
    $team = $body['team'] ?? null;

    if (!$league || !$team) {
        http_response_code(400);
        echo json_encode(["error" => "league e team obbligatori"]);
        exit;
    }

    // Cerca e rimuove se presente
    $trovata = false;
    foreach ($preferiti as $i => $p) {
        if ($p['league'] === $league && $p['team'] === $team) {
            $nuovi = [];
            foreach ($preferiti as $p) {
                if (!($p['league'] === $league && $p['team'] === $team)) {
                    $nuovi[] = $p;
                }
            }
            $preferiti = $nuovi;
            $trovata = true;
            break;
        }
    }
    
    if (!$trovata) {
        http_response_code(404);
        echo json_encode(["error" => "Squadra non trovata nei preferiti"]);
        exit;
    }
    
    file_put_contents($file, json_encode($preferiti));
    echo json_encode(["azione" => "rimossa", "preferiti" => $preferiti]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Metodo non consentito"]);
