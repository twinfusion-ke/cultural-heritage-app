<?php
header('Content-Type: application/json');
$wp_config = dirname(__DIR__, 2) . '/cultural-heritage/wp-config.php';
if (file_exists($wp_config)) {
    $c = file_get_contents($wp_config);
    preg_match("/define\(\s*'DB_NAME'\s*,\s*'([^']+)'/", $c, $m); $db_name = $m[1] ?? '';
    preg_match("/define\(\s*'DB_USER'\s*,\s*'([^']+)'/", $c, $m); $db_user = $m[1] ?? '';
    preg_match("/define\(\s*'DB_PASSWORD'\s*,\s*'([^']*)'/", $c, $m); $db_pass = $m[1] ?? '';
    preg_match("/define\(\s*'DB_HOST'\s*,\s*'([^']+)'/", $c, $m); $db_host = $m[1] ?? 'localhost';
} else {
    die(json_encode(['error' => 'wp-config not found']));
}
$host_parts = explode(':', $db_host);
$dsn = 'mysql:host=' . $host_parts[0] . ';dbname=' . $db_name . ';charset=utf8mb4';
if (isset($host_parts[1])) $dsn .= ';port=' . $host_parts[1];
$pdo = new PDO($dsn, $db_user, $db_pass);

// Get all blogs
$blogs = $pdo->query("SELECT blog_id, domain, path FROM wp_blogs ORDER BY blog_id")->fetchAll(PDO::FETCH_ASSOC);

// Count products and posts per blog
foreach ($blogs as &$b) {
    $prefix = $b['blog_id'] == 1 ? 'wp_' : "wp_{$b['blog_id']}_";
    try {
        $b['products'] = $pdo->query("SELECT COUNT(*) FROM {$prefix}posts WHERE post_type='product' AND post_status='publish'")->fetchColumn();
        $b['posts'] = $pdo->query("SELECT COUNT(*) FROM {$prefix}posts WHERE post_type='post' AND post_status='publish'")->fetchColumn();
        $b['pages'] = $pdo->query("SELECT COUNT(*) FROM {$prefix}posts WHERE post_type='page' AND post_status='publish'")->fetchColumn();
    } catch(Exception $e) {
        $b['error'] = $e->getMessage();
    }
}

echo json_encode(['blogs' => $blogs], JSON_PRETTY_PRINT);
