import { useRef, useCallback, useEffect, useState } from 'react';
import Hls from 'hls.js';

export function useHlsPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration || 0);
      }
    }, 250);
  }, [stopProgressTracking]);

  const loadStream = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    stopProgressTracking();
    video.removeAttribute('src');
    video.load();

    setIsLoading(true);
    setHasError(false);
    setErrorMsg('');
    setCurrentTime(0);
    setDuration(0);

    const failSafetyTimer = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
      setErrorMsg('Stream is taking too long to respond. The source server may be offline.');
    }, 15000);

    const clearFailTimer = () => clearTimeout(failSafetyTimer);

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 2,
        manifestLoadingTimeOut: 12000,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 12000,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearFailTimer();
        setIsLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          clearFailTimer();
          setIsLoading(false);
          setHasError(true);
          let reason = 'This stream could not be loaded. The source server may be offline, region-locked, or blocking browser playback.';
          if (data.type === 'networkError') {
            reason = 'Could not reach the stream server. It may be offline or blocking cross-origin requests from a browser.';
          } else if (data.type === 'mediaError') {
            reason = 'The stream format could not be played in this browser.';
          }
          setErrorMsg(reason);
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        clearFailTimer();
        setIsLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        clearFailTimer();
        setIsLoading(false);
        setHasError(true);
        setErrorMsg('This stream could not be loaded.');
      }, { once: true });
    } else {
      clearFailTimer();
      setIsLoading(false);
      setHasError(true);
      setErrorMsg('Your browser does not support HLS playback.');
    }
  }, [destroyHls, stopProgressTracking]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = level;
    video.muted = level === 0;
    setVolume(level);
    setIsMuted(level === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && video.volume === 0) {
      video.volume = 1;
      setVolume(1);
    }
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const videoWrap = videoRef.current?.parentElement;
    if (!videoWrap) return;

    try {
      if (!document.fullscreenElement) {
        await videoWrap.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback for browsers that don't support fullscreen
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current !== null) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      startProgressTracking();
    };
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [startProgressTracking]);

  useEffect(() => {
    return () => {
      destroyHls();
      stopProgressTracking();
      if (controlsTimeoutRef.current !== null) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [destroyHls, stopProgressTracking]);

  return {
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
  };
}
