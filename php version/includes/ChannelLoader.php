<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/M3uParser.php';

class ChannelLoader
{
    public static function loadAll(): array
    {
        $cacheFile = SIGNAL_CACHE_DIR . '/channels.json';

        if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < SIGNAL_CACHE_TTL) {
            $cached = json_decode(file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $merged = [];
        foreach (SIGNAL_SOURCES as $source) {
            $channels = self::loadSource($source);
            $merged = array_merge($merged, $channels);
        }

        $seen = [];
        $unique = [];
        foreach ($merged as $ch) {
            $key = $ch['country'] . '|' . $ch['name'] . '|' . $ch['url'];
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $unique[] = $ch;
        }

        if (!is_dir(SIGNAL_CACHE_DIR)) {
            mkdir(SIGNAL_CACHE_DIR, 0755, true);
        }
        file_put_contents($cacheFile, json_encode($unique));

        return $unique;
    }

    private static function loadSource(array $source): array
    {
        $cacheFile = SIGNAL_CACHE_DIR . '/source_' . $source['key'] . '.m3u';

        $text = null;
        if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < SIGNAL_CACHE_TTL) {
            $text = file_get_contents($cacheFile);
        }

        if ($text === false || $text === null || $text === '') {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 15,
                    'header' => "User-Agent: SIGNAL-IPTV/1.0\r\n",
                ],
            ]);
            $text = @file_get_contents($source['url'], false, $context);
            if ($text === false) {
                return [];
            }
            if (!is_dir(SIGNAL_CACHE_DIR)) {
                mkdir(SIGNAL_CACHE_DIR, 0755, true);
            }
            file_put_contents($cacheFile, $text);
        }

        return M3uParser::parse($text, $source['key'], $source['label']);
    }
}
