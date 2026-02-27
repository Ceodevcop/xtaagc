<?php
// generate-sitemap.php - Run this script daily via cron

header('Content-Type: text/plain');

$domain = 'https://www.taagc.website';
$pages = [
    '/', '/index.html', '/about.html', '/contact.html', 
    '/investment-opportunities.html', '/how-to-invest.html',
    '/staff.html', '/market-news.html', '/blog/'
];

$sitemap = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($pages as $page) {
    $sitemap .= "  <url>\n";
    $sitemap .= "    <loc>$domain$page</loc>\n";
    $sitemap .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    $sitemap .= "    <changefreq>daily</changefreq>\n";
    $sitemap .= "    <priority>0.8</priority>\n";
    $sitemap .= "  </url>\n";
}

$sitemap .= '</urlset>';

// Save sitemap
file_put_contents('sitemap.xml', $sitemap);
echo "Sitemap generated successfully!\n";
?>
