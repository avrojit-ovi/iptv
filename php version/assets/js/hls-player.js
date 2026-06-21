/**
 * HLS Video Player — vanilla JS port of useHlsPlayer hook
 */
class HlsPlayer {
  constructor(options) {
    this.video = options.video;
    this.onStateChange = options.onStateChange || (() => {});

    this.hls = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.isMuted = false;
    this.isFullscreen = false;
    this.isLoading = false;
    this.hasError = false;
    this.errorMsg = '';
    this.showControls = false;
    this.currentUrl = '';

    this.controlsTimeout = null;
    this.failSafetyTimer = null;
    this.isDragging = false;

    this._bindVideoEvents();
    this._bindControls(options);
  }

  _emit() {
    this.onStateChange({
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isFullscreen: this.isFullscreen,
      isLoading: this.isLoading,
      hasError: this.hasError,
      errorMsg: this.errorMsg,
      showControls: this.showControls,
    });
  }

  formatTime(time) {
    if (!isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.failSafetyTimer) {
      clearTimeout(this.failSafetyTimer);
      this.failSafetyTimer = null;
    }
  }

  loadStream(url) {
    this.currentUrl = url;
    this.destroyHls();

    this.video.removeAttribute('src');
    this.video.load();

    this.isLoading = true;
    this.hasError = false;
    this.errorMsg = '';
    this.currentTime = 0;
    this.duration = 0;
    this._emit();

    this.failSafetyTimer = setTimeout(() => {
      this.isLoading = false;
      this.hasError = true;
      this.errorMsg = 'Stream is taking too long to respond. The source server may be offline.';
      this._emit();
    }, 15000);

    const clearFailTimer = () => {
      if (this.failSafetyTimer) {
        clearTimeout(this.failSafetyTimer);
        this.failSafetyTimer = null;
      }
    };

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      this.hls = new Hls({
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 2,
        manifestLoadingTimeOut: 12000,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 12000,
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearFailTimer();
        this.isLoading = false;
        this._emit();
        this.video.play().catch(() => {});
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          clearFailTimer();
          this.isLoading = false;
          this.hasError = true;
          let reason = 'This stream could not be loaded. The source server may be offline, region-locked, or blocking browser playback.';
          if (data.type === 'networkError') {
            reason = 'Could not reach the stream server. It may be offline or blocking cross-origin requests from a browser.';
          } else if (data.type === 'mediaError') {
            reason = 'The stream format could not be played in this browser.';
          }
          this.errorMsg = reason;
          this._emit();
        }
      });
    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = url;
      this.video.addEventListener('loadedmetadata', () => {
        clearFailTimer();
        this.isLoading = false;
        this._emit();
        this.video.play().catch(() => {});
      }, { once: true });
      this.video.addEventListener('error', () => {
        clearFailTimer();
        this.isLoading = false;
        this.hasError = true;
        this.errorMsg = 'This stream could not be loaded.';
        this._emit();
      }, { once: true });
    } else {
      clearFailTimer();
      this.isLoading = false;
      this.hasError = true;
      this.errorMsg = 'Your browser does not support HLS playback.';
      this._emit();
    }
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play().catch(() => {});
    } else {
      this.video.pause();
    }
  }

  setVolumeLevel(level) {
    this.video.volume = level;
    this.video.muted = level === 0;
    this.volume = level;
    this.isMuted = level === 0;
    this._emit();
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.isMuted = this.video.muted;
    if (!this.video.muted && this.video.volume === 0) {
      this.video.volume = 1;
      this.volume = 1;
    }
    this._emit();
  }

  seek(time) {
    this.video.currentTime = time;
    this.currentTime = time;
    this._emit();
  }

  async toggleFullscreen() {
    const wrap = this.video.parentElement;
    if (!wrap) return;
    try {
      if (!document.fullscreenElement) {
        await wrap.requestFullscreen();
        this.isFullscreen = true;
      } else {
        await document.exitFullscreen();
        this.isFullscreen = false;
      }
      this._emit();
    } catch {
      /* fullscreen not supported */
    }
  }

  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.video.requestPictureInPicture();
      }
    } catch {
      /* PiP not supported */
    }
  }

  showControlsTemporarily() {
    this.showControls = true;
    this._emit();
    if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
        this._emit();
      }
    }, 3000);
  }

  _bindVideoEvents() {
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this._emit();
    });
    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.showControls = true;
      this._emit();
    });
    this.video.addEventListener('volumechange', () => {
      this.volume = this.video.volume;
      this.isMuted = this.video.muted;
      this._emit();
    });
    this.video.addEventListener('timeupdate', () => {
      this.currentTime = this.video.currentTime;
      this._emit();
    });
    this.video.addEventListener('loadedmetadata', () => {
      this.duration = this.video.duration || 0;
      this._emit();
    });
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this._emit();
    });
  }

  _bindControls(options) {
    const progressBar = options.progressBar;
    if (progressBar) {
      progressBar.addEventListener('click', (e) => this._handleProgress(e));
      progressBar.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this._handleProgress(e);
      });
      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.seek(pos * this.duration);
      });
      document.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
    }
  }

  _handleProgress(e) {
    const bar = e.currentTarget;
    if (!bar || !this.duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.seek(pos * this.duration);
  }
}

window.HlsPlayer = HlsPlayer;
