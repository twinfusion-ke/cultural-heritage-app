<?php
/**
 * Cultural Heritage Centre — Mobile App API
 *
 * Reads directly from WordPress multisite database.
 * No WooCommerce REST API keys required.
 *
 * Endpoints:
 *   ?action=products&site=market|jewelry|gallery&page=1&per_page=12&category=ID&search=term
 *   ?action=categories&site=market|jewelry|gallery
 *   ?action=product&site=market|jewelry|gallery&id=123
 *   ?action=posts&site=hub|market|jewelry|gallery&page=1&per_page=10
 *   ?action=post&site=hub&slug=post-slug
 *   ?action=pages&site=hub|market|jewelry|gallery
 *   ?action=page&site=hub&slug=page-slug
 *   ?action=exhibitions&page=1&per_page=50
 *   ?action=exhibition&slug=exhibition-slug
 *   ?action=search&q=term
 *   ?action=config  (returns site info, menus, theme assets)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Database Configuration ──────────────────────────────────────────────────
// Auto-detect environment
$is_local = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1']);

if ($is_local) {
    $db_host = 'localhost:3307';
    $db_name = 'cultural_heritage_wp';
    $db_user = 'root';
    $db_pass = '';
    $base_url = 'http://localhost/cultural-heritage-wp';
} else {
    // Production — reads wp-config.php from parent WordPress install
    $wp_config = dirname(__DIR__, 2) . '/cultural-heritage/wp-config.php';
    if (file_exists($wp_config)) {
        $config_content = file_get_contents($wp_config);
        preg_match("/define\(\s*'DB_NAME'\s*,\s*'([^']+)'/", $config_content, $m);
        $db_name = $m[1] ?? 'cultural_heritage_wp';
        preg_match("/define\(\s*'DB_USER'\s*,\s*'([^']+)'/", $config_content, $m);
        $db_user = $m[1] ?? 'root';
        preg_match("/define\(\s*'DB_PASSWORD'\s*,\s*'([^']*)'/", $config_content, $m);
        $db_pass = $m[1] ?? '';
        preg_match("/define\(\s*'DB_HOST'\s*,\s*'([^']+)'/", $config_content, $m);
        $db_host = $m[1] ?? 'localhost';
    } else {
        $db_host = 'localhost';
        $db_name = 'cultural_heritage_wp';
        $db_user = 'root';
        $db_pass = '';
    }
    $base_url = 'https://twinfusion.co.ke/cultural-heritage';
}

// ── Database Connection ─────────────────────────────────────────────────────
try {
    $host_parts = explode(':', $db_host);
    $dsn = 'mysql:host=' . $host_parts[0] . ';dbname=' . $db_name . ';charset=utf8mb4';
    if (isset($host_parts[1])) {
        $dsn .= ';port=' . $host_parts[1];
    }
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

// ── Multisite Blog ID mapping ───────────────────────────────────────────────
$site_blog_ids = [
    'hub'     => 1,
    'market'  => 2,
    'jewelry' => 3,
    'gallery' => 4,
];

function get_table_prefix(string $site): string {
    global $site_blog_ids;
    $blog_id = $site_blog_ids[$site] ?? 1;
    return $blog_id === 1 ? 'wp_' : "wp_{$blog_id}_";
}

// ── Helper Functions ────────────────────────────────────────────────────────
function get_featured_image(PDO $pdo, string $prefix, int $post_id): ?string {
    // Best approach: use the guid from the attachment post (always has full URL in multisite)
    $stmt = $pdo->prepare("
        SELECT p2.guid
        FROM {$prefix}postmeta pm
        JOIN {$prefix}posts p2 ON p2.ID = pm.meta_value
        WHERE pm.post_id = ? AND pm.meta_key = '_thumbnail_id'
        LIMIT 1
    ");
    $stmt->execute([$post_id]);
    $row = $stmt->fetch();
    if ($row && $row['guid']) {
        return $row['guid'];
    }
    return null;
}

function get_product_images(PDO $pdo, string $prefix, int $product_id): array {
    $images = [];
    // Featured image
    $featured = get_featured_image($pdo, $prefix, $product_id);
    if ($featured) {
        $images[] = ['src' => $featured, 'alt' => ''];
    }
    // Gallery images from _product_image_gallery — use guid for multisite
    $stmt = $pdo->prepare("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = ? AND meta_key = '_product_image_gallery'");
    $stmt->execute([$product_id]);
    $gallery = $stmt->fetchColumn();
    if ($gallery) {
        $ids = explode(',', $gallery);
        foreach ($ids as $img_id) {
            $stmt2 = $pdo->prepare("SELECT guid FROM {$prefix}posts WHERE ID = ?");
            $stmt2->execute([(int)$img_id]);
            $guid = $stmt2->fetchColumn();
            if ($guid) {
                $images[] = ['src' => $guid, 'alt' => ''];
            }
        }
    }
    return $images;
}

function get_product_attributes(PDO $pdo, string $prefix, int $product_id): array {
    $stmt = $pdo->prepare("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = ? AND meta_key = '_product_attributes'");
    $stmt->execute([$product_id]);
    $raw = $stmt->fetchColumn();
    if (!$raw) return [];

    $attrs = @unserialize($raw);
    if (!is_array($attrs)) return [];

    $result = [];
    foreach ($attrs as $key => $attr) {
        $result[] = [
            'name' => $attr['name'] ?? $key,
            'options' => array_map('trim', explode('|', $attr['value'] ?? '')),
            'visible' => (bool)($attr['is_visible'] ?? true),
        ];
    }
    return $result;
}

function get_product_meta(PDO $pdo, string $prefix, int $id, string $key): ?string {
    $stmt = $pdo->prepare("SELECT meta_value FROM {$prefix}postmeta WHERE post_id = ? AND meta_key = ? LIMIT 1");
    $stmt->execute([$id, $key]);
    return $stmt->fetchColumn() ?: null;
}

function format_product(PDO $pdo, string $prefix, array $row): array {
    $id = (int)$row['ID'];
    $price = get_product_meta($pdo, $prefix, $id, '_price') ?? '0';
    $regular_price = get_product_meta($pdo, $prefix, $id, '_regular_price') ?? $price;
    $sale_price = get_product_meta($pdo, $prefix, $id, '_sale_price') ?? '';
    $stock_status = get_product_meta($pdo, $prefix, $id, '_stock_status') ?? 'instock';
    $sku = get_product_meta($pdo, $prefix, $id, '_sku') ?? '';

    return [
        'id' => $id,
        'name' => $row['post_title'],
        'slug' => $row['post_name'],
        'description' => $row['post_content'],
        'short_description' => $row['post_excerpt'],
        'price' => $price,
        'regular_price' => $regular_price,
        'sale_price' => $sale_price,
        'on_sale' => !empty($sale_price) && $sale_price !== $regular_price,
        'stock_status' => $stock_status,
        'sku' => $sku,
        'images' => get_product_images($pdo, $prefix, $id),
        'attributes' => get_product_attributes($pdo, $prefix, $id),
        'categories' => get_post_terms($pdo, $prefix, $id, 'product_cat'),
        'date' => $row['post_date'],
    ];
}

function get_post_terms(PDO $pdo, string $prefix, int $post_id, string $taxonomy): array {
    $stmt = $pdo->prepare("
        SELECT t.term_id as id, t.name, t.slug
        FROM {$prefix}term_relationships tr
        JOIN {$prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        JOIN {$prefix}terms t ON tt.term_id = t.term_id
        WHERE tr.object_id = ? AND tt.taxonomy = ?
    ");
    $stmt->execute([$post_id, $taxonomy]);
    return $stmt->fetchAll();
}

function format_post(PDO $pdo, string $prefix, array $row): array {
    $id = (int)$row['ID'];
    return [
        'id' => $id,
        'title' => $row['post_title'],
        'slug' => $row['post_name'],
        'content' => $row['post_content'],
        'excerpt' => $row['post_excerpt'] ?: wp_trim_excerpt($row['post_content']),
        'date' => $row['post_date'],
        'image' => get_featured_image($pdo, $prefix, $id),
        'categories' => get_post_terms($pdo, $prefix, $id, 'category'),
    ];
}

function format_page(PDO $pdo, string $prefix, array $row): array {
    $id = (int)$row['ID'];
    return [
        'id' => $id,
        'title' => $row['post_title'],
        'slug' => $row['post_name'],
        'content' => $row['post_content'],
        'image' => get_featured_image($pdo, $prefix, $id),
    ];
}

function wp_trim_excerpt(string $content, int $length = 200): string {
    $text = strip_tags($content);
    if (strlen($text) > $length) {
        $text = substr($text, 0, $length) . '...';
    }
    return $text;
}

// ── API Router ──────────────────────────────────────────────────────────────
$action = $_GET['action'] ?? '';
$site = $_GET['site'] ?? 'hub';
$page = max(1, (int)($_GET['page'] ?? 1));
$per_page = min(100, max(1, (int)($_GET['per_page'] ?? 12)));
$offset = ($page - 1) * $per_page;

if (!isset($site_blog_ids[$site])) {
    $site = 'hub';
}

$prefix = get_table_prefix($site);

switch ($action) {

    // ── Products ────────────────────────────────────────────────────────
    case 'products':
        $where = "p.post_type = 'product' AND p.post_status = 'publish'";
        $params = [];

        if (!empty($_GET['category'])) {
            $cat_id = (int)$_GET['category'];
            $where .= " AND p.ID IN (
                SELECT tr.object_id FROM {$prefix}term_relationships tr
                JOIN {$prefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                WHERE tt.term_id = ? AND tt.taxonomy = 'product_cat'
            )";
            $params[] = $cat_id;
        }

        if (!empty($_GET['search'])) {
            $where .= " AND (p.post_title LIKE ? OR p.post_content LIKE ?)";
            $term = '%' . $_GET['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $stmt = $pdo->prepare("
            SELECT p.* FROM {$prefix}posts p
            WHERE {$where}
            ORDER BY p.post_date DESC
            LIMIT {$per_page} OFFSET {$offset}
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $products = array_map(function($row) use ($pdo, $prefix) {
            return format_product($pdo, $prefix, $row);
        }, $rows);

        echo json_encode($products);
        break;

    // ── Single Product ──────────────────────────────────────────────────
    case 'product':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) {
            echo json_encode(['error' => 'Product ID required']);
            break;
        }
        $stmt = $pdo->prepare("SELECT * FROM {$prefix}posts WHERE ID = ? AND post_type = 'product' AND post_status = 'publish'");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        echo json_encode($row ? format_product($pdo, $prefix, $row) : null);
        break;

    // ── Product Categories ──────────────────────────────────────────────
    case 'categories':
        $stmt = $pdo->prepare("
            SELECT t.term_id as id, t.name, t.slug, tt.count
            FROM {$prefix}term_taxonomy tt
            JOIN {$prefix}terms t ON tt.term_id = t.term_id
            WHERE tt.taxonomy = 'product_cat' AND tt.count > 0
            ORDER BY t.name ASC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        break;

    // ── Blog Posts ──────────────────────────────────────────────────────
    case 'posts':
        $stmt = $pdo->prepare("
            SELECT * FROM {$prefix}posts
            WHERE post_type = 'post' AND post_status = 'publish'
            ORDER BY post_date DESC
            LIMIT {$per_page} OFFSET {$offset}
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $posts = array_map(function($row) use ($pdo, $prefix) {
            return format_post($pdo, $prefix, $row);
        }, $rows);

        echo json_encode($posts);
        break;

    // ── Single Post ─────────────────────────────────────────────────────
    case 'post':
        $slug = $_GET['slug'] ?? '';
        $id = (int)($_GET['id'] ?? 0);

        if ($slug) {
            $stmt = $pdo->prepare("SELECT * FROM {$prefix}posts WHERE post_name = ? AND post_type = 'post' AND post_status = 'publish'");
            $stmt->execute([$slug]);
        } elseif ($id) {
            $stmt = $pdo->prepare("SELECT * FROM {$prefix}posts WHERE ID = ? AND post_type = 'post' AND post_status = 'publish'");
            $stmt->execute([$id]);
        } else {
            echo json_encode(null);
            break;
        }

        $row = $stmt->fetch();
        echo json_encode($row ? format_post($pdo, $prefix, $row) : null);
        break;

    // ── Pages ───────────────────────────────────────────────────────────
    case 'pages':
        $stmt = $pdo->prepare("
            SELECT * FROM {$prefix}posts
            WHERE post_type = 'page' AND post_status = 'publish'
            ORDER BY menu_order ASC, post_title ASC
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $pages = array_map(function($row) use ($pdo, $prefix) {
            return format_page($pdo, $prefix, $row);
        }, $rows);

        echo json_encode($pages);
        break;

    // ── Single Page ─────────────────────────────────────────────────────
    case 'page':
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            echo json_encode(null);
            break;
        }
        $stmt = $pdo->prepare("SELECT * FROM {$prefix}posts WHERE post_name = ? AND post_type = 'page' AND post_status = 'publish'");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        echo json_encode($row ? format_page($pdo, $prefix, $row) : null);
        break;

    // ── Exhibitions (Gallery CPT) ───────────────────────────────────────
    case 'exhibitions':
        $gallery_prefix = get_table_prefix('gallery');
        $stmt = $pdo->prepare("
            SELECT p.*,
                MAX(CASE WHEN pm.meta_key = '_ch_exhibition_start_date' THEN pm.meta_value END) as start_date,
                MAX(CASE WHEN pm.meta_key = '_ch_exhibition_end_date' THEN pm.meta_value END) as end_date
            FROM {$gallery_prefix}posts p
            LEFT JOIN {$gallery_prefix}postmeta pm ON p.ID = pm.post_id
            WHERE p.post_type = 'ch_exhibition' AND p.post_status = 'publish'
            GROUP BY p.ID
            ORDER BY start_date DESC
            LIMIT {$per_page} OFFSET {$offset}
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $exhibitions = array_map(function($row) use ($pdo, $gallery_prefix) {
            return [
                'id' => (int)$row['ID'],
                'title' => $row['post_title'],
                'slug' => $row['post_name'],
                'content' => $row['post_content'],
                'excerpt' => $row['post_excerpt'] ?: wp_trim_excerpt($row['post_content']),
                'date' => $row['post_date'],
                'start_date' => $row['start_date'] ?? '',
                'end_date' => $row['end_date'] ?? '',
                'image' => get_featured_image($pdo, $gallery_prefix, (int)$row['ID']),
            ];
        }, $rows);

        echo json_encode($exhibitions);
        break;

    // ── Single Exhibition ───────────────────────────────────────────────
    case 'exhibition':
        $gallery_prefix = get_table_prefix('gallery');
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            echo json_encode(null);
            break;
        }
        $stmt = $pdo->prepare("
            SELECT p.*,
                MAX(CASE WHEN pm.meta_key = '_ch_exhibition_start_date' THEN pm.meta_value END) as start_date,
                MAX(CASE WHEN pm.meta_key = '_ch_exhibition_end_date' THEN pm.meta_value END) as end_date
            FROM {$gallery_prefix}posts p
            LEFT JOIN {$gallery_prefix}postmeta pm ON p.ID = pm.post_id
            WHERE p.post_name = ? AND p.post_type = 'ch_exhibition' AND p.post_status = 'publish'
            GROUP BY p.ID
        ");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if ($row) {
            echo json_encode([
                'id' => (int)$row['ID'],
                'title' => $row['post_title'],
                'slug' => $row['post_name'],
                'content' => $row['post_content'],
                'excerpt' => $row['post_excerpt'] ?: wp_trim_excerpt($row['post_content']),
                'start_date' => $row['start_date'] ?? '',
                'end_date' => $row['end_date'] ?? '',
                'image' => get_featured_image($pdo, $gallery_prefix, (int)$row['ID']),
            ]);
        } else {
            echo json_encode(null);
        }
        break;

    // ── Global Search ───────────────────────────────────────────────────
    case 'search':
        $q = $_GET['q'] ?? '';
        if (strlen($q) < 2) {
            echo json_encode([]);
            break;
        }
        $term = '%' . $q . '%';
        $results = [];

        foreach (['hub', 'market', 'jewelry', 'gallery'] as $s) {
            $p = get_table_prefix($s);
            $site_name = ['hub' => 'Cultural Heritage', 'market' => 'The Market', 'jewelry' => 'The Vault', 'gallery' => 'Art Gallery'][$s];

            // Products (for market, jewelry, gallery)
            if ($s !== 'hub') {
                $stmt = $pdo->prepare("
                    SELECT ID, post_title, post_name FROM {$p}posts
                    WHERE post_type = 'product' AND post_status = 'publish'
                    AND (post_title LIKE ? OR post_content LIKE ?)
                    LIMIT 5
                ");
                $stmt->execute([$term, $term]);
                foreach ($stmt->fetchAll() as $row) {
                    $price = get_product_meta($pdo, $p, (int)$row['ID'], '_price');
                    $results[] = [
                        'type' => 'product',
                        'site' => $s,
                        'site_name' => $site_name,
                        'id' => (int)$row['ID'],
                        'title' => $row['post_title'],
                        'price' => $price,
                        'image' => get_featured_image($pdo, $p, (int)$row['ID']),
                    ];
                }
            }

            // Posts
            $stmt = $pdo->prepare("
                SELECT ID, post_title, post_name, post_excerpt, post_content FROM {$p}posts
                WHERE post_type = 'post' AND post_status = 'publish'
                AND (post_title LIKE ? OR post_content LIKE ?)
                LIMIT 3
            ");
            $stmt->execute([$term, $term]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = [
                    'type' => 'post',
                    'site' => $s,
                    'site_name' => $site_name,
                    'id' => (int)$row['ID'],
                    'title' => $row['post_title'],
                    'excerpt' => wp_trim_excerpt($row['post_excerpt'] ?: $row['post_content'], 120),
                    'image' => get_featured_image($pdo, $p, (int)$row['ID']),
                ];
            }

            // Pages
            $stmt = $pdo->prepare("
                SELECT ID, post_title, post_name, post_excerpt FROM {$p}posts
                WHERE post_type = 'page' AND post_status = 'publish'
                AND (post_title LIKE ? OR post_content LIKE ?)
                LIMIT 3
            ");
            $stmt->execute([$term, $term]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = [
                    'type' => 'page',
                    'site' => $s,
                    'site_name' => $site_name,
                    'id' => (int)$row['ID'],
                    'title' => $row['post_title'],
                    'slug' => $row['post_name'],
                ];
            }
        }

        echo json_encode($results);
        break;

    // ── App Config ──────────────────────────────────────────────────────
    case 'config':
        $config = [
            'sites' => [
                'hub' => ['name' => 'Cultural Heritage Centre', 'base_url' => $base_url],
                'market' => ['name' => 'The Market', 'base_url' => $base_url . '/market'],
                'jewelry' => ['name' => 'The Vault', 'base_url' => $base_url . '/jewelry'],
                'gallery' => ['name' => 'Art Gallery', 'base_url' => $base_url . '/gallery'],
            ],
            'contact' => [
                'phone' => '+255786454999',
                'whatsapp' => '255786454999',
                'email' => 'info@culturalheritage.co.tz',
                'address' => 'Dodoma Road, Arusha, Tanzania',
                'coordinates' => ['lat' => -3.3869, 'lng' => 36.6830],
                'hours' => 'Mon-Sat 8am-8pm, Sun 10am-7pm',
            ],
            'assets' => [
                'logo_white' => $base_url . '/wp-content/themes/ch-main-hub/assets/images/logo-white.png',
                'hero_centre' => $base_url . '/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg',
                'hero_market' => $base_url . '/wp-content/themes/ch-market/assets/images/market-hero.jpg',
                'hero_vault' => $base_url . '/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg',
                'hero_gallery' => $base_url . '/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg',
            ],
            'version' => '1.0.0',
        ];
        echo json_encode($config);
        break;

    // ── Sliders (managed from WP options or fallback to defaults) ─────
    case 'sliders':
        $slider_prefix = get_table_prefix('hub');
        $stmt = $pdo->prepare("SELECT option_value FROM {$slider_prefix}options WHERE option_name = 'ch_app_sliders'");
        $stmt->execute();
        $saved = $stmt->fetchColumn();

        if ($saved) {
            echo $saved;
        } else {
            // Default slides using real images from all 4 theme directories
            echo json_encode([
                [
                    'id' => 1,
                    'image' => $base_url . '/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg',
                    'title' => 'Cultural Heritage Centre',
                    'subtitle' => 'Where Art, Heritage & Discovery Converge — Arusha, Tanzania',
                    'label' => 'EST. 1994',
                    'label_color' => '#C5A059',
                    'cta' => 'Explore',
                ],
                [
                    'id' => 2,
                    'image' => $base_url . '/wp-content/themes/ch-market/assets/images/market-hero.jpg',
                    'title' => 'The Market',
                    'subtitle' => 'Handcrafted treasures from across Africa — Makonde carvings, Maasai beadwork, Zanzibar spices',
                    'label' => 'HANDCRAFTS & ARTIFACTS',
                    'label_color' => '#D4813B',
                    'cta' => 'Shop Now',
                    'tab' => 'Market',
                ],
                [
                    'id' => 3,
                    'image' => $base_url . '/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg',
                    'title' => 'The Vault',
                    'subtitle' => 'Rare tanzanite, ethically sourced gemstones, and fine jewelry crafted in Arusha',
                    'label' => 'TANZANITE & FINE JEWELRY',
                    'label_color' => '#1E2F97',
                    'cta' => 'Discover',
                    'tab' => 'Vault',
                ],
                [
                    'id' => 4,
                    'image' => $base_url . '/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg',
                    'title' => 'The Art Gallery',
                    'subtitle' => 'Contemporary and traditional African art with rotating exhibitions',
                    'label' => 'EXHIBITIONS & ART',
                    'label_color' => '#C5A059',
                    'cta' => 'View Gallery',
                    'tab' => 'Gallery',
                ],
                [
                    'id' => 5,
                    'image' => $base_url . '/wp-content/themes/ch-main-hub/assets/images/experience-1.jpg',
                    'title' => 'Experience Africa',
                    'subtitle' => 'Discover centuries of craftsmanship, culture, and artistic heritage',
                    'label' => 'THE EXPERIENCE',
                    'label_color' => '#C5A059',
                    'cta' => 'Learn More',
                ],
                [
                    'id' => 6,
                    'image' => $base_url . '/wp-content/themes/ch-gallery/assets/images/baluba-beaded-ceremonial-mask.jpg',
                    'title' => 'Ceremonial Art',
                    'subtitle' => 'Ancient masks and ceremonial pieces from across the African continent',
                    'label' => 'GALLERY COLLECTION',
                    'label_color' => '#C5A059',
                    'cta' => 'View Gallery',
                    'tab' => 'Gallery',
                ],
            ]);
        }
        break;

    // ── Form Submission (sends email via WordPress) ───────────────────
    case 'submit_form':
        $to = 'twinfusion2023@gmail.com';
        $form_type = $_GET['form_type'] ?? $_POST['form_type'] ?? 'enquiry';
        $name = $_GET['name'] ?? $_POST['name'] ?? '';
        $email = $_GET['email'] ?? $_POST['email'] ?? '';

        $type_labels = [
            'booking' => 'Exhibition Booking',
            'visit' => 'Visit Request',
            'contact' => 'Contact Form',
            'consultation' => 'Private Consultation',
            'enquiry' => 'General Enquiry',
        ];

        $subject = ($type_labels[$form_type] ?? 'App Form') . ' from ' . ($name ?: 'App User');

        $body = "New {$subject}\n\n";
        $body .= "Submitted via Cultural Heritage Mobile App\n";
        $body .= "────────────────────────────────\n\n";

        $skip_keys = ['action', 'form_type', '_t'];
        foreach (array_merge($_GET, $_POST) as $key => $value) {
            if (in_array($key, $skip_keys) || empty($value)) continue;
            $label = ucfirst(str_replace('_', ' ', $key));
            $body .= "{$label}: {$value}\n";
        }

        $body .= "\n────────────────────────────────\n";
        $body .= "Sent from Cultural Heritage App\n";

        $headers = "From: Cultural Heritage App <noreply@twinfusion.co.ke>\r\n";
        if ($email) $headers .= "Reply-To: {$name} <{$email}>\r\n";

        $sent = @mail($to, $subject, $body, $headers);

        echo json_encode(['success' => $sent, 'message' => $sent ? 'Form submitted successfully' : 'Email sending failed, please try WhatsApp']);
        break;

    // ── Auth: Register ─────────────────────────────────────────────────
    case 'register':
        $hp = get_table_prefix('hub');
        // Ensure app_users table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS ch_app_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone VARCHAR(30),
            password_hash VARCHAR(255) NOT NULL,
            avatar_url VARCHAR(500),
            preferences TEXT,
            location VARCHAR(200),
            device_info TEXT,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('active','suspended') DEFAULT 'active'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("CREATE TABLE IF NOT EXISTS ch_app_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            device_info TEXT,
            ip_address VARCHAR(45),
            location VARCHAR(200),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            INDEX(token), INDEX(user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("CREATE TABLE IF NOT EXISTS ch_app_analytics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            session_token VARCHAR(64),
            event_type VARCHAR(50) NOT NULL,
            screen VARCHAR(100),
            product_id INT,
            site VARCHAR(20),
            metadata TEXT,
            ip_address VARCHAR(45),
            location VARCHAR(200),
            device_info TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX(user_id), INDEX(event_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $name = $_GET['name'] ?? $_POST['name'] ?? '';
        $email = $_GET['email'] ?? $_POST['email'] ?? '';
        $phone = $_GET['phone'] ?? $_POST['phone'] ?? '';
        $password = $_GET['password'] ?? $_POST['password'] ?? '';
        $device = $_GET['device_info'] ?? $_POST['device_info'] ?? '';
        $loc = $_GET['location'] ?? $_POST['location'] ?? '';

        if (!$name || !$email || !$password) {
            echo json_encode(['error' => 'Name, email and password are required']);
            break;
        }
        if (strlen($password) < 6) {
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            break;
        }

        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM ch_app_users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'Email already registered. Please login.']);
            break;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO ch_app_users (name, email, phone, password_hash, device_info, location) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $phone, $hash, $device, $loc]);
        $user_id = $pdo->lastInsertId();

        // Create session
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $stmt = $pdo->prepare("INSERT INTO ch_app_sessions (user_id, token, device_info, ip_address, location, expires_at) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $token, $device, $ip, $loc, $expires]);

        echo json_encode([
            'success' => true,
            'user' => ['id' => (int)$user_id, 'name' => $name, 'email' => $email, 'phone' => $phone],
            'token' => $token,
            'expires' => $expires,
        ]);
        break;

    // ── Auth: Login ──────────────────────────────────────────────────────
    case 'login':
        $email = $_GET['email'] ?? $_POST['email'] ?? '';
        $password = $_GET['password'] ?? $_POST['password'] ?? '';
        $device = $_GET['device_info'] ?? $_POST['device_info'] ?? '';
        $loc = $_GET['location'] ?? $_POST['location'] ?? '';

        if (!$email || !$password) {
            echo json_encode(['error' => 'Email and password are required']);
            break;
        }

        $stmt = $pdo->prepare("SELECT * FROM ch_app_users WHERE email = ? AND status = 'active'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            echo json_encode(['error' => 'Invalid email or password']);
            break;
        }

        // Update last login
        $pdo->prepare("UPDATE ch_app_users SET last_login = NOW(), device_info = ?, location = ? WHERE id = ?")->execute([$device, $loc, $user['id']]);

        // Create new session
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $stmt = $pdo->prepare("INSERT INTO ch_app_sessions (user_id, token, device_info, ip_address, location, expires_at) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user['id'], $token, $device, $ip, $loc, $expires]);

        echo json_encode([
            'success' => true,
            'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'phone' => $user['phone'], 'preferences' => $user['preferences'] ? json_decode($user['preferences'], true) : null],
            'token' => $token,
            'expires' => $expires,
        ]);
        break;

    // ── Auth: Profile (get/update) ───────────────────────────────────────
    case 'profile':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode(['error' => 'Authentication required']); break; }

        $stmt = $pdo->prepare("SELECT s.user_id, u.* FROM ch_app_sessions s JOIN ch_app_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        if (!$user) { echo json_encode(['error' => 'Session expired. Please login again.']); break; }

        // If updating preferences
        $prefs = $_GET['preferences'] ?? $_POST['preferences'] ?? '';
        if ($prefs) {
            $pdo->prepare("UPDATE ch_app_users SET preferences = ? WHERE id = ?")->execute([$prefs, $user['id']]);
        }

        echo json_encode([
            'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'phone' => $user['phone'], 'preferences' => $user['preferences'] ? json_decode($user['preferences'], true) : null, 'created_at' => $user['created_at']],
        ]);
        break;

    // ── Auth: Logout ─────────────────────────────────────────────────────
    case 'logout':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if ($token) {
            $pdo->prepare("DELETE FROM ch_app_sessions WHERE token = ?")->execute([$token]);
        }
        echo json_encode(['success' => true]);
        break;

    // ── Analytics: Track Event ───────────────────────────────────────────
    case 'track':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        $event = $_GET['event_type'] ?? $_POST['event_type'] ?? 'view';
        $screen = $_GET['screen'] ?? $_POST['screen'] ?? '';
        $product_id = $_GET['product_id'] ?? $_POST['product_id'] ?? null;
        $site_key = $_GET['site'] ?? $_POST['site'] ?? '';
        $meta = $_GET['metadata'] ?? $_POST['metadata'] ?? '';
        $device = $_GET['device_info'] ?? $_POST['device_info'] ?? '';
        $loc = $_GET['location'] ?? $_POST['location'] ?? '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        // Resolve user from token
        $user_id = null;
        if ($token) {
            $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
            $stmt->execute([$token]);
            $user_id = $stmt->fetchColumn() ?: null;
        }

        $stmt = $pdo->prepare("INSERT INTO ch_app_analytics (user_id, session_token, event_type, screen, product_id, site, metadata, ip_address, location, device_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $token, $event, $screen, $product_id, $site_key, $meta, $ip, $loc, $device]);

        echo json_encode(['success' => true]);
        break;

    // ── Analytics: User Recommendations ──────────────────────────────────
    case 'recommendations':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode([]); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $user_id = $stmt->fetchColumn();
        if (!$user_id) { echo json_encode([]); break; }

        // Get most viewed sites/categories
        $stmt = $pdo->prepare("SELECT site, COUNT(*) as cnt FROM ch_app_analytics WHERE user_id = ? AND event_type = 'view_product' GROUP BY site ORDER BY cnt DESC LIMIT 1");
        $stmt->execute([$user_id]);
        $fav_site = $stmt->fetchColumn() ?: 'market';

        // Get products from favorite site
        $p = get_table_prefix($fav_site === 'jewelry' ? 'jewelry' : ($fav_site === 'gallery' ? 'gallery' : 'market'));
        $blog_id = $site_blog_ids[$fav_site] ?? 2;
        $prefix = $blog_id === 1 ? 'wp_' : "wp_{$blog_id}_";

        $stmt = $pdo->prepare("SELECT * FROM {$prefix}posts WHERE post_type = 'product' AND post_status = 'publish' ORDER BY RAND() LIMIT 4");
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $products = array_map(function($row) use ($pdo, $prefix) {
            return format_product($pdo, $prefix, $row);
        }, $rows);

        echo json_encode(['site' => $fav_site, 'products' => $products]);
        break;

    // ── Chat: Create tables + send message ─────────────────────────────
    case 'chat_send':
        $pdo->exec("CREATE TABLE IF NOT EXISTS ch_app_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            user_name VARCHAR(100),
            user_email VARCHAR(150),
            message TEXT NOT NULL,
            reply TEXT,
            replied_by VARCHAR(100),
            replied_at DATETIME,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX(user_id), INDEX(is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        $message = $_GET['message'] ?? $_POST['message'] ?? '';
        if (!$message) { echo json_encode(['error' => 'Message is required']); break; }

        $user_id = null; $user_name = 'Guest'; $user_email = '';
        if ($token) {
            $stmt = $pdo->prepare("SELECT s.user_id, u.name, u.email FROM ch_app_sessions s JOIN ch_app_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()");
            $stmt->execute([$token]);
            $u = $stmt->fetch();
            if ($u) { $user_id = $u['user_id']; $user_name = $u['name']; $user_email = $u['email']; }
        }
        if (!$user_id) {
            $user_name = $_GET['name'] ?? $_POST['name'] ?? 'Guest';
            $user_email = $_GET['email'] ?? $_POST['email'] ?? '';
        }

        $stmt = $pdo->prepare("INSERT INTO ch_app_messages (user_id, user_name, user_email, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $user_name, $user_email, $message]);

        // Email notification to admin
        @mail('twinfusion2023@gmail.com', "App Chat: {$user_name}", "From: {$user_name} ({$user_email})\n\n{$message}\n\n---\nReply from WordPress Admin > App Messages", "From: Cultural Heritage App <noreply@twinfusion.co.ke>\r\nReply-To: {$user_email}");

        echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
        break;

    // ── Chat: Get messages for user ──────────────────────────────────────
    case 'chat_messages':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode([]); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if (!$uid) { echo json_encode([]); break; }

        $stmt = $pdo->prepare("SELECT id, message, reply, replied_by, replied_at, is_read, created_at FROM ch_app_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // ── Chat: Mark as read ───────────────────────────────────────────────
    case 'chat_read':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode(['success' => false]); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if ($uid) {
            $pdo->prepare("UPDATE ch_app_messages SET is_read = 1 WHERE user_id = ? AND reply IS NOT NULL AND is_read = 0")->execute([$uid]);
        }
        echo json_encode(['success' => true]);
        break;

    // ── Chat: Unread count ───────────────────────────────────────────────
    case 'chat_unread':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode(['count' => 0]); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if (!$uid) { echo json_encode(['count' => 0]); break; }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM ch_app_messages WHERE user_id = ? AND reply IS NOT NULL AND is_read = 0");
        $stmt->execute([$uid]);
        echo json_encode(['count' => (int)$stmt->fetchColumn()]);
        break;

    // ── Comments: Submit to WordPress native comments table ────────────
    case 'submit_comment':
        $post_title = $_GET['post_title'] ?? $_POST['post_title'] ?? '';
        $comment_text = $_GET['comment'] ?? $_POST['comment'] ?? '';
        $author_name = $_GET['name'] ?? $_POST['name'] ?? 'App User';
        $author_email = $_GET['email'] ?? $_POST['email'] ?? '';
        $comment_site = $_GET['site'] ?? $_POST['site'] ?? 'hub';

        if (!$comment_text) { echo json_encode(['error' => 'Comment is required']); break; }

        $cp = get_table_prefix($comment_site);

        // Find the post by title
        $stmt = $pdo->prepare("SELECT ID FROM {$cp}posts WHERE post_title = ? AND post_type = 'post' AND post_status = 'publish' LIMIT 1");
        $stmt->execute([$post_title]);
        $post_id = $stmt->fetchColumn();

        if (!$post_id) {
            // Try partial match
            $stmt = $pdo->prepare("SELECT ID FROM {$cp}posts WHERE post_title LIKE ? AND post_type = 'post' AND post_status = 'publish' LIMIT 1");
            $stmt->execute(['%' . $post_title . '%']);
            $post_id = $stmt->fetchColumn();
        }

        if (!$post_id) { echo json_encode(['error' => 'Post not found']); break; }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Cultural Heritage App';

        $stmt = $pdo->prepare("INSERT INTO {$cp}comments (comment_post_ID, comment_author, comment_author_email, comment_author_IP, comment_date, comment_date_gmt, comment_content, comment_approved, comment_agent, comment_type) VALUES (?, ?, ?, ?, NOW(), UTC_TIMESTAMP(), ?, '0', ?, 'comment')");
        $stmt->execute([$post_id, $author_name, $author_email, $ip, $comment_text, $agent]);

        // Update comment count
        $pdo->prepare("UPDATE {$cp}posts SET comment_count = comment_count + 1 WHERE ID = ?")->execute([$post_id]);

        echo json_encode(['success' => true, 'message' => 'Comment submitted for moderation']);
        break;

    // ── Comments: Get approved comments for a post ───────────────────────
    case 'get_comments':
        $post_title = $_GET['post_title'] ?? '';
        $comment_site = $_GET['site'] ?? 'hub';
        if (!$post_title) { echo json_encode([]); break; }

        $cp = get_table_prefix($comment_site);
        $stmt = $pdo->prepare("SELECT ID FROM {$cp}posts WHERE post_title = ? AND post_type = 'post' AND post_status = 'publish' LIMIT 1");
        $stmt->execute([$post_title]);
        $post_id = $stmt->fetchColumn();
        if (!$post_id) { echo json_encode([]); break; }

        $stmt = $pdo->prepare("SELECT comment_author as name, comment_content as text, comment_date as date FROM {$cp}comments WHERE comment_post_ID = ? AND comment_approved = '1' ORDER BY comment_date DESC LIMIT 20");
        $stmt->execute([$post_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // ── Reserve: Lock inventory for 2 hours ────────────────────────────
    case 'reserve':
        $pdo->exec("CREATE TABLE IF NOT EXISTS ch_app_reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            site VARCHAR(20) NOT NULL,
            reserve_code VARCHAR(32) NOT NULL,
            status ENUM('active','expired','completed','cancelled') DEFAULT 'active',
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX(user_id), INDEX(reserve_code), INDEX(status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        $prod_id = (int)($_GET['product_id'] ?? $_POST['product_id'] ?? 0);
        $res_site = $_GET['site'] ?? $_POST['site'] ?? 'gallery';

        if (!$token || !$prod_id) { echo json_encode(['error' => 'Token and product_id required']); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if (!$uid) { echo json_encode(['error' => 'Please login to reserve']); break; }

        // Check if already reserved
        $stmt = $pdo->prepare("SELECT id FROM ch_app_reservations WHERE product_id = ? AND site = ? AND status = 'active' AND expires_at > NOW()");
        $stmt->execute([$prod_id, $res_site]);
        if ($stmt->fetch()) { echo json_encode(['error' => 'This item is already reserved by another visitor']); break; }

        // Lock WooCommerce stock
        $rp = get_table_prefix($res_site);
        $pdo->prepare("UPDATE {$rp}postmeta SET meta_value = '0' WHERE post_id = ? AND meta_key = '_stock'")->execute([$prod_id]);
        $pdo->prepare("UPDATE {$rp}postmeta SET meta_value = 'outofstock' WHERE post_id = ? AND meta_key = '_stock_status'")->execute([$prod_id]);
        // Set stock managed
        $pdo->prepare("INSERT INTO {$rp}postmeta (post_id, meta_key, meta_value) VALUES (?, '_manage_stock', 'yes') ON DUPLICATE KEY UPDATE meta_value = 'yes'")->execute([$prod_id]);

        $code = strtoupper(substr(md5(uniqid()), 0, 8));
        $expires = date('Y-m-d H:i:s', strtotime('+2 hours'));

        $stmt = $pdo->prepare("INSERT INTO ch_app_reservations (user_id, product_id, site, reserve_code, expires_at) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$uid, $prod_id, $res_site, $code, $expires]);

        echo json_encode(['success' => true, 'code' => $code, 'expires_at' => $expires, 'message' => 'Item reserved for 2 hours']);
        break;

    // ── Reservations: Get user's active reservations ─────────────────────
    case 'reservations':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode([]); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if (!$uid) { echo json_encode([]); break; }

        // Expire old reservations and restore stock
        $expired = $pdo->prepare("SELECT * FROM ch_app_reservations WHERE status = 'active' AND expires_at < NOW()");
        $expired->execute();
        foreach ($expired->fetchAll() as $exp) {
            $ep = get_table_prefix($exp['site']);
            $pdo->prepare("UPDATE {$ep}postmeta SET meta_value = '1' WHERE post_id = ? AND meta_key = '_stock'")->execute([$exp['product_id']]);
            $pdo->prepare("UPDATE {$ep}postmeta SET meta_value = 'instock' WHERE post_id = ? AND meta_key = '_stock_status'")->execute([$exp['product_id']]);
            $pdo->prepare("UPDATE ch_app_reservations SET status = 'expired' WHERE id = ?")->execute([$exp['id']]);
        }

        $stmt = $pdo->prepare("SELECT r.*, p.post_title as product_name FROM ch_app_reservations r LEFT JOIN wp_posts p ON p.ID = r.product_id WHERE r.user_id = ? AND r.status = 'active' ORDER BY r.created_at DESC");
        $stmt->execute([$uid]);
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get product images
        foreach ($reservations as &$r) {
            $rp = get_table_prefix($r['site']);
            $r['image'] = get_featured_image($pdo, $rp, (int)$r['product_id']);
            // Get product name from correct site table
            $stmt2 = $pdo->prepare("SELECT post_title FROM {$rp}posts WHERE ID = ?");
            $stmt2->execute([$r['product_id']]);
            $r['product_name'] = $stmt2->fetchColumn() ?: $r['product_name'];
        }

        echo json_encode($reservations);
        break;

    // ── Master QR: Generate checkout code ────────────────────────────────
    case 'master_qr':
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
        if (!$token) { echo json_encode(['error' => 'Auth required']); break; }

        $stmt = $pdo->prepare("SELECT user_id FROM ch_app_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $uid = $stmt->fetchColumn();
        if (!$uid) { echo json_encode(['error' => 'Session expired']); break; }

        $stmt = $pdo->prepare("SELECT r.reserve_code, r.product_id, r.site FROM ch_app_reservations r WHERE r.user_id = ? AND r.status = 'active' AND r.expires_at > NOW()");
        $stmt->execute([$uid]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($items)) { echo json_encode(['error' => 'No active reservations']); break; }

        $master_code = 'CH-' . strtoupper(substr(md5($uid . time()), 0, 10));
        $qr_data = json_encode(['master' => $master_code, 'user_id' => (int)$uid, 'items' => $items, 'generated' => date('Y-m-d H:i:s')]);

        echo json_encode(['master_code' => $master_code, 'qr_data' => $qr_data, 'item_count' => count($items)]);
        break;

    // ── Staff: Lookup reservation by code ────────────────────────────────
    case 'staff_lookup':
        $code = $_GET['code'] ?? $_POST['code'] ?? '';
        if (!$code) { echo json_encode(['error' => 'Code required']); break; }

        // Try master code format
        if (str_starts_with($code, 'CH-') || str_starts_with($code, '{')) {
            $data = json_decode($code, true) ?: json_decode(urldecode($code), true);
            if ($data && isset($data['user_id'])) {
                $stmt = $pdo->prepare("SELECT r.*, u.name, u.email, u.phone FROM ch_app_reservations r JOIN ch_app_users u ON r.user_id = u.id WHERE r.user_id = ? AND r.status = 'active'");
                $stmt->execute([$data['user_id']]);
                echo json_encode(['reservations' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'customer' => ['name' => $data['user_id']]]);
                break;
            }
        }

        // Try single reserve code
        $stmt = $pdo->prepare("SELECT r.*, u.name, u.email, u.phone FROM ch_app_reservations r JOIN ch_app_users u ON r.user_id = u.id WHERE r.reserve_code = ?");
        $stmt->execute([$code]);
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['reservations' => $res]);
        break;

    // ── Default ─────────────────────────────────────────────────────────
    default:
        echo json_encode([
            'api' => 'Cultural Heritage Mobile App API',
            'version' => '1.0.0',
            'endpoints' => [
                'config', 'products', 'product', 'categories',
                'posts', 'post', 'pages', 'page',
                'exhibitions', 'exhibition', 'search',
            ],
        ]);
        break;
}
