<?php
/**
 * Seed pages with proper mobile-friendly HTML content
 */
header('Content-Type: text/plain; charset=utf-8');

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
$pdo = new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

function get_prefix($blog_id) { return $blog_id === 1 ? 'wp_' : "wp_{$blog_id}_"; }

function update_page($pdo, $prefix, $slug, $content, $title = null) {
    $stmt = $pdo->prepare("SELECT ID FROM {$prefix}posts WHERE post_name = ? AND post_type = 'page' AND post_status = 'publish' LIMIT 1");
    $stmt->execute([$slug]);
    $id = $stmt->fetchColumn();
    if ($id) {
        $sql = "UPDATE {$prefix}posts SET post_content = ?";
        $params = [$content];
        if ($title) { $sql .= ", post_title = ?"; $params[] = $title; }
        $sql .= " WHERE ID = ?";
        $params[] = $id;
        $pdo->prepare($sql)->execute($params);
        echo "  Updated: $slug (ID: $id)\n";
    } else {
        $pdo->prepare("INSERT INTO {$prefix}posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, post_type, post_modified, post_modified_gmt, comment_status, ping_status, to_ping, pinged, post_content_filtered) VALUES (1, NOW(), UTC_TIMESTAMP(), ?, ?, '', 'publish', ?, 'page', NOW(), UTC_TIMESTAMP(), 'closed', 'closed', '', '', '')")
            ->execute([$content, $title ?? ucfirst(str_replace('-', ' ', $slug)), $slug]);
        echo "  Created: $slug\n";
    }
}

echo "=== Seeding Pages with Content ===\n\n";

// ── HUB PAGES (blog_id = 1) ─────────────────────────────────────────────
$hp = get_prefix(1);
echo "--- Hub Pages ---\n";

update_page($pdo, $hp, 'about', '
<h2>East Africa\'s Premier Cultural Destination</h2>
<p>Since 1994, the Cultural Heritage Centre has stood as a beacon of African art, culture, and craftsmanship on Dodoma Road in Arusha, Tanzania — the gateway to the Serengeti, Ngorongoro Crater, and Mount Kilimanjaro.</p>

<p>What began as a small gallery has grown into a sprawling cultural campus that welcomes over 100,000 visitors annually from around the world. The Centre houses four distinct divisions, each celebrating a different facet of East African heritage.</p>

<h2>Our Divisions</h2>

<h3>The Market — Handcrafts & Artifacts</h3>
<p>Browse thousands of handcrafted items from across the African continent: Makonde carvings, Maasai beadwork, traditional textiles, spices from Zanzibar, and one-of-a-kind artifacts that tell the story of Africa\'s diverse cultures.</p>

<h3>The Vault — Tanzanite & Fine Jewelry</h3>
<p>Home to one of the world\'s finest collections of tanzanite — the rare gemstone found only within a few square kilometers near Arusha. Our master jewelers create bespoke pieces using ethically sourced stones with full certification.</p>

<h3>The Art Gallery</h3>
<p>Three exhibition halls showcase contemporary and traditional African art, from emerging Tanzanian painters to established masters. Our rotating exhibitions bring fresh perspectives on African identity, nature, and heritage throughout the year.</p>

<h2>Our Mission</h2>
<p>To preserve, celebrate, and share Africa\'s cultural heritage with the world — creating economic opportunities for local artisans while educating visitors about the rich traditions that define this remarkable continent.</p>

<h2>Visit Us</h2>
<p><strong>Address:</strong> Dodoma Road, Arusha, Tanzania</p>
<p><strong>Hours:</strong> Monday–Saturday 8:00 AM – 8:00 PM, Sunday 10:00 AM – 7:00 PM</p>
<p><strong>Phone:</strong> +255 786 454 999</p>
', 'About Cultural Heritage Centre');

update_page($pdo, $hp, 'our-legacy', '
<h2>Three Decades of Cultural Preservation</h2>
<p>Founded in 1994, the Cultural Heritage Centre was born from a vision to create a space where Africa\'s artistic traditions could be preserved, celebrated, and shared with the world.</p>

<p>In the early years, a small collection of Makonde carvings and Tingatinga paintings formed the nucleus of what would become East Africa\'s most comprehensive cultural centre. Word spread among safari-goers, and soon the Centre became an essential stop on the Northern Tanzania circuit.</p>

<h2>Milestones</h2>
<p><strong>1994</strong> — Cultural Heritage Centre opens on Dodoma Road, Arusha</p>
<p><strong>1998</strong> — The Vault tanzanite gallery established</p>
<p><strong>2003</strong> — Art Gallery expanded to three exhibition halls</p>
<p><strong>2008</strong> — The Market grows to feature artisans from 15 African nations</p>
<p><strong>2015</strong> — Jane Goodall roots & shoots museum opens on campus</p>
<p><strong>2020</strong> — Digital transformation begins with online collections</p>
<p><strong>2024</strong> — 30th anniversary celebrations; mobile app launched</p>

<h2>Impact</h2>
<p>Over three decades, the Cultural Heritage Centre has directly supported over 2,000 artisans across East Africa, provided cultural education to hundreds of thousands of visitors, and helped establish Arusha as a cultural destination alongside its fame as a safari gateway.</p>
', 'Our Legacy');

update_page($pdo, $hp, 'visit', '
<h2>Plan Your Visit</h2>
<p>The Cultural Heritage Centre is located on Dodoma Road in Arusha, just 10 minutes from the city centre and 45 minutes from Kilimanjaro International Airport.</p>

<h3>Getting Here</h3>
<p><strong>From Arusha City:</strong> Head west on Dodoma Road. The Centre is on the right-hand side, approximately 3km from the Clock Tower.</p>
<p><strong>From KIA Airport:</strong> Take the main highway towards Arusha. Turn right onto Dodoma Road at the roundabout. Total drive time: approximately 45 minutes.</p>
<p><strong>From Safari Lodges:</strong> Most safari operators include a Cultural Heritage visit as part of their Arusha day itinerary. Ask your guide!</p>

<h3>Opening Hours</h3>
<p><strong>Monday – Saturday:</strong> 8:00 AM – 8:00 PM</p>
<p><strong>Sunday:</strong> 10:00 AM – 7:00 PM</p>
<p><strong>Public Holidays:</strong> 10:00 AM – 6:00 PM</p>

<h3>Admission</h3>
<p>Entry to the Cultural Heritage Centre is <strong>free</strong>. Exhibition tickets may apply for special gallery shows — check the Gallery tab for current exhibitions.</p>

<h3>What to Expect</h3>
<p>Allow at least 2 hours to explore all four divisions. Our knowledgeable staff can guide you through the collections and help you find the perfect piece. Complimentary tea and coffee are available in the courtyard.</p>

<h3>Contact</h3>
<p><strong>Phone:</strong> +255 786 454 999</p>
<p><strong>Email:</strong> info@culturalheritage.co.tz</p>
<p><strong>WhatsApp:</strong> +255 786 454 999</p>
', 'Plan Your Visit');

update_page($pdo, $hp, 'newsletter', '
<h2>The Cultural Heritage Letter</h2>
<p>Stay connected with East Africa\'s premier cultural destination. Our monthly newsletter brings you:</p>

<ul>
<li><strong>New arrivals</strong> — Be the first to know about rare artifacts, gemstones, and artworks</li>
<li><strong>Exhibition previews</strong> — Get early access to gallery openings and artist talks</li>
<li><strong>Artisan stories</strong> — Meet the craftspeople behind our collections</li>
<li><strong>Special offers</strong> — Exclusive discounts for subscribers</li>
<li><strong>Cultural insights</strong> — Deep dives into African art, history, and traditions</li>
</ul>

<p>To subscribe, send us a WhatsApp message at +255 786 454 999 or visit us at the Centre.</p>
', 'The Cultural Heritage Letter');

// ── MARKET PAGES (blog_id = 2) ──────────────────────────────────────────
$mp = get_prefix(2);
echo "\n--- Market Pages ---\n";

update_page($pdo, $mp, 'about', '
<h2>The Market — Handcrafts & Artifacts</h2>
<p>The Market at Cultural Heritage Centre is East Africa\'s most comprehensive collection of handcrafted goods, featuring work from artisans across 15 African nations.</p>

<p>From intricately carved Makonde sculptures to vibrant Kitenge textiles, aromatic Zanzibar spices to hand-beaded Maasai jewelry — every item tells a story of tradition, skill, and cultural pride.</p>

<h3>What You\'ll Find</h3>
<ul>
<li><strong>Wood Carvings:</strong> Makonde, Ujamaa, and figurative sculptures</li>
<li><strong>Textiles:</strong> Kanga, Kitenge, and hand-woven baskets</li>
<li><strong>Spices & Oils:</strong> Zanzibar spice sets, baobab oil, coffee</li>
<li><strong>Beadwork:</strong> Maasai collars, bracelets, and ceremonial pieces</li>
<li><strong>Masks:</strong> Ceremonial masks from across West and East Africa</li>
</ul>

<p>Every purchase directly supports the artisan communities who create these works.</p>
', 'About The Market');

update_page($pdo, $mp, 'contact', '
<h2>Contact The Market</h2>
<p><strong>Location:</strong> Cultural Heritage Centre, Dodoma Road, Arusha</p>
<p><strong>Phone:</strong> +255 786 454 999</p>
<p><strong>WhatsApp:</strong> +255 786 454 999</p>
<p><strong>Hours:</strong> Mon–Sat 8am–8pm, Sun 10am–7pm</p>
<p>For bulk orders, custom commissions, or wholesale enquiries, please contact us via WhatsApp.</p>
', 'Contact The Market');

// ── JEWELRY PAGES (blog_id = 3) ─────────────────────────────────────────
$jp = get_prefix(3);
echo "\n--- Jewelry Pages ---\n";

update_page($pdo, $jp, 'about', '
<h2>The Vault — Tanzanite & Fine Jewelry</h2>
<p>The Vault is home to one of the world\'s most extraordinary collections of tanzanite — the rare violet-blue gemstone found only in a small mining area near Arusha, Tanzania.</p>

<p>Our master gemologists hand-select every stone for exceptional color, clarity, and cut. Each piece comes with a certificate of authenticity from the Tanzanite Foundation.</p>

<h3>Our Collections</h3>
<ul>
<li><strong>Tanzanite:</strong> Loose stones and finished jewelry in AAA to AAAA grade</li>
<li><strong>Tsavorite:</strong> Rare green garnet from the Merelani Hills</li>
<li><strong>Ruby & Sapphire:</strong> East African precious stones</li>
<li><strong>Custom Design:</strong> Bespoke pieces crafted to your specifications</li>
</ul>

<h3>Private Consultations</h3>
<p>Book a private viewing with our gemologists. We offer complimentary consultations for serious collectors and those seeking the perfect engagement ring or heirloom piece.</p>

<p><strong>WhatsApp:</strong> +255 786 454 999 to book your appointment.</p>
', 'About The Vault');

// ── GALLERY PAGES (blog_id = 4) ─────────────────────────────────────────
$gp = get_prefix(4);
echo "\n--- Gallery Pages ---\n";

update_page($pdo, $gp, 'about', '
<h2>The Art Gallery</h2>
<p>Three exhibition halls showcase the finest contemporary and traditional African art. From emerging Tanzanian painters to internationally acclaimed sculptors, our curated exhibitions celebrate the breadth and depth of African artistic expression.</p>

<h3>Current Focus Areas</h3>
<ul>
<li><strong>Contemporary African Painting:</strong> Bold works that challenge and inspire</li>
<li><strong>Tingatinga Art:</strong> Tanzania\'s iconic art movement, celebrating 60+ years</li>
<li><strong>Sculpture:</strong> Bronze, stone, and wood works from across the continent</li>
<li><strong>Photography:</strong> Documentary and fine art photography of African life</li>
<li><strong>Limited Edition Prints:</strong> Signed giclée prints from our collection</li>
</ul>

<h3>For Collectors</h3>
<p>We offer acquisition advisory services, framing, and international shipping. All artworks come with certificates of authenticity and provenance documentation.</p>

<p>Gallery visits are free. Special exhibition tickets may apply — check the Exhibitions section for details.</p>
', 'About The Art Gallery');

echo "\n=== Page Seeding Complete! ===\n";
