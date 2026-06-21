<?php

declare(strict_types=1);

function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function cleanChannelName(string $name): string
{
    $cleaned = preg_replace('/\s*\(\d{3,4}p\)\s*(\[.*\])?\s*$/', '', $name);
    $cleaned = trim($cleaned ?? '');
    return $cleaned !== '' ? $cleaned : $name;
}

function asset(string $path): string
{
    $fullPath = SIGNAL_ROOT . '/assets/' . ltrim($path, '/');
    $version = is_file($fullPath) ? (string) filemtime($fullPath) : '1';
    return 'assets/' . ltrim($path, '/') . '?v=' . $version;
}
