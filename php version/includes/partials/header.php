<nav class="navbar navbar-expand-lg signal-navbar navbar-dark fixed-top" id="signal-navbar">
    <div class="container-fluid" style="max-width: 1440px">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#">
            <span class="logo-dot"></span>
            <div class="d-flex flex-column">
                <span style="line-height: 1.2">SIGNAL</span>
                <small class="font-mono" style="font-size: 0.55rem; color: var(--paper-faint); letter-spacing: 0.1em; font-weight: 500">
                    BD &middot; IN &middot; SPORTS &middot; FIFA+ &mdash; FREE LIVE TV
                </small>
            </div>
        </a>

        <div class="d-flex align-items-center gap-2 order-lg-last">
            <div class="stat-chip d-none d-md-block">
                <b id="total-channels">0</b> channels
            </div>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#signal-navbar-nav" aria-controls="signal-navbar-nav" aria-expanded="false" aria-label="Toggle navigation" style="border-color: var(--line); padding: 0.375rem 0.5rem; font-size: 0.875rem">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>

        <div class="collapse navbar-collapse" id="signal-navbar-nav">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-2 ms-lg-auto mt-2 mt-lg-0">
                <div class="input-group" style="max-width: 460px; min-width: 240px">
                    <span class="input-group-text" style="background: var(--panel); border-color: var(--line); border-right: none; color: var(--paper-dim); padding-left: 0.875rem">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </span>
                    <input type="text" class="form-control signal-form-control" id="search-input" placeholder="Search channels... e.g. ATN, Star Sports, Zee, FIFA" style="border-left: none; padding-left: 0.5rem">
                </div>
                <div class="signal-toggle on" id="reliable-toggle" title="Hide channels that are unlikely to play in a browser" role="button">
                    <span class="sw"></span>
                    <span class="d-none d-sm-inline">Playable only</span>
                    <span class="d-sm-none">Reliable</span>
                </div>
            </div>
        </div>
    </div>
    <div class="load-bar" id="load-bar"><span></span></div>
</nav>
