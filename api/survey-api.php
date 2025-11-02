<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$SURVEY_FILE_PATH = __DIR__ . '/../pages/survey.html';
$PENDING_CHANGES_FILE = __DIR__ . '/pending_changes.json';
$DENIED_CHANGES_FILE = __DIR__ . '/denied_changes.json';

// Load existing data
$pendingChanges = file_exists($PENDING_CHANGES_FILE) ? json_decode(file_get_contents($PENDING_CHANGES_FILE), true) : [];
$deniedChanges = file_exists($DENIED_CHANGES_FILE) ? json_decode(file_get_contents($DENIED_CHANGES_FILE), true) : [];

// Support both POST and GET to enable approve/deny via email links
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    switch ($action) {
        case 'list_pending':
            echo json_encode(['success' => true, 'data' => $pendingChanges]);
            break;
        case 'list_denied':
            echo json_encode(['success' => true, 'data' => $deniedChanges]);
            break;
        case 'approve_change':
            $changeId = $_POST['changeId'] ?? $_GET['changeId'] ?? '';
            $result = approveChange($changeId, $pendingChanges, $SURVEY_FILE_PATH, $PENDING_CHANGES_FILE);
            echo json_encode($result);
            break;
            
        case 'deny_change':
            $changeId = $_POST['changeId'] ?? $_GET['changeId'] ?? '';
            $result = denyChange($changeId, $pendingChanges, $deniedChanges, $PENDING_CHANGES_FILE, $DENIED_CHANGES_FILE);
            echo json_encode($result);
            break;
            
        case 'submit_changes':
            $raw = $_POST['changes'] ?? $_GET['changes'] ?? '';
            $changesData = json_decode($raw, true);
            if (!$changesData || !is_array($changesData) || count($changesData) === 0) {
                echo json_encode(['success' => false, 'message' => 'No valid changes provided']);
                break;
            }
            $result = processNewChanges($changesData, $pendingChanges, $deniedChanges, $PENDING_CHANGES_FILE);
            // Attempt to send notification email with approve/deny links
            try {
                sendSubmissionEmail($result['changeItems'] ?? [], getBaseUrl());
            } catch (Exception $e) {
                // ignore email errors to not block UX
            }
            echo json_encode($result);
            break;
        case 'ping':
            echo json_encode(['success' => true, 'message' => 'pong']);
            break;
        case 'create_test_entry':
            // Create a safe non-destructive test pending entry
            $testId = 'test_' . preg_replace('/[^0-9]/', '', microtime(true));
            $item = [
                'filename' => 'TEST_IMAGE.png',
                'displayName' => 'TEST IMAGE',
                'newName' => 'Test Name',
                'newDescription' => 'This is a test pending entry created from the admin diagnostics panel.',
                'submittedAt' => date('Y-m-d H:i:s'),
                'id' => $testId,
                'imagePath' => '/images/test-placeholder.png'
            ];
            $pendingChanges[$testId] = $item;
            if (file_put_contents($PENDING_CHANGES_FILE, json_encode($pendingChanges, JSON_PRETTY_PRINT)) === false) {
                echo json_encode(['success' => false, 'message' => 'Failed to write pending changes file']);
            } else {
                echo json_encode(['success' => true, 'message' => 'Test entry created', 'item' => $item]);
            }
            break;
        case 'check_writes':
            $probe = __DIR__ . '/.probe_' . uniqid() . '.tmp';
            $apiWritable = false;
            $surveyWritable = is_writable($SURVEY_FILE_PATH);
            $messages = [];
            try {
                $ok = @file_put_contents($probe, "probe");
                if ($ok !== false) {
                    $apiWritable = true;
                    @unlink($probe);
                } else {
                    $messages[] = 'Unable to create probe file in api/';
                }
            } catch (Exception $e) {
                $messages[] = 'Probe write exception: ' . $e->getMessage();
            }
            $pendingWritable = is_writable($PENDING_CHANGES_FILE) || @touch($PENDING_CHANGES_FILE);
            $deniedWritable = is_writable($DENIED_CHANGES_FILE) || @touch($DENIED_CHANGES_FILE);
            echo json_encode(['success' => true, 'apiWritable' => $apiWritable, 'pendingWritable' => $pendingWritable, 'deniedWritable' => $deniedWritable, 'surveyWritable' => $surveyWritable, 'messages' => $messages]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST/GET requests allowed']);
}

function approveChange($changeId, &$pendingChanges, $surveyFilePath, $pendingChangesFile) {
    if (!isset($pendingChanges[$changeId])) {
        return ['success' => false, 'message' => 'Change not found'];
    }
    
    $change = $pendingChanges[$changeId];
    
    // Read the current survey file
    $surveyContent = file_get_contents($surveyFilePath);
    if ($surveyContent === false) {
        return ['success' => false, 'message' => 'Could not read survey file'];
    }
    
    // Update the descriptionsDatabase in the survey file
    $filename = $change['filename'] ?? '';
    $newName = trim($change['newName'] ?? '');
    $newDescription = trim($change['newDescription'] ?? '');
    $key = $newName !== '' ? preg_replace('/\s+/', '_', $newName) : preg_replace('/\.[^\.]+$/', '', $filename);
    $key = addslashes($key);
    $val = addslashes($newDescription);
    
    // Replace if key exists, else insert new entry just before the closing of descriptionsDatabase
    $dbStart = strpos($surveyContent, 'const descriptionsDatabase = {');
    if ($dbStart !== false) {
        // Try replace existing key value
        $replaced = false;
        $surveyContent = preg_replace_callback(
            '/(const\s+descriptionsDatabase\s*=\s*\{)([\s\S]*?)(\};)/',
            function ($m) use ($key, $val, &$replaced) {
                $body = $m[2];
                $pattern = '/(^|\n)\s*"' . preg_quote($key, '/') . '"\s*:\s*"[^"]*"\s*,?/';
                if (preg_match($pattern, $body)) {
                    $body = preg_replace($pattern, "\n      \"$key\": \"$val\",", $body);
                    $replaced = true;
                }
                if (!$replaced) {
                    // insert before closing
                    $body = rtrim($body) . "\n      \"$key\": \"$val\",\n";
                }
                return $m[1] . $body . $m[3];
            },
            1
        );
    }
    
    // Write back to file
    if (file_put_contents($surveyFilePath, $surveyContent) === false) {
        return ['success' => false, 'message' => 'Could not update survey file'];
    }
    
    // Remove from pending changes
    unset($pendingChanges[$changeId]);
    file_put_contents($pendingChangesFile, json_encode($pendingChanges, JSON_PRETTY_PRINT));
    
    return ['success' => true, 'message' => 'Change approved and applied'];
}

function denyChange($changeId, &$pendingChanges, &$deniedChanges, $pendingChangesFile, $deniedChangesFile) {
    if (!isset($pendingChanges[$changeId])) {
        return ['success' => false, 'message' => 'Change not found'];
    }
    
    $change = $pendingChanges[$changeId];
    
    // Move to denied changes
    $deniedChanges[$changeId] = array_merge($change, ['deniedAt' => date('Y-m-d H:i:s')]);
    unset($pendingChanges[$changeId]);
    
    // Save both files
    file_put_contents($pendingChangesFile, json_encode($pendingChanges, JSON_PRETTY_PRINT));
    file_put_contents($deniedChangesFile, json_encode($deniedChanges, JSON_PRETTY_PRINT));
    
    return ['success' => true, 'message' => 'Change denied'];
}

function processNewChanges($changesData, &$pendingChanges, $deniedChanges, $pendingChangesFile) {
    $processedChanges = [];
    $changeItems = [];
    
    foreach ($changesData as $change) {
        $changeId = md5(($change['filename'] ?? '') . ($change['newName'] ?? '') . ($change['newDescription'] ?? '') . microtime(true));
        
        // Check if this change was previously denied
        $isDenied = false;
        foreach ($deniedChanges as $deniedChange) {
            if ($deniedChange['filename'] === $change['filename'] && 
                $deniedChange['newName'] === $change['newName'] && 
                $deniedChange['newDescription'] === $change['newDescription']) {
                $isDenied = true;
                break;
            }
        }
        
        if (!$isDenied) {
            $item = array_merge($change, [
                'submittedAt' => date('Y-m-d H:i:s'),
                'id' => $changeId
            ]);
            $pendingChanges[$changeId] = $item;
            $processedChanges[] = $changeId;
            $changeItems[] = $item;
        }
    }
    
    file_put_contents($pendingChangesFile, json_encode($pendingChanges, JSON_PRETTY_PRINT));
    
    return [
        'success' => true, 
        'message' => 'Changes processed',
        'processedChanges' => $processedChanges,
        'totalChanges' => count($processedChanges),
        'changeItems' => $changeItems
    ];
}

function getBaseUrl() {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host;
}

function sendSubmissionEmail($items, $baseUrl) {
    if (!$items || count($items) === 0) return;
    $to = 'joepotap@gmail.com';
    $subject = 'Game Pixel Art Survey: New Change Submissions';
    
    $rows = '';
    foreach ($items as $it) {
        $id = htmlspecialchars($it['id']);
        $file = htmlspecialchars($it['filename'] ?? '');
        $disp = htmlspecialchars($it['displayName'] ?? '');
        $newName = htmlspecialchars($it['newName'] ?? '');
        $newDesc = htmlspecialchars($it['newDescription'] ?? '');
        $img = $it['imagePath'] ?? '';
        if ($img && strncmp($img, 'http', 4) !== 0) {
            $img = rtrim($baseUrl, '/') . '/' . ltrim($img, '/');
        }
        $approve = $baseUrl . '/api/survey-api.php?action=approve_change&changeId=' . urlencode($id);
        $deny = $baseUrl . '/api/survey-api.php?action=deny_change&changeId=' . urlencode($id);
        $rows .= '<tr>' .
                 '<td style="padding:8px;border-bottom:1px solid #333">' .
                 ($img ? '<img src="' . htmlspecialchars($img) . '" alt="' . $disp . '" style="width:96px;height:96px;object-fit:contain;background:#111;border-radius:8px">' : '') .
                 '</td>' .
                 '<td style="padding:8px;border-bottom:1px solid #333"><div><strong>' . $disp . '</strong><div style="color:#aaa;font-size:12px">' . $file . '</div></div></td>' .
                 '<td style="padding:8px;border-bottom:1px solid #333">' . $newName . '</td>' .
                 '<td style="padding:8px;border-bottom:1px solid #333">' . nl2br($newDesc) . '</td>' .
                 '<td style="padding:8px;border-bottom:1px solid #333">' .
                   '<a href="' . htmlspecialchars($approve) . '" style="padding:6px 10px;border:1px solid #2a8f2a;color:#2a8f2a;text-decoration:none;border-radius:6px">Approve</a> ' .
                   '<a href="' . htmlspecialchars($deny) . '" style="padding:6px 10px;border:1px solid #b13c3c;color:#b13c3c;text-decoration:none;border-radius:6px">Deny</a>' .
                 '</td>' .
                 '</tr>';
    }
    $html = '<html><body style="background:#0b0b0b;color:#eee;font-family:Segoe UI,Arial,sans-serif">' .
            '<h2 style="color:#fff">New Survey Submissions</h2>' .
            '<table style="width:100%;border-collapse:collapse">' .
            '<thead><tr>' .
            '<th align="left" style="padding:8px;border-bottom:1px solid #555">Image</th>' .
            '<th align="left" style="padding:8px;border-bottom:1px solid #555">Item</th>' .
            '<th align="left" style="padding:8px;border-bottom:1px solid #555">Proposed Name</th>' .
            '<th align="left" style="padding:8px;border-bottom:1px solid #555">Proposed Description</th>' .
            '<th align="left" style="padding:8px;border-bottom:1px solid #555">Actions</th>' .
            '</tr></thead><tbody>' . $rows . '</tbody></table>' .
            '<p style="color:#aaa;font-size:12px">Links perform the action immediately.</p>' .
            '</body></html>';
    
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Survey Notifier <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
    @mail($to, $subject, $html, $headers);
}
?>