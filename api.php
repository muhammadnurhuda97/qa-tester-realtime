<?php
/**
 * Aksara QA - PHP Backend API
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'checklist_data.json';

// Ensure data file exists
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── 1. REAL-TIME STREAM (SSE) ──────────────────────────────────────────
if ($action === 'stream') {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no'); // Disable buffering for Nginx/LiteSpeed

    // Send initial data
    $data = file_exists($dataFile) ? file_get_contents($dataFile) : '[]';
    echo "data: $data\n\n";
    if (ob_get_level() > 0) ob_end_flush();
    flush();

    // Check for changes in the file every 2 seconds
    $lastMTime = file_exists($dataFile) ? filemtime($dataFile) : time();
    $iterations = 0;
    while ($iterations < 30) { // Limit to 1 minute to prevent locking single-threaded servers
        clearstatcache();
        $currentMTime = file_exists($dataFile) ? filemtime($dataFile) : time();
        
        if ($currentMTime > $lastMTime) {
            $data = file_get_contents($dataFile);
            echo "data: $data\n\n";
            $lastMTime = $currentMTime;
            if (ob_get_level() > 0) ob_end_flush();
            flush();
        }
        
        if (connection_aborted()) break;
        sleep(2);
        $iterations++;
    }
    exit;
}

// ─── 2. READ DATA ──────────────────────────────────────────────────────
if ($method === 'GET') {
    header('Content-Type: application/json');
    echo file_get_contents($dataFile);
    exit;
}

// ─── 3. WRITE / UPDATE DATA ───────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'update') {
        // Update single item
        $groups = json_decode(file_get_contents($dataFile), true);
        $groupId = $input['groupId'];
        $itemId = $input['itemId'];
        $status = $input['status'];
        $testedBy = $input['testedBy'];

        foreach ($groups as &$group) {
            if ($group['id'] === $groupId) {
                foreach ($group['items'] as &$item) {
                    if ($item['id'] === $itemId) {
                        $item['status'] = $status;
                        $item['testedBy'] = ($status !== 'NOT_TESTED') ? $testedBy : null;
                    }
                }
            }
        }
        file_put_contents($dataFile, json_encode($groups, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success']);
    } else {
        // Replace all data (Import)
        file_put_contents($dataFile, json_encode($input, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success']);
    }
    exit;
}
