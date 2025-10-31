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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? $_GET['action'] ?? '';
    
    switch ($action) {
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
            $changesData = json_decode($_POST['changes'] ?? '', true);
            $result = processNewChanges($changesData, $pendingChanges, $deniedChanges, $PENDING_CHANGES_FILE);
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST requests allowed']);
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
    $filename = $change['filename'];
    $newName = addslashes($change['newName']);
    $newDescription = addslashes($change['newDescription']);
    
    // Find and update the descriptionsDatabase entry
    $pattern = '/("' . preg_quote($filename, '/') . '":\s*")[^"]*(")/';
    if (preg_match($pattern, $surveyContent)) {
        $surveyContent = preg_replace($pattern, '${1}' . $newDescription . '${2}', $surveyContent);
    } else {
        // Add new entry to descriptionsDatabase
        $pattern = '/(const descriptionsDatabase = \{[^}]*)/';
        $newEntry = '"' . $filename . '": "' . $newDescription . '",';
        $surveyContent = preg_replace($pattern, '${1}' . "\n      " . $newEntry, $surveyContent);
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
    
    foreach ($changesData as $change) {
        $changeId = md5($change['filename'] . $change['newName'] . $change['newDescription'] . time());
        
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
            $pendingChanges[$changeId] = array_merge($change, [
                'submittedAt' => date('Y-m-d H:i:s'),
                'id' => $changeId
            ]);
            $processedChanges[] = $changeId;
        }
    }
    
    file_put_contents($pendingChangesFile, json_encode($pendingChanges, JSON_PRETTY_PRINT));
    
    return [
        'success' => true, 
        'message' => 'Changes processed',
        'processedChanges' => $processedChanges,
        'totalChanges' => count($processedChanges)
    ];
}
?>