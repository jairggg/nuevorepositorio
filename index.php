<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight para peticiones OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$host = 'localhost';
$db   = 'music_app';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// 🔹 Obtener canciones rápidas
if ($action === 'quickSongs') {
    $stmt = $pdo->query("SELECT id, title, artist, info, duration FROM quick_songs");
    $songs = $stmt->fetchAll();
    echo json_encode($songs);
    exit;
}

// 🔹 Obtener cola de canciones
if ($action === 'queueSongs') {
    $stmt = $pdo->query("SELECT id, title, artist, duration FROM queue_songs");
    $songs = $stmt->fetchAll();
    echo json_encode($songs);
    exit;
}

// 🔹 LOGIN: guardar/actualizar usuario
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $emailRaw = $input['email'] ?? '';
    $email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);

    if (!$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Correo electrónico inválido']);
        exit;
    }

    try {
        // Insertar usuario nuevo o actualizar last_login si ya existe
        $stmt = $pdo->prepare("
            INSERT INTO users (email)
            VALUES (:email)
            ON DUPLICATE KEY UPDATE last_login = NOW()
        ");
        $stmt->execute(['email' => $email]);

        // Devolver datos del usuario
        $stmt = $pdo->prepare("SELECT id, email, created_at, last_login FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        echo json_encode($user);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en login: ' . $e->getMessage()]);
        exit;
    }
}

// Acción no válida
http_response_code(400);
echo json_encode(['error' => 'Acción no válida']);

