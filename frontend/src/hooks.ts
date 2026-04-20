import { useEffect, useRef, useState, useCallback } from "react";

export interface CameraState {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  error: string | null;
  isReady: boolean;
  isInitializing: boolean;
  captureSnapshot: () => string;
  restartCamera: () => void;
}

export function useCamera(): CameraState {
  var videoRef = useRef<HTMLVideoElement>(null as any);
  var canvasRef = useRef<HTMLCanvasElement | null>(null);
  var streamRef = useRef<MediaStream | null>(null);
  var streamState = useState<MediaStream | null>(null);
  var errorState = useState<string | null>(null);
  var readyState = useState(false);
  var initState = useState(true);
  var restartState = useState(0);

  var startCamera = useCallback(async function() {
    initState[1](true);
    errorState[1](null);
    readyState[1](false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(function(t) { t.stop(); });
      streamRef.current = null;
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available. Use HTTPS or localhost.");
      }
      var mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = mediaStream;
      streamState[1](mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      readyState[1](true);
      errorState[1](null);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorState[1]("Camera permission denied. Allow camera access in your browser.");
      } else if (err.name === "NotFoundError") {
        errorState[1]("No camera found. Please connect a webcam.");
      } else if (err.name === "NotReadableError") {
        errorState[1]("Camera is used by another app. Close it and retry.");
      } else {
        errorState[1]("Camera error: " + (err.message || "Unknown"));
      }
    } finally {
      initState[1](false);
    }
  }, []);

  useEffect(function() {
    startCamera();
    return function() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function(t) { t.stop(); });
      }
    };
  }, [startCamera, restartState[0]]);

  var restartCamera = useCallback(function() {
    restartState[1](function(c) { return c + 1; });
  }, []);

  var captureSnapshot = useCallback(function(): string {
    var video = videoRef.current;
    if (!video || !streamRef.current) throw new Error("Camera is not ready");
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    var canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot create canvas context");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
  }, []);

  return {
    videoRef: videoRef, stream: streamState[0], error: errorState[0],
    isReady: readyState[0], isInitializing: initState[0],
    captureSnapshot: captureSnapshot, restartCamera: restartCamera,
  };
}

export function useBackendStatus(intervalMs: number) {
  var onlineState = useState(false);
  var checkingState = useState(true);
  useEffect(function() {
    var mounted = true;
    var check = async function() {
      checkingState[1](true);
      try {
        var res = await fetch("http://localhost:8000/health", { method: "GET" });
        if (mounted) onlineState[1](res.ok);
      } catch {
        if (mounted) onlineState[1](false);
      }
      if (mounted) checkingState[1](false);
    };
    check();
    var id = setInterval(check, intervalMs || 10000);
    return function() { mounted = false; clearInterval(id); };
  }, [intervalMs]);
  return { isOnline: onlineState[0], checking: checkingState[0] };
}

export function useScrollAnimation() {
  var ref = useRef<HTMLDivElement>(null);
  var visibleState = useState(false);
  useEffect(function() {
    var el = ref.current;
    if (!el) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) visibleState[1](true);
      });
    }, { threshold: 0.1 });
    observer.observe(el);
    return function() { observer.disconnect(); };
  }, []);
  return { ref: ref, isVisible: visibleState[0] };
}
