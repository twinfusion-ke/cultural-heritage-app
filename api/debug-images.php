<?php
header('Content-Type: application/json');
$wp_config = dirname(__DIR__, 2) . '/cultural-heritage/wp-config.php';
$c = file_get_contents($wp_config);
preg_match("/define\(\s*'DB_NAME'\s*,\s*'([^']+)'/", $c, $m); $db_name = $m[1];
preg_match("/define\(\s*'DB_USER'\s*,\s*'([^']+)'/", $c, $m); $db_user = $m[1];
preg_match("/define\(\s*'DB_PASSWORD'\s*,\s*'([^']*)'/", $c, $m); $db_pass = $m[1];
preg_match("/define\(\s*'DB_HOST'\s*,\s*'([^']+)'/", $c, $m); $db_host = $m[1];
$host_parts = explode(':', $db_host);
$dsn = 'mysql:host=' . $host_parts[0] . ';dbname=' . $db_name . ';charset=utf8mb4';
if (isset($host_parts[1])) $dsn .= ';port=' . $host_parts[1];
$pdo = new PDO($dsn, $db_user, $db_pass);

$prefix = 'wp_2_'; // Market = blog 2

// Get first 3 products with their image meta
$stmt = $pdo->query("
    SELECT p.ID, p.post_title,
        (SELECT meta_value FROM {$prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id') as thumb_id,
        (SELECT meta_value FROM {$prefix}postmeta WHERE post_id = (SELECT meta_value FROM {$prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id') AND meta_key = '_wp_attached_file') as attached_file,
        (SELECT guid FROM {$prefix}posts WHERE ID = (SELECT meta_value FROM {$prefix}postmeta WHERE post_id = p.ID AND meta_key = '_thumbnail_id')) as guid,
        (SELECT meta_value FROM {$prefix}postmeta WHERE post_id = p.ID AND meta_key = '_product_image_gallery') as gallery
    FROM {$prefix}posts p
    WHERE p.post_type = 'product' AND p.post_status = 'publish'
    ORDER BY p.post_date DESC
    LIMIT 5
");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
