<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isLoggedIn()) {
    echo json_encode([
        'loggedIn' => true,
        'username' => $_SESSION['username']
    ]);
} else {
    echo json_encode([
        'loggedIn' => false
    ]);
}
?>
