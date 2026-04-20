import React from "react";
import type { AnalysisResult } from "../api";

interface TryOnOverlayProps {
  resultImageBase64: string | null;
  analysis: AnalysisResult | null;
  poseDetected?: boolean;
  processingTime?: number;
  isLoading: boolean;
}

export var TryOnOverlay: React.FC<TryOnOverlayProps> = function(props) {
  var glassStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8))",
    backdropFilter: "blur(20px)",
  };

  if (props.isLoading) {
    return (
      <div className="rounded-3xl p-10 text-center border border-white/10" style={glassStyle}>
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl">🧠</span></div>
        </div>
        <p className="text-white font-bold text-lg mb-2">AI Processing</p>
        <p className="text-cyan-300/70 text-sm mb-6">Detecting body - Analyzing pose - Matching clothing</p>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if (!props.resultImageBase64) {
    return (
      <div className="rounded-3xl p-10 text-center border border-white/10" style={glassStyle}>
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center">
          <span className="text-5xl opacity-50">✨</span>
        </div>
        <p className="text-white/60 text-sm font-medium">Capture a photo to see AI magic</p>
        <p className="text-white/30 text-xs mt-2">Auto gender detection - Smart matching - 1000+ styles</p>
      </div>
    );
  }

  var poseBadge = null;
  if (props.poseDetected !== undefined) {
    if (props.poseDetected) {
      poseBadge = <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-xl border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">✓ Pose Detected</span>;
    } else {
      poseBadge = <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-xl border bg-yellow-500/20 text-yellow-300 border-yellow-500/30">⚠ Partial Pose</span>;
    }
  }

  var timeBadge = null;
  if (props.processingTime !== undefined) {
    timeBadge = <span className="bg-black/50 backdrop-blur-xl text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">{props.processingTime}ms</span>;
  }

  var genderIcon = "🧑";
  var genderBg = "bg-gray-500/20 border border-gray-500/30";
  if (props.analysis) {
    if (props.analysis.gender === "male") {
      genderIcon = "👨";
      genderBg = "bg-blue-500/20 border border-blue-500/30";
    } else if (props.analysis.gender === "female") {
      genderIcon = "👩";
      genderBg = "bg-pink-500/20 border border-pink-500/30";
    }
  }

  var analysisCard = null;
  if (props.analysis) {
    var recs = (props.analysis.recommendations || []).slice(0, 8).map(function(rec) {
      return (
        <div key={rec.id} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 hover:border-cyan-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-white/10" style={{ backgroundColor: rec.colorHex }}></div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{rec.name}</p>
            <p className="text-white/40 text-[10px]">{rec.reason} - {rec.price}</p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-xs font-black text-emerald-400">{rec.match_score}%</span>
          </div>
        </div>
      );
    });

    analysisCard = (
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl" style={glassStyle}>
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 px-6 py-4 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent)" }}></div>
          <h4 className="text-white font-bold text-base relative z-10 flex items-center gap-2">🧠 AI Body Analysis</h4>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={"w-16 h-16 rounded-2xl flex items-center justify-center text-3xl " + genderBg}>{genderIcon}</div>
              <div>
                <p className="text-white font-bold text-lg capitalize">{props.analysis.gender}</p>
                <p className="text-white/50 text-xs">Auto-Detected Gender</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{props.analysis.confidence}%</p>
              <p className="text-white/40 text-xs">Confidence</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Coverage</p>
              <p className="text-white font-bold text-sm capitalize mt-1">{props.analysis.body_coverage.replace(/_/g, " ")}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Stance</p>
              <p className="text-white font-bold text-sm capitalize mt-1">{props.analysis.pose_stance}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Build</p>
              <p className="text-white font-bold text-sm capitalize mt-1">{props.analysis.body_build_estimate}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-3">Suitable Types</p>
            <div className="flex flex-wrap gap-2">
              {props.analysis.suitable_clothing_types.map(function(type, i) {
                return <span key={i} className="px-4 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-xl text-xs font-bold capitalize border border-cyan-500/20">{type}</span>;
              })}
            </div>
          </div>
          {recs.length > 0 && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-3">🎯 Top AI Picks for You</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">{recs}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-cyan-500/10">
        <img src={"data:image/jpeg;base64," + props.resultImageBase64} alt="Result" className="w-full h-auto" />
        {poseBadge && <div className="absolute top-4 right-4">{poseBadge}</div>}
        {timeBadge && <div className="absolute bottom-4 right-4">{timeBadge}</div>}
      </div>
      {analysisCard}
    </div>
  );
};
