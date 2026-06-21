import { useRef, useCallback, useEffect } from 'react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import type { Channel, FifaPlusStream } from '../types';

interface VideoPlayerProps {
  channel: Channel | FifaPlusStream | null;
  isOpen: boolean;
  onClose: () => void;

}

function cleanName(name: string): string {
  return name.replace(/\s*\(\d{3,4}p\)\s*(\[.*\])?\s*$/, '').trim() || name;
}

export default function VideoPlayer({ channel, isOpen, onClose }: VideoPlayerProps) {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isLoading,
    hasError,
    errorMsg,
    showControls,
    formatTime,
    loadStream,
    togglePlay,
    setVolumeLevel,
    toggleMute,
    seek,
    toggleFullscreen,
    togglePiP,
    showControlsTemporarily,
    destroyHls,
  } = useHlsPlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  }, [duration, seek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleProgressClick(e);
  }, [handleProgressClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pos * duration);
  }, [duration, seek]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isOpen || !channel) return;

    if ('streamUrl' in channel) {
      // FIFA+ stream
      loadStream(channel.streamUrl);
    } else if (channel.url) {
      loadStream(channel.url);
    }

    return () => {
      destroyHls();
    };
  }, [isOpen, channel, loadStream, destroyHls]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          seek(currentTime + 10);
          break;
        case 'ArrowLeft':
          seek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeLevel(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 0.1));
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, togglePlay, seek, currentTime, setVolumeLevel, volume, toggleFullscreen, toggleMute]);

  if (!isOpen || !channel) return null;

  const displayName = 'name' in channel ? cleanName(channel.name) : '';
  const countryLabel = 'countryLabel' in channel ? channel.countryLabel : ('region' in channel ? channel.region : '');
  const groupLabel = 'group' in channel ? (channel.group || 'General') : ('language' in channel ? `FIFA+ · ${channel.language}` : '');
  const protoLabel = 'isHttps' in channel
    ? (channel.isHttps ? 'SECURE STREAM' : 'INSECURE STREAM (MAY FAIL)')
    : ('quality' in channel ? `${channel.quality.toUpperCase()} · HLS` : 'HLS STREAM');

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="player-box">
        {/* Header */}
        <div className="player-head">
          <span className="live-tag">
            <span className="blob"></span>
            LIVE
          </span>
          <h3 className="player-title">{displayName}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close player">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Video */}
        <div
          className="video-wrap"
          onMouseMove={showControlsTemporarily}
          onClick={() => {
            if (!showControls) {
              showControlsTemporarily();
            } else {
              togglePlay();
            }
          }}
        >
          <video
            ref={videoRef}
            playsInline
            style={{ cursor: showControls ? 'pointer' : 'none' }}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="video-status">
              <div className="spinner"></div>
              <span>Connecting to stream...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="video-status">
              <div className="err-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <span>{errorMsg}</span>
              <button
                className="retry-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if ('streamUrl' in channel) {
                    loadStream(channel.streamUrl);
                  } else if (channel.url) {
                    loadStream(channel.url);
                  }
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Custom Controls */}
          <div className={`player-controls ${showControls ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="progress-bar-container"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="progress-bar-filled"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="controls-row">
              <div className="controls-left">
                {/* Play/Pause */}
                <button className="ctrl-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                {/* Volume */}
                <div className="volume-container">
                  <button className="ctrl-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted || volume === 0 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                    className="volume-slider"
                    aria-label="Volume"
                  />
                </div>

                {/* Time Display */}
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right">
                {/* PiP */}
                <button className="ctrl-btn" onClick={togglePiP} aria-label="Picture in Picture">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    <rect x="10" y="10" width="8" height="6" rx="1" />
                  </svg>
                </button>

                {/* Fullscreen */}
                <button className="ctrl-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="player-foot">
          <span>{countryLabel}</span>
          <span>{groupLabel}</span>
          <span>{protoLabel}</span>
        </div>
      </div>
    </div>
  );
}
