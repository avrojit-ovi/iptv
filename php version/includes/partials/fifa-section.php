<section class="fifa-banner">
    <div class="container-fluid" style="max-width: 1440px">
        <div class="py-4">
            <span class="font-mono d-block mb-2" style="font-size: 0.6875rem; color: var(--signal-orange); letter-spacing: 0.12em; font-weight: 600">
                FIFA WORLD CUP 2026 &middot; OFFICIAL BROADCASTERS
            </span>
            <h2 class="font-display mb-2" style="font-size: clamp(1.25rem, 3vw, 1.75rem); font-weight: 800; letter-spacing: -0.01em; line-height: 1.2">
                Watch the World Cup, legally and free
            </h2>
            <p style="font-size: 0.8125rem; color: var(--paper-dim); max-width: 640px; line-height: 1.6">
                BTV, Somoy TV and T Sports hold the official Bangladesh broadcast rights for the 2026 World Cup.
                These are their own free live streams — not a third-party rebroadcast.
            </p>

            <div class="row g-3 mt-1">
                <?php foreach (WORLD_CUP_BROADCASTERS as $b): ?>
                <div class="col-md-4">
                    <div class="fifa-card p-3 h-100 d-flex flex-column broadcaster-card"
                         data-name="<?= h($b['name']) ?>"
                         data-embed="<?= h($b['embedUrl']) ?>"
                         data-direct="<?= h($b['directUrl']) ?>">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="font-display" style="font-weight: 800; font-size: 1rem"><?= h($b['name']) ?></span>
                            <span class="font-mono" style="font-size: 0.625rem; color: var(--live-green); border: 1px solid rgba(61,220,132,0.3); padding: 2px 6px; letter-spacing: 0.05em">OFFICIAL</span>
                        </div>
                        <p class="font-mono mb-3 flex-grow-1" style="font-size: 0.6875rem; color: var(--paper-dim); line-height: 1.5"><?= h($b['desc']) ?></p>
                        <div class="font-mono d-flex align-items-center gap-2 mt-auto" style="font-size: 0.6875rem; color: var(--signal-orange); letter-spacing: 0.04em">
                            <span>Watch live</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="pb-4">
            <div class="section-label">FIFA+ FREE STREAMS</div>
            <div class="row g-3">
                <?php foreach (FIFA_PLUS_STREAMS as $stream): ?>
                <div class="col-md-6">
                    <div class="fifa-card p-3 h-100 d-flex flex-column fifa-stream-card"
                         data-name="<?= h($stream['name']) ?>"
                         data-url="<?= h($stream['streamUrl']) ?>"
                         data-region="<?= h($stream['region']) ?>"
                         data-quality="<?= h($stream['quality']) ?>"
                         data-language="<?= h($stream['language']) ?>">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="font-display" style="font-weight: 800; font-size: 1rem"><?= h($stream['name']) ?></span>
                            <div class="d-flex gap-2">
                                <span class="font-mono" style="font-size: 0.625rem; color: var(--live-green); border: 1px solid rgba(61,220,132,0.3); padding: 2px 6px; letter-spacing: 0.05em"><?= h($stream['quality']) ?></span>
                                <span class="font-mono" style="font-size: 0.625rem; color: var(--teal); border: 1px solid rgba(62,138,130,0.35); padding: 2px 6px; letter-spacing: 0.05em"><?= h($stream['language']) ?></span>
                            </div>
                        </div>
                        <p class="font-mono mb-2 flex-grow-1" style="font-size: 0.6875rem; color: var(--paper-dim); line-height: 1.5"><?= h($stream['desc']) ?></p>
                        <div class="font-mono d-flex align-items-center gap-2 mt-auto" style="font-size: 0.6875rem; color: var(--signal-orange); letter-spacing: 0.04em">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span>Play stream</span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="mt-3 p-3" style="background: var(--panel-raised); border: 1px solid var(--line)">
                <p class="font-mono mb-0" style="font-size: 0.6875rem; color: var(--paper-dim); line-height: 1.6">
                    <strong style="color: var(--paper)">FIFA+ on DAZN:</strong>
                    FIFA+ content has moved to DAZN as of June 2026. Matches remain free —
                    create a DAZN account and link your FIFA ID at
                    <a href="https://www.dazn.com" target="_blank" rel="noopener noreferrer" style="color: var(--signal-orange)">dazn.com</a>
                    to access FIFA+ live streams, replays, and archive content.
                </p>
            </div>
        </div>
    </div>
</section>
