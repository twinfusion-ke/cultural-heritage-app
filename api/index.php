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
