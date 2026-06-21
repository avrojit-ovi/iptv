/**
 * SIGNAL — Main application logic
 */
(function () {
  'use strict';

  const config = window.SIGNAL_CONFIG || {};
  const SOURCES = config.sources || [];

  let allChannels = [];
  let activeCountry = 'all';
  let activeCategory = 'all';
  let reliableOnly = true;
  let searchValue = '';
  let searchTimer = null;
  let selectedChannel = null;
  let player = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function cleanName(name) {
    return name.replace(/\s*\(\d{3,4}p\)\s*(\[.*\])?\s*$/, '').trim() || name;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getBaseList() {
    return reliableOnly ? allChannels.filter((c) => c.isHttps) : allChannels;
  }

  function getTabCounts(baseList) {
    return {
      all: baseList.length,
      bd: baseList.filter((c) => c.country === 'bd').length,
      in: baseList.filter((c) => c.country === 'in').length,
      sports: baseList.filter((c) => c.country === 'sports').length,
    };
  }

  function getActiveList(baseList) {
    let list = baseList;
    if (activeCountry !== 'all') {
      list = list.filter((c) => c.country === activeCountry);
    }
    if (activeCountry === 'sports') {
      list = [...list].sort((a, b) => {
        const score = (ch) => (/\.(in|bd)@/i.test(ch.tvgId || '') ? 0 : 1);
        return score(a) - score(b);
      });
    }
    return list;
  }

  function getCategories(activeList) {
    const cats = new Set();
    activeList.forEach((c) => cats.add(c.group || 'General'));
    return Array.from(cats).sort();
  }

  function getFilteredList(activeList) {
    let list = activeList;
    if (activeCategory !== 'all') {
      list = list.filter((c) => (c.group || 'General') === activeCategory);
    }
    const q = searchValue.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }

  function getCountryName() {
    if (activeCountry === 'all') return 'All Channels';
    const src = SOURCES.find((s) => s.key === activeCountry);
    return src ? src.label : 'Channels';
  }

  function renderChannelCard(ch, idx) {
    const displayName = cleanName(ch.name);
    const isHd = /1080|720/.test(ch.quality || '');
    const logoHtml = ch.logo
      ? `<img src="${escapeHtml(ch.logo)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallbackDisplay = ch.logo ? 'none' : 'flex';

    return `
      <div class="col-6 col-sm-4 col-md-3 col-lg-2">
        <div class="channel-card rounded-0" data-idx="${idx}"
             data-name="${escapeHtml(ch.name)}"
             data-url="${escapeHtml(ch.url)}"
             data-country="${escapeHtml(ch.countryLabel)}"
             data-group="${escapeHtml(ch.group || 'General')}"
             data-https="${ch.isHttps ? '1' : '0'}">
          <div class="d-flex align-items-center justify-content-between px-2 pt-2">
            <span class="font-mono" style="font-size:0.625rem;color:var(--paper-faint);letter-spacing:0.05em">CH ${String(idx + 1).padStart(3, '0')}</span>
            ${ch.quality ? `<span class="quality-badge${isHd ? ' hd' : ''}">${escapeHtml(ch.quality)}</span>` : ''}
          </div>
          <div class="card-logo-wrap mx-2 my-2">
            ${logoHtml}
            <div class="ch-name" style="display:${fallbackDisplay};align-items:center;justify-content:center;height:100%;font-size:0.75rem;color:var(--paper-dim);text-align:center;padding:0 0.5rem">${escapeHtml(displayName)}</div>
          </div>
          <div class="pt-1 pb-2 px-2">
            <div class="ch-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</div>
            <div class="ch-meta d-flex justify-content-between mt-1">
              <span>${escapeHtml(ch.group || 'General')}</span>
              <span>${escapeHtml(ch.countryLabel)}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderCategories(categories) {
    const rail = $('#category-rail');
    if (!rail) return;
    let html = '<button type="button" class="cat-chip' + (activeCategory === 'all' ? ' active' : '') + '" data-category="all">ALL CATEGORIES</button>';
    categories.forEach((cat) => {
      html += `<button type="button" class="cat-chip${activeCategory === cat ? ' active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat.toUpperCase())}</button>`;
    });
    rail.innerHTML = html;
    bindCategoryEvents();
  }

  function updateTabCounts(counts) {
    $$('.tab-count').forEach((el) => {
      const key = el.dataset.countKey;
      if (key && counts[key] !== undefined) {
        el.textContent = counts[key];
      }
    });
  }

  function render() {
    const baseList = getBaseList();
    const counts = getTabCounts(baseList);
    const activeList = getActiveList(baseList);
    const categories = getCategories(activeList);
    const filteredList = getFilteredList(activeList);

    updateTabCounts(counts);
    $('#total-channels').textContent = baseList.length;

    renderCategories(categories);

    const label = getCountryName();
    $('#section-label').textContent = `${label.toUpperCase()} (${filteredList.length})`;

    const grid = $('#channel-grid');
    if (!grid) return;

    if (filteredList.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <div class="big">No channels found</div>
            <span>Try a different search term, or switch off "Playable only" to see more channels.</span>
          </div>
        </div>`;
    } else {
      grid.innerHTML = filteredList.map((ch, idx) => renderChannelCard(ch, idx)).join('');
      bindChannelEvents();
    }
  }

  function bindChannelEvents() {
    $$('.channel-card').forEach((card) => {
      card.addEventListener('click', () => {
        openPlayer({
          name: card.dataset.name,
          url: card.dataset.url,
          countryLabel: card.dataset.country,
          group: card.dataset.group,
          isHttps: card.dataset.https === '1',
        });
      });
    });
  }

  function bindCategoryEvents() {
    $$('#category-rail .cat-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        $$('#category-rail .cat-chip').forEach((b) => b.classList.toggle('active', b === btn));
        render();
      });
    });
  }

  function bindCountryTabs() {
    $$('#country-tabs .cat-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCountry = btn.dataset.country;
        activeCategory = 'all';
        $$('#country-tabs .cat-chip').forEach((b) => b.classList.toggle('active', b === btn));
        render();
      });
    });
  }

  function updatePlayerUI(state) {
    const loading = $('#video-loading');
    const error = $('#video-error');
    const controls = $('#player-controls');
    const progressFilled = $('#progress-filled');
    const timeDisplay = $('#time-display');
    const iconPlay = $('#icon-play');
    const volumeSlider = $('#volume-slider');

    if (loading) loading.classList.toggle('d-none', !state.isLoading);
    if (error) error.classList.toggle('d-none', !state.hasError);
    if ($('#error-msg')) $('#error-msg').textContent = state.errorMsg || '';

    if (controls) controls.classList.toggle('show', state.showControls);

    const pct = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    if (progressFilled) progressFilled.style.width = pct + '%';
    if (timeDisplay && player) {
      timeDisplay.textContent = `${player.formatTime(state.currentTime)} / ${player.formatTime(state.duration)}`;
    }
    if (volumeSlider) volumeSlider.value = state.isMuted ? 0 : state.volume;

    if (iconPlay) {
      iconPlay.innerHTML = state.isPlaying
        ? '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>'
        : '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }

    updateVolumeIcon(state);
    updateFullscreenIcon(state.isFullscreen);
  }

  function updateVolumeIcon(state) {
    const icon = $('#icon-volume');
    if (!icon) return;
    if (state.isMuted || state.volume === 0) {
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
    } else if (state.volume < 0.5) {
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
    } else {
      icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
    }
  }

  function updateFullscreenIcon(isFs) {
    const icon = $('#icon-fullscreen');
    if (!icon) return;
    icon.innerHTML = isFs
      ? '<path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>'
      : '<path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path>';
  }

  function openPlayer(channel) {
    selectedChannel = channel;
    const overlay = $('#player-overlay');
    if (!overlay) return;

    const displayName = cleanName(channel.name);
    $('#player-title').textContent = displayName;
    $('#player-country').textContent = channel.countryLabel || channel.region || '';
    $('#player-group').textContent = channel.group || (channel.language ? `FIFA+ · ${channel.language}` : '');
    $('#player-proto').textContent = channel.isHttps !== undefined
      ? (channel.isHttps ? 'SECURE STREAM' : 'INSECURE STREAM (MAY FAIL)')
      : (channel.quality ? `${channel.quality.toUpperCase()} · HLS` : 'HLS STREAM');

    overlay.classList.remove('d-none');

    const url = channel.streamUrl || channel.url;
    if (player && url) {
      player.loadStream(url);
    }
  }

  function closePlayer() {
    const overlay = $('#player-overlay');
    if (overlay) overlay.classList.add('d-none');
    if (player) player.destroyHls();
    selectedChannel = null;
  }

  function openBroadcaster(name, embedUrl, directUrl) {
    const overlay = $('#broadcaster-overlay');
    if (!overlay) return;
    $('#broadcaster-title').textContent = name + ' — Live';
    $('#broadcaster-iframe').src = embedUrl;
    $('#broadcaster-direct-link').href = directUrl;
    overlay.classList.remove('d-none');
  }

  function closeBroadcaster() {
    const overlay = $('#broadcaster-overlay');
    if (overlay) overlay.classList.add('d-none');
    $('#broadcaster-iframe').src = '';
  }

  function initPlayer() {
    const video = $('#video-player');
    if (!video) return;

    player = new HlsPlayer({
      video,
      progressBar: $('#progress-bar'),
      onStateChange: updatePlayerUI,
    });

    $('#btn-play')?.addEventListener('click', (e) => { e.stopPropagation(); player.togglePlay(); });
    $('#btn-mute')?.addEventListener('click', (e) => { e.stopPropagation(); player.toggleMute(); });
    $('#btn-fullscreen')?.addEventListener('click', (e) => { e.stopPropagation(); player.toggleFullscreen(); });
    $('#btn-pip')?.addEventListener('click', (e) => { e.stopPropagation(); player.togglePiP(); });
    $('#volume-slider')?.addEventListener('input', (e) => {
      e.stopPropagation();
      player.setVolumeLevel(parseFloat(e.target.value));
    });
    $('#retry-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedChannel) {
        const url = selectedChannel.streamUrl || selectedChannel.url;
        if (url) player.loadStream(url);
      }
    });

    const videoWrap = $('#video-wrap');
    videoWrap?.addEventListener('mousemove', () => player.showControlsTemporarily());
    videoWrap?.addEventListener('click', () => {
      if (!player.showControls) {
        player.showControlsTemporarily();
      } else {
        player.togglePlay();
      }
    });

    $('#player-close')?.addEventListener('click', closePlayer);
    $('#player-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closePlayer();
    });

    $('#broadcaster-close')?.addEventListener('click', closeBroadcaster);
    $('#broadcaster-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeBroadcaster();
    });

    document.addEventListener('keydown', (e) => {
      const playerOpen = !$('#player-overlay')?.classList.contains('d-none');
      if (!playerOpen) return;
      switch (e.key) {
        case 'Escape': closePlayer(); break;
        case ' ':
          e.preventDefault();
          player.togglePlay();
          break;
        case 'ArrowRight':
          player.seek(player.currentTime + 10);
          break;
        case 'ArrowLeft':
          player.seek(Math.max(0, player.currentTime - 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          player.setVolumeLevel(Math.min(1, player.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          player.setVolumeLevel(Math.max(0, player.volume - 0.1));
          break;
        case 'f':
          player.toggleFullscreen();
          break;
        case 'm':
          player.toggleMute();
          break;
      }
    });
  }

  function initFifaSection() {
    $$('.fifa-stream-card').forEach((card) => {
      card.addEventListener('click', () => {
        openPlayer({
          name: card.dataset.name,
          streamUrl: card.dataset.url,
          region: card.dataset.region,
          quality: card.dataset.quality,
          language: card.dataset.language,
        });
      });
    });

    $$('.broadcaster-card').forEach((card) => {
      card.addEventListener('click', () => {
        openBroadcaster(card.dataset.name, card.dataset.embed, card.dataset.direct);
      });
    });
  }

  async function loadChannels() {
    const loadBar = $('#load-bar');
    try {
      const res = await fetch(config.apiUrl || 'api/channels.php', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.channels)) {
        allChannels = data.channels;
      }
    } catch (err) {
      console.warn('Failed to load channels', err);
    } finally {
      if (loadBar) loadBar.classList.add('done');
      render();
    }
  }

  function initSearch() {
    const input = $('#search-input');
    input?.addEventListener('input', (e) => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchValue = e.target.value;
        render();
      }, 180);
    });
  }

  function initToggle() {
    const toggle = $('#reliable-toggle');
    toggle?.addEventListener('click', () => {
      reliableOnly = !reliableOnly;
      toggle.classList.toggle('on', reliableOnly);
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindCountryTabs();
    initSearch();
    initToggle();
    initPlayer();
    initFifaSection();
    loadChannels();
  });
})();
