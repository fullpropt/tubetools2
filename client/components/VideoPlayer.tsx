import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  onDurationReady: (duration: number) => void;
  onLoadFail?: () => void;
  onLoadSuccess?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoaded = false;

// Increased timeout for users with slower connections (international users)
const VIDEO_LOAD_TIMEOUT = 15000; // 15 seconds instead of 5

export default function VideoPlayer({
  videoId,
  onTimeUpdate,
  onDurationReady,
  onLoadFail,
  onLoadSuccess,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkLoadingRef = useRef<NodeJS.Timeout | null>(null);
  const loadSuccessRef = useRef(false);
  const playerReadyRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentVideoIdRef = useRef<string>("");

  // Load YouTube API once into iframe
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a stable iframe container
    if (iframeRef.current) return;

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; border: none; display: block;";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    containerRef.current.appendChild(iframe);
    iframeRef.current = iframe;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Create HTML for the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; }
          #player { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script src="https://www.youtube.com/iframe_api"><\/script>
        <script>
          let player = null;
          let apiReady = false;
          
          function onYouTubeIframeAPIReady() {
            apiReady = true;
            window.parent.postMessage({type: 'ytapi-ready'}, '*');
          }
          
          window.createYouTubePlayer = function(videoId) {
            if (!apiReady) {
              setTimeout(() => window.createYouTubePlayer(videoId), 100);
              return;
            }
            
            try {
              if (player) {
                try { player.destroy(); } catch(e) {}
              }
              
              player = new YT.Player('player', {
                width: '100%',
                height: '100%',
                videoId: videoId,
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                  modestbranding: 1,
                  fs: 1,
                  rel: 0,
                  origin: window.location.origin
                },
                events: {
                  onReady: function(e) {
                    window.parent.postMessage({
                      type: 'player-ready',
                      duration: e.target.getDuration()
                    }, '*');
                  },
                  onError: function(e) {
                    // YouTube error codes:
                    // 2 - Invalid video ID
                    // 5 - HTML5 player error
                    // 100 - Video not found (removed or private)
                    // 101/150 - Video not embeddable
                    window.parent.postMessage({
                      type: 'player-error',
                      error: e.data,
                      errorMessage: getErrorMessage(e.data)
                    }, '*');
                  },
                  onStateChange: function(e) {
                    // State -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
                    if (e.data === 1) {
                      // Video started playing - send success signal
                      window.parent.postMessage({
                        type: 'video-playing',
                        duration: e.target.getDuration()
                      }, '*');
                    }
                  }
                }
              });
            } catch(err) {
              window.parent.postMessage({
                type: 'player-error',
                error: err.message
              }, '*');
            }
          };
          
          function getErrorMessage(code) {
            switch(code) {
              case 2: return 'Invalid video ID';
              case 5: return 'HTML5 player error';
              case 100: return 'Video not found or private';
              case 101:
              case 150: return 'Video not embeddable';
              default: return 'Unknown error';
            }
          }
          
          window.loadVideo = function(videoId) {
            if (player && player.loadVideoById) {
              try {
                player.loadVideoById(videoId);
                window.parent.postMessage({
                  type: 'video-load-start'
                }, '*');
              } catch(err) {
                window.parent.postMessage({
                  type: 'player-error',
                  error: err.message
                }, '*');
              }
            }
          };
          
          window.pollPlayer = function() {
            if (!player) return null;
            try {
              const state = player.getPlayerState();
              const time = player.getCurrentTime();
              const duration = player.getDuration();
              return { state, time, duration };
            } catch(err) {
              return null;
            }
          };
        <\/script>
      </body>
      </html>
    `);
    iframeDoc.close();

    return () => {
      if (iframeRef.current?.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    };
  }, []);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from any origin since YouTube iframe may have different origin
      if (!event.data || typeof event.data !== 'object') return;

      const { type, duration, error, errorMessage } = event.data;

      switch (type) {
        case "ytapi-ready":
          console.log("[VideoPlayer] YouTube API ready in iframe");
          apiLoaded = true;
          // Load the initial video
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.createYouTubePlayer(videoId);
          }
          break;

        case "player-ready":
          console.log(
            `[VideoPlayer] Player ready for ${videoId}, duration: ${duration}`,
          );
          playerReadyRef.current = true;
          if (duration > 0) {
            onDurationReady(duration);
          }

          // Start polling
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = setInterval(() => {
            if (iframeRef.current?.contentWindow?.pollPlayer) {
              const data = iframeRef.current.contentWindow.pollPlayer();
              if (data && data.state === 1 && typeof data.time === "number") {
                onTimeUpdate(data.time);
              }
            }
          }, 100);

          // Setup timeout with increased duration for international users
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = setTimeout(() => {
            if (!loadSuccessRef.current && playerReadyRef.current) {
              console.warn(
                `[VideoPlayer] Video ${videoId} did not reach playable state within ${VIDEO_LOAD_TIMEOUT/1000}s`,
              );
              onLoadFail?.();
            }
          }, VIDEO_LOAD_TIMEOUT);

          // Monitor loading
          if (checkLoadingRef.current) clearInterval(checkLoadingRef.current);
          checkLoadingRef.current = setInterval(() => {
            if (iframeRef.current?.contentWindow?.pollPlayer) {
              const data = iframeRef.current.contentWindow.pollPlayer();
              if (
                data &&
                data.duration > 0 &&
                data.state !== -1 &&
                !loadSuccessRef.current
              ) {
                loadSuccessRef.current = true;
                if (loadTimeoutRef.current)
                  clearTimeout(loadTimeoutRef.current);
                if (checkLoadingRef.current)
                  clearInterval(checkLoadingRef.current);
                onLoadSuccess?.();
              }

              // Only fail on state -1 if we've waited long enough (give buffering a chance)
              if (data && data.state === -1 && !loadSuccessRef.current) {
                // Don't immediately fail - let the timeout handle it
                // This gives more time for slow connections
              }
            }
          }, 200);
          break;

        case "video-playing":
          // Video successfully started playing
          if (!loadSuccessRef.current) {
            loadSuccessRef.current = true;
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
            if (checkLoadingRef.current) clearInterval(checkLoadingRef.current);
            console.log(`[VideoPlayer] Video ${videoId} started playing successfully`);
            if (duration > 0) {
              onDurationReady(duration);
            }
            onLoadSuccess?.();
          }
          break;

        case "player-error":
          console.error(`[VideoPlayer] Player error for ${videoId}:`, error, errorMessage);
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          if (checkLoadingRef.current) clearInterval(checkLoadingRef.current);
          onLoadFail?.();
          break;

        case "video-load-start":
          loadSuccessRef.current = false;
          console.log(`[VideoPlayer] Loading video ${videoId}`);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [videoId, onTimeUpdate, onDurationReady, onLoadFail, onLoadSuccess]);

  // Load new video
  useEffect(() => {
    if (!apiLoaded || !iframeRef.current?.contentWindow) {
      currentVideoIdRef.current = videoId;
      return;
    }

    if (currentVideoIdRef.current === videoId) return;

    currentVideoIdRef.current = videoId;
    loadSuccessRef.current = false;

    // Clear timeouts
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    if (checkLoadingRef.current) clearInterval(checkLoadingRef.current);

    // Load video
    if (iframeRef.current.contentWindow.loadVideo) {
      iframeRef.current.contentWindow.loadVideo(videoId);

      // Setup timeout with increased duration
      loadTimeoutRef.current = setTimeout(() => {
        if (!loadSuccessRef.current) {
          console.warn(
            `[VideoPlayer] Video ${videoId} failed to load within ${VIDEO_LOAD_TIMEOUT/1000}s`,
          );
          onLoadFail?.();
        }
      }, VIDEO_LOAD_TIMEOUT);

      // Monitor
      checkLoadingRef.current = setInterval(() => {
        if (iframeRef.current?.contentWindow?.pollPlayer) {
          const data = iframeRef.current.contentWindow.pollPlayer();
          if (
            data &&
            data.duration > 0 &&
            data.state !== -1 &&
            !loadSuccessRef.current
          ) {
            loadSuccessRef.current = true;
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
            if (checkLoadingRef.current) clearInterval(checkLoadingRef.current);
            onLoadSuccess?.();
          }

          // Don't immediately fail on state -1, let timeout handle it
        }
      }, 200);
    }
  }, [videoId, onLoadFail, onLoadSuccess, onDurationReady]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        inset: 0,
      }}
    />
  );
}
