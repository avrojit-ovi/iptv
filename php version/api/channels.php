<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/ChannelLoader.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

try {
    $channels = ChannelLoader::loadAll();
    echo json_encode([
        'success' => true,
        'count' => count($channels),
        'channels' => $channels,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load channels',
    ]);
}
