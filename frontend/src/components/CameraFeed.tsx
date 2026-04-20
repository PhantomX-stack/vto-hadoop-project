import React from "react";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
  onRestart: () => void;
}

export var CameraFeed: React.FC<CameraFeedProps> = function(props) {
  var containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/20" style={containerStyle}>
      {props.isInitializing && !props.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-cyan-300 mt-6 text-sm font-medium tracking-wide">Initializing Camera...</p>
        </div>
      )}

      {props.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-red-300 text-sm text-center mb-6 max-w-sm leading-relaxed">{props.error}</p>
          <button onClick={props.onRestart} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25">Retry Camera</button>
        </div>
      )}

      <video
        ref={props.videoRef}
        autoPlay
        playsInline
        muted
        className={"w-full h-full object-cover transition-opacity duration-500 " + (props.isReady && !props.error ? "opacity-100" : "opacity-0")}
        style={{ transform: "scaleX(-1)" }}
      />

      {props.isReady && !props.error && (
        <React.Fragment>
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
              <span className="text-white text-xs font-bold tracking-widest">LIVE</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-black/40 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10">
              <span className="text-white/70 text-xs font-medium">HD 720p</span>
            </div>
          </div>
          <div className="absolute inset-4 border-2 border-cyan-400/30 rounded-2xl z-20 pointer-events-none"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-cyan-300 text-[10px] font-semibold tracking-wider">AI BODY TRACKING ACTIVE</span>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
