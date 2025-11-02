<?php
// Simple Open Graph image fetcher with basic safeguards.
// Usage: /api/og-image.php?url=https%3A%2F%2Fexample.com

header('Content-Type: application/json; charset=utf-8');

function bad_request($msg) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

function absolute_url($base, $relative) {
    // If already absolute
    if (preg_match('/^https?:\/\//i', $relative)) return $relative;
    $p = parse_url($base);
    if (!$p || empty($p['scheme']) || empty($p['host'])) return $relative;
    $scheme = $p['scheme'];
    $host = $p['host'];
    $port = isset($p['port']) ? ':' . $p['port'] : '';
    $path = isset($p['path']) ? $p['path'] : '/';
    // If relative starts with /
    if (strpos($relative, '/') === 0) {
        return "$scheme://$host$port$relative";
    }
    // Remove filename from path
    $path = preg_replace('#/[^/]*$#', '/', $path);
    return "$scheme://$host$port$path$relative";
}

function is_disallowed_host($host) {
    $host = strtolower($host);
    if ($host === 'localhost' || $host === '127.0.0.1') return true;
    if (preg_match('/(^|\.)local$/', $host)) return true;
    if (preg_match('/(^|\.)internal$/', $host)) return true;
    // Basic private-range patterns; not exhaustive DNS resolution
    if (preg_match('/(^|\.)10\./', $host)) return true;
    if (preg_match('/(^|\.)192\.168\./', $host)) return true;
    if (preg_match('/(^|\.)172\.(1[6-9]|2[0-9]|3[0-1])\./', $host)) return true;
    return false;
}

function fetch_url($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (ProjectsOG/1.0; +https://potapenko.dev)'
    ]);
    $body = curl_exec($ch);
    $err = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    if ($err) return [null, $status ?: 0, $contentType ?: '', $err];
    return [$body, $status, $contentType ?: '', null];
}

$url = isset($_GET['url']) ? trim($_GET['url']) : '';
if (!$url) bad_request('Missing url');
if (!preg_match('/^https?:\/\//i', $url)) bad_request('Only http/https allowed');
$parts = parse_url($url);
if (!$parts || empty($parts['host'])) bad_request('Invalid URL');
if (is_disallowed_host($parts['host'])) bad_request('Host not allowed');

list($html, $status, $ctype, $err) = fetch_url($url);
if ($err || $status < 200 || $status >= 400 || !$html) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Upstream fetch failed', 'status' => $status]);
    exit;
}

// Very light HTML head parse for meta tags
$image = null;
$baseHref = null;

// Limit to <head> portion if present
if (preg_match('/<head[\s\S]*?<\/head>/i', $html, $m)) {
    $head = $m[0];
} else {
    $head = substr($html, 0, 20000);
}

// Base href
if (preg_match('/<base[^>]*href=["\']([^"\']+)["\'][^>]*>/i', $head, $bm)) {
    $baseHref = $bm[1];
}

$candidates = [];
// og:image
if (preg_match_all('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i', $head, $mm)) {
    $candidates = array_merge($candidates, $mm[1]);
}
// twitter:image
if (preg_match_all('/<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i', $head, $tm)) {
    $candidates = array_merge($candidates, $tm[1]);
}
// link rel icon/apple-touch-icon
if (preg_match_all('/<link[^>]*rel=["\'][^"\']*icon[^"\']*["\'][^>]*href=["\']([^"\']+)["\'][^>]*>/i', $head, $lm)) {
    $candidates = array_merge($candidates, $lm[1]);
}

// Fallback favicon path
if (!$candidates) {
    $origin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
    $candidates[] = $origin . '/favicon.ico';
}

// Resolve to absolute
foreach ($candidates as $cand) {
    if (!$cand) continue;
    $abs = $baseHref ? absolute_url($baseHref, $cand) : absolute_url($url, $cand);
    $image = $abs;
    break;
}

echo json_encode([ 'ok' => true, 'image' => $image ]);
