import React from "react";

interface StatusBarProps {
  isBackendOnline: boolean;
  isChecking: boolean;
}

export var StatusBar: React.FC<StatusBarProps> = function(props) {
  var dotClass = "w-2 h-2 rounded-full";
  var bgClass = "flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl ";
  var textClass = "text-xs font-semibold ";

  if (props.isChecking) {
    bgClass += "bg-yellow-500/10 border-yellow-500/20";
    textClass += "text-yellow-300";
    return (
      <div className={bgClass}>
        <div className={dotClass + " bg-yellow-400 animate-pulse"}></div>
        <span className={textClass}>Connecting...</span>
      </div>
    );
  }

  if (props.isBackendOnline) {
    bgClass += "bg-emerald-500/10 border-emerald-500/20";
    textClass += "text-emerald-300";
    return (
      <div className={bgClass}>
        <div className={dotClass + " bg-emerald-400 shadow-lg shadow-emerald-400/50"}></div>
        <span className={textClass}>AI Backend Live</span>
      </div>
    );
  }

  bgClass += "bg-red-500/10 border-red-500/20";
  textClass += "text-red-300";
  return (
    <div className={bgClass}>
      <div className={dotClass + " bg-red-400 animate-pulse"}></div>
      <span className={textClass}>Offline - AI Fallback</span>
    </div>
  );
};
