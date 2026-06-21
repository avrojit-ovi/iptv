<?php require_once __DIR__ . '/bootstrap.php'; ?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIGNAL — Bangladesh, India &amp; Sports Live TV</title>
    <meta name="description" content="Free live TV streaming — Bangladesh, India, Sports channels and FIFA+ in one place.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="<?= h(asset('css/style.css')) ?>" rel="stylesheet">
</head>
<body>

<div class="min-vh-100" style="padding-top: 72px" id="app">

    <?php include __DIR__ . '/includes/partials/header.php'; ?>
    <?php include __DIR__ . '/includes/partials/fifa-section.php'; ?>

    <!-- Country Tabs -->
    <div class="container-fluid" style="max-width: 1440px">
        <div class="d-flex flex-wrap gap-2 py-3" id="country-tabs">
            <?php foreach (SIGNAL_TABS as $tab): ?>
            <button type="button" class="cat-chip<?= $tab['key'] === 'all' ? ' active' : '' ?>" data-country="<?= h($tab['key']) ?>">
                <?= h($tab['label']) ?>
                <span class="ms-1 tab-count" data-count-key="<?= h($tab['key']) ?>">0</span>
            </button>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Category Rail -->
    <div class="container-fluid" style="max-width: 1440px">
        <div class="d-flex flex-wrap gap-2 pb-3" id="category-rail">
            <button type="button" class="cat-chip active" data-category="all">ALL CATEGORIES</button>
        </div>
    </div>

    <!-- Channel Grid -->
    <main class="container-fluid pb-5" style="max-width: 1440px">
        <div class="section-label" id="section-label">ALL CHANNELS (0)</div>
        <div class="row g-2" id="channel-grid">
            <?php for ($i = 0; $i < 12; $i++): ?>
            <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                <div class="skeleton-card"></div>
            </div>
            <?php endfor; ?>
        </div>
    </main>

    <?php include __DIR__ . '/includes/partials/footer.php'; ?>

    <!-- Video Player Modal -->
    <div class="player-overlay d-none" id="player-overlay">
        <div class="player-box">
            <div class="player-head">
                <span class="live-tag"><span class="blob"></span> LIVE</span>
                <h3 class="player-title" id="player-title"></h3>
                <button type="button" class="close-btn" id="player-close" aria-label="Close player">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="video-wrap" id="video-wrap">
                <video id="video-player" playsinline></video>
                <div class="video-status d-none" id="video-loading">
                    <div class="spinner"></div>
                    <span>Connecting to stream...</span>
                </div>
                <div class="video-status d-none" id="video-error">
                    <div class="err-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <span id="error-msg"></span>
                    <button type="button" class="retry-btn" id="retry-btn">Retry</button>
                </div>
                <div class="player-controls" id="player-controls">
                    <div class="progress-bar-container" id="progress-bar">
                        <div class="progress-bar-filled" id="progress-filled"></div>
                    </div>
                    <div class="controls-row">
                        <div class="controls-left">
                            <button type="button" class="ctrl-btn" id="btn-play" aria-label="Play">
                                <svg viewBox="0 0 24 24" fill="currentColor" id="icon-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </button>
                            <div class="volume-container">
                                <button type="button" class="ctrl-btn" id="btn-mute" aria-label="Mute">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="icon-volume"></svg>
                                </button>
                                <input type="range" min="0" max="1" step="0.01" value="1" class="volume-slider" id="volume-slider" aria-label="Volume">
                            </div>
                            <span class="time-display" id="time-display">0:00 / 0:00</span>
                        </div>
                        <div class="controls-right">
                            <button type="button" class="ctrl-btn" id="btn-pip" aria-label="Picture in Picture">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                    <rect x="10" y="10" width="8" height="6" rx="1"></rect>
                                </svg>
                            </button>
                            <button type="button" class="ctrl-btn" id="btn-fullscreen" aria-label="Fullscreen">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="icon-fullscreen"></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="player-foot">
                <span id="player-country"></span>
                <span id="player-group"></span>
                <span id="player-proto"></span>
            </div>
        </div>
    </div>

    <!-- Broadcaster Modal -->
    <div class="player-overlay d-none" id="broadcaster-overlay">
        <div class="player-box">
            <div class="player-head">
                <span class="live-tag"><span class="blob"></span> LIVE</span>
                <h3 class="player-title" id="broadcaster-title"></h3>
                <button type="button" class="close-btn" id="broadcaster-close" aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="video-wrap" style="min-height: 400px">
                <iframe id="broadcaster-iframe" allow="autoplay; fullscreen; encrypted-media" allowfullscreen referrerpolicy="no-referrer-when-downgrade" style="width:100%;height:100%;border:0;position:absolute;inset:0" title="Broadcaster"></iframe>
                <div class="video-status" style="position:absolute;bottom:0;left:0;right:0;top:auto;background:linear-gradient(0deg,rgba(0,0,0,0.85),transparent);padding:0.875rem;flex-direction:row;justify-content:center;gap:0.625rem">
                    <span style="font-size:0.6875rem">Player not loading?</span>
                    <a href="#" id="broadcaster-direct-link" target="_blank" rel="noopener noreferrer" style="color:var(--signal-orange);border:1px solid var(--signal-orange);padding:4px 12px;font-size:0.6875rem;font-family:var(--font-mono);text-decoration:none">Open official site &rarr;</a>
                </div>
            </div>
            <div class="player-foot">
                <span>Bangladesh</span>
                <span>FIFA World Cup 2026 &middot; Official</span>
                <span>OFFICIAL BROADCASTER</span>
            </div>
        </div>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
<script>
window.SIGNAL_CONFIG = {
    apiUrl: 'api/channels.php',
    sources: <?= json_encode(SIGNAL_SOURCES, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
    fifaStreams: <?= json_encode(FIFA_PLUS_STREAMS, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>,
    broadcasters: <?= json_encode(WORLD_CUP_BROADCASTERS, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
};
</script>
<script src="<?= h(asset('js/hls-player.js')) ?>"></script>
<script src="<?= h(asset('js/app.js')) ?>"></script>
</body>
</html>
