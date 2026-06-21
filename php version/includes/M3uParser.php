<?php

declare(strict_types=1);

class M3uParser
{
    public static function parse(string $text, string $countryKey, string $countryLabel): array
    {
        $lines = preg_split('/\r?\n/', $text);
        $channels = [];
        $current = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            if (str_starts_with($line, '#EXTINF')) {
                preg_match('/tvg-logo="([^"]*)"/', $line, $logoMatch);
                preg_match('/group-title="([^"]*)"/', $line, $groupMatch);
                preg_match('/tvg-id="([^"]*)"/', $line, $idMatch);
                preg_match('/,(.*)$/', $line, $nameMatch);

                $rawName = isset($nameMatch[1]) ? trim($nameMatch[1]) : 'Unknown Channel';
                $quality = '';
                if (preg_match('/\((\d{3,4}p)\)\s*(\[.*\])?$/', $rawName, $qMatch)) {
                    $quality = $qMatch[1];
                }

                $group = 'General';
                if (!empty($groupMatch[1])) {
                    $group = explode(';', $groupMatch[1])[0];
                }

                $current = [
                    'name' => $rawName,
                    'logo' => $logoMatch[1] ?? '',
                    'group' => $group,
                    'tvgId' => $idMatch[1] ?? '',
                    'quality' => $quality,
                    'country' => $countryKey,
                    'countryLabel' => $countryLabel,
                    'url' => '',
                    'isHttps' => false,
                ];
            } elseif (str_starts_with($line, '#EXTVLCOPT') || str_starts_with($line, '#EXT-X')) {
                continue;
            } elseif (!str_starts_with($line, '#') && $current !== null) {
                $current['url'] = $line;
                $current['isHttps'] = str_starts_with($line, 'https://');
                $channels[] = $current;
                $current = null;
            }
        }

        return $channels;
    }
}
