<?php
/**
 * Cultural Heritage — Database Seeder
 *
 * Populates products, posts, and pages with sample content and images.
 * Run once via: https://twinfusion.co.ke/cultural-heritage/app-api/seed.php
 */

header('Content-Type: text/plain; charset=utf-8');
set_time_limit(300);

// ── Database Connection ─────────────────────────────────────────────────────
$wp_config = dirname(__DIR__, 2) . '/cultural-heritage/wp-config.php';
if (file_exists($wp_config)) {
    $c = file_get_contents($wp_config);
    preg_match("/define\(\s*'DB_NAME'\s*,\s*'([^']+)'/", $c, $m); $db_name = $m[1] ?? 'cultural_heritage_wp';
    preg_match("/define\(\s*'DB_USER'\s*,\s*'([^']+)'/", $c, $m); $db_user = $m[1] ?? 'root';
    preg_match("/define\(\s*'DB_PASSWORD'\s*,\s*'([^']*)'/", $c, $m); $db_pass = $m[1] ?? '';
    preg_match("/define\(\s*'DB_HOST'\s*,\s*'([^']+)'/", $c, $m); $db_host = $m[1] ?? 'localhost';
} else {
    $db_host = 'localhost:3307'; $db_name = 'cultural_heritage_wp'; $db_user = 'root'; $db_pass = '';
}

$host_parts = explode(':', $db_host);
$dsn = 'mysql:host=' . $host_parts[0] . ';dbname=' . $db_name . ';charset=utf8mb4';
if (isset($host_parts[1])) $dsn .= ';port=' . $host_parts[1];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    die("DB connection failed: " . $e->getMessage());
}

$base_url = 'https://twinfusion.co.ke/cultural-heritage';

// ── Helpers ─────────────────────────────────────────────────────────────────
function get_prefix($blog_id) {
    return $blog_id === 1 ? 'wp_' : "wp_{$blog_id}_";
}

function insert_post($pdo, $prefix, $data) {
    $stmt = $pdo->prepare("INSERT INTO {$prefix}posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, post_type, post_modified, post_modified_gmt, comment_status, ping_status, to_ping, pinged, post_content_filtered) VALUES (1, NOW(), UTC_TIMESTAMP(), ?, ?, ?, 'publish', ?, ?, NOW(), UTC_TIMESTAMP(), 'closed', 'closed', '', '', '')");
    $stmt->execute([$data['content'], $data['title'], $data['excerpt'] ?? '', $data['slug'], $data['type']]);
    return $pdo->lastInsertId();
}

function set_meta($pdo, $prefix, $post_id, $key, $value) {
    $stmt = $pdo->prepare("INSERT INTO {$prefix}postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)");
    $stmt->execute([$post_id, $key, $value]);
}

function create_image_attachment($pdo, $prefix, $url, $parent_id = 0) {
    $stmt = $pdo->prepare("INSERT INTO {$prefix}posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, post_type, post_mime_type, guid, post_modified, post_modified_gmt, comment_status, ping_status, to_ping, pinged, post_content_filtered, post_parent) VALUES (1, NOW(), UTC_TIMESTAMP(), '', '', '', 'inherit', ?, 'attachment', 'image/jpeg', ?, NOW(), UTC_TIMESTAMP(), 'closed', 'closed', '', '', '', ?)");
    $name = basename(parse_url($url, PHP_URL_PATH));
    $stmt->execute([$name, $url, $parent_id]);
    $id = $pdo->lastInsertId();
    set_meta($pdo, $prefix, $id, '_wp_attached_file', $url);
    return $id;
}

function set_featured_image($pdo, $prefix, $post_id, $image_url) {
    $img_id = create_image_attachment($pdo, $prefix, $image_url, $post_id);
    set_meta($pdo, $prefix, $post_id, '_thumbnail_id', $img_id);
    return $img_id;
}

function ensure_term($pdo, $prefix, $name, $slug, $taxonomy) {
    $stmt = $pdo->prepare("SELECT t.term_id FROM {$prefix}terms t JOIN {$prefix}term_taxonomy tt ON t.term_id = tt.term_id WHERE t.slug = ? AND tt.taxonomy = ?");
    $stmt->execute([$slug, $taxonomy]);
    $existing = $stmt->fetchColumn();
    if ($existing) return $existing;

    $pdo->prepare("INSERT INTO {$prefix}terms (name, slug) VALUES (?, ?)")->execute([$name, $slug]);
    $term_id = $pdo->lastInsertId();
    $pdo->prepare("INSERT INTO {$prefix}term_taxonomy (term_id, taxonomy, description) VALUES (?, ?, '')")->execute([$term_id, $taxonomy]);
    return $term_id;
}

function assign_term($pdo, $prefix, $post_id, $term_id) {
    $stmt = $pdo->prepare("SELECT term_taxonomy_id FROM {$prefix}term_taxonomy WHERE term_id = ?");
    $stmt->execute([$term_id]);
    $tt_id = $stmt->fetchColumn();
    if ($tt_id) {
        $pdo->prepare("INSERT IGNORE INTO {$prefix}term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)")->execute([$post_id, $tt_id]);
        $pdo->prepare("UPDATE {$prefix}term_taxonomy SET count = count + 1 WHERE term_taxonomy_id = ?")->execute([$tt_id]);
    }
}

echo "=== Cultural Heritage Database Seeder ===\n\n";

// ════════════════════════════════════════════════════════════════════════════
// MARKET PRODUCTS (blog_id = 2)
// ════════════════════════════════════════════════════════════════════════════
$mp = get_prefix(2);
echo "--- Seeding Market Products ---\n";

$market_cats = [
    'handcrafts' => ensure_term($pdo, $mp, 'Handcrafts', 'handcrafts', 'product_cat'),
    'masks' => ensure_term($pdo, $mp, 'African Masks', 'masks', 'product_cat'),
    'textiles' => ensure_term($pdo, $mp, 'Textiles', 'textiles', 'product_cat'),
    'spices' => ensure_term($pdo, $mp, 'Spices & Oils', 'spices', 'product_cat'),
    'artifacts' => ensure_term($pdo, $mp, 'Artifacts', 'artifacts', 'product_cat'),
    'jewelry-acc' => ensure_term($pdo, $mp, 'Jewelry & Accessories', 'jewelry-accessories', 'product_cat'),
];

$market_products = [
    ['Makonde Ebony Carving', 'makonde-ebony-carving', '350', 'A masterfully carved ebony figure by Makonde artisans from Southern Tanzania. Each piece represents ancestral spirits and tells a story of the Makonde people\'s rich cultural heritage.', 'handcrafts', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800'],
    ['Maasai Warrior Shield', 'maasai-warrior-shield', '280', 'Authentic hand-painted cowhide shield crafted by Maasai warriors. Traditional red, black and white patterns represent bravery and strength in Maasai culture.', 'artifacts', 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800'],
    ['Tingatinga Painting — Safari', 'tingatinga-safari', '450', 'Vibrant Tingatinga-style painting depicting an African safari scene. This distinctive art form originated in Tanzania in the 1960s and is known for its bold colors and playful imagery.', 'handcrafts', 'https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?w=800'],
    ['Kanga Cloth Set', 'kanga-cloth-set', '45', 'Set of two traditional Kanga cloths with Swahili proverbs printed along the border. Made from pure cotton, these vibrant wraps are a staple of East African fashion.', 'textiles', 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800'],
    ['Zanzibar Spice Collection', 'zanzibar-spice-collection', '35', 'Premium spice gift box from Zanzibar featuring cloves, cardamom, cinnamon, vanilla, black pepper, and turmeric. Sourced directly from spice farms on the island.', 'spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'],
    ['Senufo Face Mask', 'senufo-face-mask', '520', 'Ceremonial face mask from the Senufo people. Hand-carved from a single piece of iroko wood, featuring traditional scarification patterns and natural pigments.', 'masks', 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800'],
    ['Beaded Maasai Collar Necklace', 'beaded-maasai-collar', '85', 'Stunning multi-layered beaded collar necklace handmade by Maasai women. Each color carries symbolic meaning: red for bravery, blue for sky, white for peace.', 'jewelry-acc', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'],
    ['Baobab Oil — Pure Cold-Pressed', 'baobab-oil', '28', 'Pure cold-pressed baobab oil from Tanzania. Rich in vitamins A, D, E and essential fatty acids. Used for skincare, haircare, and culinary purposes.', 'spices', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'],
    ['Kitenge Quilted Bag', 'kitenge-quilted-bag', '65', 'Handmade quilted bag using authentic Kitenge fabric. Features vibrant African print with leather straps and brass hardware. Perfect for everyday use.', 'textiles', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
    ['Dan Mask — Ivory Coast', 'dan-mask', '680', 'Antique Dan mask from Ivory Coast, used in initiation ceremonies. Features smooth polished surface with narrow eye slits and a serene expression typical of the Dan style.', 'masks', 'https://images.unsplash.com/photo-1590735213408-b0af371bba54?w=800'],
    ['Sisal Woven Basket', 'sisal-woven-basket', '42', 'Hand-woven sisal basket from rural Tanzania. Natural dyes create geometric patterns passed down through generations. Functional art that doubles as home decor.', 'handcrafts', 'https://images.unsplash.com/photo-1567225591450-06036b3392a6?w=800'],
    ['Kilimanjaro Coffee Beans — 500g', 'kilimanjaro-coffee-premium', '22', 'Single-origin Arabica coffee beans grown on the slopes of Mount Kilimanjaro. Medium roast with notes of dark chocolate, citrus, and toasted nuts. Fair trade certified.', 'spices', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'],
];

foreach ($market_products as $p) {
    $id = insert_post($pdo, $mp, ['title' => $p[0], 'slug' => $p[1], 'content' => $p[3], 'excerpt' => substr($p[3], 0, 150), 'type' => 'product']);
    set_meta($pdo, $mp, $id, '_price', $p[2]);
    set_meta($pdo, $mp, $id, '_regular_price', $p[2]);
    set_meta($pdo, $mp, $id, '_stock_status', 'instock');
    set_meta($pdo, $mp, $id, '_visibility', 'visible');
    set_featured_image($pdo, $mp, $id, $p[5]);
    assign_term($pdo, $mp, $id, $market_cats[$p[4]]);
    echo "  + Market: {$p[0]} (\${$p[2]})\n";
}

// ════════════════════════════════════════════════════════════════════════════
// JEWELRY PRODUCTS (blog_id = 3)
// ════════════════════════════════════════════════════════════════════════════
$jp = get_prefix(3);
echo "\n--- Seeding Jewelry Products ---\n";

$jewelry_cats = [
    'tanzanite' => ensure_term($pdo, $jp, 'Tanzanite', 'tanzanite', 'product_cat'),
    'rings' => ensure_term($pdo, $jp, 'Rings', 'rings', 'product_cat'),
    'necklaces' => ensure_term($pdo, $jp, 'Necklaces', 'necklaces', 'product_cat'),
    'earrings' => ensure_term($pdo, $jp, 'Earrings', 'earrings', 'product_cat'),
    'gemstones' => ensure_term($pdo, $jp, 'Loose Gemstones', 'gemstones', 'product_cat'),
];

$jewelry_products = [
    ['Tanzanite Solitaire Ring — 3.2ct', 'tanzanite-solitaire-ring', '4500', 'Exceptional 3.2 carat oval-cut tanzanite set in 18k white gold. AAA grade with deep violet-blue color. Certified by the Tanzanite Foundation. Ethically sourced from Merelani Hills.', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:9:"Tanzanite";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"3.2 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Tanzanite & Diamond Pendant', 'tanzanite-diamond-pendant', '3200', 'Stunning pear-shaped tanzanite pendant surrounded by a halo of brilliant-cut diamonds. Set in platinum with an 18" chain. Total diamond weight: 0.45ct.', 'necklaces', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:19:"Tanzanite & Diamond";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"2.8 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Loose Tanzanite — 5.1ct Cushion', 'loose-tanzanite-cushion', '8500', 'Museum-quality loose tanzanite, cushion cut, 5.1 carats. Exceptional AAAA grade with vivid trichroic color — blue, violet and burgundy flashes visible from different angles.', 'gemstones', 'https://images.unsplash.com/photo-1583937443566-6b18c58f4874?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:9:"Tanzanite";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"5.1 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Ruby & Gold Earrings', 'ruby-gold-earrings', '1800', 'Elegant drop earrings featuring oval Mozambique rubies in 22k gold bezels. Deep pigeon-blood red color. Handcrafted by our master jewelers in Arusha.', 'earrings', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:4:"Ruby";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"1.4 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Sapphire Eternity Band', 'sapphire-eternity-band', '2400', 'Channel-set blue sapphire eternity band in 18k white gold. 12 perfectly matched Ceylon sapphires totaling 2.4 carats. Ideal as a wedding band or anniversary ring.', 'rings', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:8:"Sapphire";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"2.4 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Tanzanite Tennis Bracelet', 'tanzanite-tennis-bracelet', '6200', 'Exquisite tennis bracelet featuring 28 oval-cut tanzanites alternating with brilliant diamonds. Set in platinum. Total tanzanite weight: 8.4ct, diamond weight: 1.2ct.', 'tanzanite', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:19:"Tanzanite & Diamond";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"8.4 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Tsavorite Green Garnet Ring', 'tsavorite-ring', '3800', 'Rare Tsavorite garnet from the Merelani Hills, set in a vintage-inspired 18k rose gold setting with diamond accents. The vivid green rivals the finest emeralds.', 'rings', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:8:"Tsavorite";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:6:"2.1 ct";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Pearl & Gold Chain Necklace', 'pearl-gold-necklace', '950', 'South Sea cultured pearl pendant on a handmade 18k gold chain. The 12mm pearl displays beautiful orient and luster. A timeless piece that transitions from day to evening.', 'necklaces', 'https://images.unsplash.com/photo-1515562141589-67f0d569b6f2?w=800', 'a:2:{s:5:"stone";a:5:{s:4:"name";s:5:"Stone";s:5:"value";s:14:"South Sea Pearl";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}s:5:"carat";a:5:{s:4:"name";s:5:"Carat";s:5:"value";s:4:"12mm";s:8:"position";i:1;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
];

foreach ($jewelry_products as $p) {
    $id = insert_post($pdo, $jp, ['title' => $p[0], 'slug' => $p[1], 'content' => $p[3], 'excerpt' => substr($p[3], 0, 150), 'type' => 'product']);
    set_meta($pdo, $jp, $id, '_price', $p[2]);
    set_meta($pdo, $jp, $id, '_regular_price', $p[2]);
    set_meta($pdo, $jp, $id, '_stock_status', 'instock');
    set_meta($pdo, $jp, $id, '_visibility', 'visible');
    if (isset($p[6])) set_meta($pdo, $jp, $id, '_product_attributes', $p[6]);
    set_featured_image($pdo, $jp, $id, $p[5]);
    assign_term($pdo, $jp, $id, $jewelry_cats[$p[4]]);
    echo "  + Jewelry: {$p[0]} (\${$p[2]})\n";
}

// ════════════════════════════════════════════════════════════════════════════
// GALLERY PRODUCTS (blog_id = 4)
// ════════════════════════════════════════════════════════════════════════════
$gp = get_prefix(4);
echo "\n--- Seeding Gallery Products ---\n";

$gallery_cats = [
    'paintings' => ensure_term($pdo, $gp, 'Paintings', 'paintings', 'product_cat'),
    'sculpture' => ensure_term($pdo, $gp, 'Sculpture', 'sculpture', 'product_cat'),
    'prints' => ensure_term($pdo, $gp, 'Limited Prints', 'prints', 'product_cat'),
    'photography' => ensure_term($pdo, $gp, 'Photography', 'photography', 'product_cat'),
];

$gallery_products = [
    ['Kilimanjaro at Dawn — Oil on Canvas', 'kilimanjaro-dawn', '2800', 'Large-format oil painting capturing Mount Kilimanjaro at sunrise. Rich golden light illuminates the snow-capped peak against an indigo sky. 120x90cm, gallery-wrapped canvas.', 'paintings', 'https://images.unsplash.com/photo-1621996659490-3275b4d0d951?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:14:"Joseph Mmari";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Maasai Elder — Charcoal Portrait', 'maasai-elder-portrait', '1200', 'Photorealistic charcoal drawing of a Maasai elder, capturing the wisdom and dignity in his weathered features. Framed in handcrafted African hardwood. 60x80cm.', 'paintings', 'https://images.unsplash.com/photo-1594761054913-a4ec016e08d6?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:12:"Amina Bakari";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Unity — Bronze Sculpture', 'unity-bronze-sculpture', '3500', 'Abstract bronze sculpture representing unity and togetherness. Two intertwined figures rise from a polished granite base. Height: 45cm. Signed and numbered edition of 25.', 'sculpture', 'https://images.unsplash.com/photo-1544413660-299165566b1d?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:13:"Hassan Mwangi";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Serengeti Migration — Limited Print', 'serengeti-migration-print', '350', 'Giclée print of the iconic wildebeest migration across the Serengeti plains. Archival quality on Hahnemühle paper. Signed by the photographer. Edition of 100. 50x70cm.', 'prints', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:12:"Rashid Juma";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Baobab Tree — Fine Art Photo', 'baobab-fine-art', '480', 'Large format black and white photograph of an ancient baobab tree in Tarangire National Park. Printed on metallic paper for dramatic depth. 80x120cm.', 'photography', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:11:"David Kyalo";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
    ['Market Day — Acrylic on Canvas', 'market-day-acrylic', '1800', 'Colorful depiction of an East African market scene. Bold Tingatinga-influenced style with modern abstract elements. Women in vibrant kanga carrying baskets of fruit. 100x80cm.', 'paintings', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800', 'a:1:{s:6:"artist";a:5:{s:4:"name";s:6:"Artist";s:5:"value";s:11:"Grace Oduya";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:0;}}'],
];

foreach ($gallery_products as $p) {
    $id = insert_post($pdo, $gp, ['title' => $p[0], 'slug' => $p[1], 'content' => $p[3], 'excerpt' => substr($p[3], 0, 150), 'type' => 'product']);
    set_meta($pdo, $gp, $id, '_price', $p[2]);
    set_meta($pdo, $gp, $id, '_regular_price', $p[2]);
    set_meta($pdo, $gp, $id, '_stock_status', 'instock');
    set_meta($pdo, $gp, $id, '_visibility', 'visible');
    if (isset($p[6])) set_meta($pdo, $gp, $id, '_product_attributes', $p[6]);
    set_featured_image($pdo, $gp, $id, $p[5]);
    assign_term($pdo, $gp, $id, $gallery_cats[$p[4]]);
    echo "  + Gallery: {$p[0]} (\${$p[2]})\n";
}

// ════════════════════════════════════════════════════════════════════════════
// HUB BLOG POSTS WITH IMAGES (blog_id = 1)
// ════════════════════════════════════════════════════════════════════════════
$hp = get_prefix(1);
echo "\n--- Updating Hub Posts with Images ---\n";

$post_images = [
    'Preserving Ceremonial Heritage' => 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
    'Artisan Spotlight: Maasai Beadwork' => 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800',
    'The Jane Goodall Museum: A New Chapter' => 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
];

$stmt = $pdo->query("SELECT ID, post_title FROM {$hp}posts WHERE post_type = 'post' AND post_status = 'publish'");
foreach ($stmt->fetchAll() as $post) {
    if (isset($post_images[$post['post_title']])) {
        // Check if already has thumbnail
        $check = $pdo->prepare("SELECT meta_value FROM {$hp}postmeta WHERE post_id = ? AND meta_key = '_thumbnail_id'");
        $check->execute([$post['ID']]);
        if (!$check->fetchColumn()) {
            set_featured_image($pdo, $hp, $post['ID'], $post_images[$post['post_title']]);
            echo "  + Image set for: {$post['post_title']}\n";
        } else {
            echo "  ~ Already has image: {$post['post_title']}\n";
        }
    }
}

// Add more blog posts
$new_posts = [
    ['The Art of Tanzanite: From Mine to Masterpiece', 'art-of-tanzanite', 'Discover the journey of tanzanite from the depths of the Merelani Hills to the display cases of the world\'s finest jewelers. This remarkable gemstone, found only in a small area near Arusha, has captivated collectors since its discovery in 1967.', 'https://images.unsplash.com/photo-1583937443566-6b18c58f4874?w=800'],
    ['Contemporary African Art: Breaking Boundaries', 'contemporary-african-art', 'A new generation of African artists is reshaping the global art scene. From the streets of Dar es Salaam to international galleries, these creators blend traditional techniques with modern themes, challenging perceptions and celebrating African identity.', 'https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?w=800'],
    ['Safari & Culture: A Complete Arusha Experience', 'safari-culture-arusha', 'Arusha, the safari capital of East Africa, offers more than wildlife. Between game drives to Serengeti and Ngorongoro, discover the Cultural Heritage Centre — where art, gemstones, and centuries of African craftsmanship come together under one roof.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
];

foreach ($new_posts as $p) {
    $id = insert_post($pdo, $hp, ['title' => $p[0], 'slug' => $p[1], 'content' => '<p>' . $p[2] . '</p>', 'excerpt' => $p[2], 'type' => 'post']);
    set_featured_image($pdo, $hp, $id, $p[3]);
    echo "  + Post: {$p[0]}\n";
}

echo "\n=== Seeding Complete! ===\n";
echo "Market: " . count($market_products) . " products\n";
echo "Jewelry: " . count($jewelry_products) . " products\n";
echo "Gallery: " . count($gallery_products) . " products\n";
echo "Blog posts updated with images\n";
