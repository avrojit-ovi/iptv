<?php

declare(strict_types=1);

define('SIGNAL_ROOT', dirname(__DIR__));
define('SIGNAL_CACHE_DIR', SIGNAL_ROOT . '/cache');
define('SIGNAL_CACHE_TTL', 3600); // 1 hour

const SIGNAL_SOURCES = [
    ['key' => 'bd', 'url' => 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/bd.m3u', 'label' => 'Bangladesh'],
    ['key' => 'in', 'url' => 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/in.m3u', 'label' => 'India'],
    ['key' => 'sports', 'url' => 'https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/categories/sports.m3u', 'label' => 'Sports'],
];

const SIGNAL_TABS = [
    ['key' => 'all', 'label' => 'All'],
    ['key' => 'bd', 'label' => 'Bangladesh'],
    ['key' => 'in', 'label' => 'India'],
    ['key' => 'sports', 'label' => 'Sports'],
];

const FIFA_PLUS_STREAMS = [
    [
        'name' => 'FIFA+ (EU/UK)',
        'region' => 'Europe / UK',
        'desc' => 'Official FIFA+ English stream via Rakuten — 720p HLS. Covers FIFA tournaments, archive matches, and original content.',
        'streamUrl' => 'https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8',
        'quality' => '720p',
        'language' => 'English',
    ],
    [
        'name' => 'FIFA+ (United States)',
        'region' => 'United States',
        'desc' => 'Official FIFA+ US stream via Samsung TV Plus — 720p HLS. Live matches, replays, and FIFA original programming.',
        'streamUrl' => 'https://d2w9q46ikgrcwx.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-of5cbk3sav3w5/v1/sysdata_s_p_a_fifa_7/samsungheadend_us/latest/main/hls/playlist.m3u8',
        'quality' => '720p',
        'language' => 'English',
    ],
];

const WORLD_CUP_BROADCASTERS = [
    [
        'name' => 'BTV',
        'desc' => 'State broadcaster — official FIFA rights holder for Bangladesh. Free live stream of World Cup matches.',
        'embedUrl' => 'https://www.btvlive.gov.bd/channel/BTV',
        'directUrl' => 'https://www.btvlive.gov.bd/channel/BTV',
    ],
    [
        'name' => 'T Sports',
        'desc' => 'Part of the BD broadcast consortium with BTV and Somoy TV. Official World Cup broadcaster.',
        'embedUrl' => 'https://www.tsports.com/live-tv',
        'directUrl' => 'https://www.tsports.com/live-tv',
    ],
    [
        'name' => 'Somoy TV',
        'desc' => 'Part of the BD broadcast consortium with BTV and T Sports. Official World Cup broadcaster.',
        'embedUrl' => 'https://www.somoynews.tv/tv',
        'directUrl' => 'https://www.somoynews.tv/tv',
    ],
];
