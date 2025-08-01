"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Video } from "lucide-react";

interface OptimizedVideoProps {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onVideoClick?: () => void;
  showControlsOnHover?: boolean;
  containerClassName?: string;
}

export function OptimizedVideo({
  src,
  className = "",
  poster,
  autoPlay = false, // Changed default to false - no autoplay unless explicitly requested
  controls = true,
  muted = true,
  loop = true,
  onVideoClick,
  showControlsOnHover = true,
  containerClassName = "",
}: OptimizedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(!showControlsOnHover);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced intersection observer for autoplay (only if explicitly enabled and user has interacted)
  useEffect(() => {
    if (!autoPlay || !videoRef.current || !containerRef.current) return;

    const videoElement = videoRef.current;
    const containerElement = containerRef.current;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.6, // 60% of video must be visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          isVideoLoaded &&
          !videoError &&
          hasUserInteracted
        ) {
          // Only attempt to play if video is loaded, no errors, and user has interacted
          videoElement?.play().catch((error) => {
            // Silently handle play() errors (common with user interaction requirements)
            if (error.name !== "AbortError") {
              console.log("Video autoplay prevented:", error.message);
            }
          });
          setIsPlaying(true);
        } else {
          // Safely pause the video
          if (videoElement && !videoElement.paused) {
            videoElement.pause();
          }
          setIsPlaying(false);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);
    observerRef.current.observe(containerElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      // Ensure video is paused on cleanup
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };
  }, [autoPlay, isVideoLoaded, videoError, hasUserInteracted]);

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video loading error:", e);
    setVideoError(true);
    setIsVideoLoaded(false);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || videoError) return;
    try {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    } catch (error) {
      console.log("Video time update error:", error);
    }
  };

  const togglePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current || videoError) return;

    // Mark that user has interacted with the video
    setHasUserInteracted(true);

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Video play/pause error:", error);
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current || videoError) return;

    // Mark that user has interacted with the video
    setHasUserInteracted(true);

    try {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } catch (error) {
      console.log("Video mute toggle error:", error);
    }
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !progressBarRef.current || videoError) return;

    // Mark that user has interacted with the video
    setHasUserInteracted(true);

    try {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const time = (percentage / 100) * videoRef.current.duration;

      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(percentage);
      }
    } catch (error) {
      console.log("Video seek error:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleContainerClick = () => {
    if (onVideoClick) {
      onVideoClick();
    } else {
      // If no click handler, toggle play/pause
      togglePlay();
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!controls) {
      // If no controls, clicking video should toggle play
      togglePlay();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black ${containerClassName}`}
      onMouseEnter={() => showControlsOnHover && setShowControls(true)}
      onMouseLeave={() => showControlsOnHover && setShowControls(false)}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`w-full h-full object-contain cursor-pointer ${className}`} // Changed to object-contain for better display
        controls={false}
        playsInline
        muted={isMuted}
        loop={loop}
        preload="metadata"
        onLoadedData={handleVideoLoaded}
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        onLoadStart={() => setVideoError(false)}
        onClick={handleVideoClick}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {/* Large play button overlay when video is not playing */}
      {!isPlaying && isVideoLoaded && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200">
          <button
            onClick={togglePlay}
            className="bg-white/90 hover:bg-white text-black rounded-full p-4 transition-all duration-200 hover:scale-110"
            aria-label="Play video"
          >
            <Play className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {!isVideoLoaded && !videoError && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}

      {/* Error state */}
      {videoError && (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
          <Video className="w-12 h-12 text-gray-600 mb-2" />
          <span className="text-gray-400 text-sm">Video unavailable</span>
        </div>
      )}

      {/* Enhanced video controls */}
      {controls && isVideoLoaded && !videoError && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
            showControls || isPlaying ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent modal opening when clicking controls
        >
          <div className="flex flex-col gap-2">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="flex-grow h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100 group-hover:bg-blue-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              {/* Time display */}
              <div className="text-white text-sm flex-grow">
                {videoRef.current && (
                  <>
                    {formatTime(videoRef.current.currentTime)} /{" "}
                    {formatTime(videoRef.current.duration)}
                  </>
                )}
              </div>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
