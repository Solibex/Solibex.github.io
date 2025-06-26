<?php
// Replace this with your Firebase project info
$FIREBASE_PROJECT_URL = "https://your-project-id.firebaseio.com";
$FIREBASE_SECRET = "your_database_secret"; // Only if using Realtime DB; not Firestore

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['userId'])) {
    http_response_code(400);
    echo "Missing userId";
    exit();
}

$userId = $data['userId'];

// Send to Firebase Realtime Database (not Firestore)
$url = $FIREBASE_PROJECT_URL . "/roblox_users/" . $userId . ".json?auth=" . $FIREBASE_SECRET;

$payload = json_encode([
    "timestamp" => time()
]);

$options = [
    "http" => [
        "method" => "PUT",
        "header" => "Content-Type: application/json",
        "content" => $payload
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result) {
    echo "User ID added successfully";
} else {
    http_response_code(500);
    echo "Failed to send user ID";
}
?>
