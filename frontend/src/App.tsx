import React, { useState, useCallback, useEffect } from "react";
import { useCamera, useBackendStatus, useScrollAnimation } from "./hooks";
import { tryOnClothing, analyzeBody, simulateTryOn, simulateAnalysis, generateCatalog, type AnalysisResult, type ClothingRecommendation } from "./api";
import { CameraFeed } from "./components/CameraFeed";
import { CatalogGrid } from "./components/CatalogGrid";
import { TryOnOverlay } from "./components/TryOnOverlay";
import { StatusBar } from "./components/StatusBar";

function FloatingParticle(props: { delay: number; x: number; y: number; size: number }) {
  return (
    <div className="absolute rounded-full bg-cyan-500/10 pointer-events-none" style={{
      width: props.size + "px", height: props.size + "px",
      left: props.x + "%", top: props.y + "%",
      animation: "float " + (6 + props.delay) + "s ease-in-out infinite",
      animationDelay: props.delay + "s",
    }}></div>
  );
}

function SectionTitle(props: { label: string; title: string; desc: string }) {
  var anim = useScrollAnimation();
  var cls = "text-center mb-12 transition-all duration-700 ";
  if (anim.isVisible) {
    cls += "opacity-100 translate-y-0";
  } else {
    cls += "opacity-0 translate-y-8";
  }
  return (
    <div ref={anim.ref} className={cls}>
      <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider mb-4">{props.label}</span>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{props.title}</h2>
      <p className="text-white/40 text-sm max-w-lg mx-auto">{props.desc}</p>
    </div>
  );
}

function FeatureCard(props: { icon: string; title: string; desc: string; delay: number }) {
  var anim = useScrollAnimation();
  var cls = "glass rounded-3xl p-8 text-center transition-all duration-700 hover:scale-105 hover:border-cyan-500/20 ";
  if (anim.isVisible) {
    cls += "opacity-100 translate-y-0";
  } else {
    cls += "opacity-0 translate-y-12";
  }
  return (
    <div ref={anim.ref} className={cls} style={{ transitionDelay: props.delay + "ms" }}>
      <span className="text-5xl mb-4 block">{props.icon}</span>
      <h3 className="text-white font-bold text-base mb-2">{props.title}</h3>
      <p className="text-white/40 text-xs leading-relaxed">{props.desc}</p>
    </div>
  );
}

function App() {
  var camera = useCamera();
  var backend = useBackendStatus(8000);

  var selectedState = useState<ClothingRecommendation | null>(null);
  var resultState = useState<string | null>(null);
  var analysisState = useState<AnalysisResult | null>(null);
  var poseState = useState<boolean | undefined>(undefined);
  var timeState = useState<number | undefined>(undefined);
  var processingState = useState(false);
  var errorState = useState<string | null>(null);
  var detectedGenderState = useState<string | null>(null);
  var autoPickState = useState<ClothingRecommendation | null>(null);
  var scrollYState = useState(0);

  useEffect(function() {
    var onScroll = function() { scrollYState[1](window.scrollY); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return function() { window.removeEventListener("scroll", onScroll); };
  }, []);

  var handleAutoTryOn = useCallback(async function() {
    errorState[1](null);
    if (!camera.isReady) { errorState[1]("Camera is not ready."); return; }
    processingState[1](true);
    resultState[1](null);
    analysisState[1](null);
    autoPickState[1](null);

    try {
      var userBase64 = camera.captureSnapshot();
      var analysisResult: AnalysisResult;

      if (backend.isOnline) {
        try { analysisResult = await analyzeBody(userBase64); }
        catch { analysisResult = simulateAnalysis(); }
      } else {
        await new Promise(function(r) { setTimeout(r, 1200); });
        analysisResult = simulateAnalysis();
      }

      detectedGenderState[1](analysisResult.gender);
      analysisState[1](analysisResult);

      var allItems = generateCatalog();
      var genderItems = allItems.filter(function(x) { return x.gender === analysisResult.gender; });
      var bestMatch = genderItems.sort(function(a, b) { return b.match_score - a.match_score; })[0];
      autoPickState[1](bestMatch);
      selectedState[1](bestMatch);

      var tryOnResult: any;
      if (backend.isOnline) {
        try { tryOnResult = await tryOnClothing(userBase64, bestMatch.image_base64 || "placeholder"); }
        catch { tryOnResult = simulateTryOn(userBase64); }
      } else {
        await new Promise(function(r) { setTimeout(r, 1000); });
        tryOnResult = simulateTryOn(userBase64);
      }

      resultState[1](tryOnResult.result_image_base64);
      poseState[1](tryOnResult.pose_detected);
      timeState[1](tryOnResult.processing_time_ms);
      if (tryOnResult.analysis) {
        analysisState[1](tryOnResult.analysis);
        detectedGenderState[1](tryOnResult.analysis.gender);
      }

      setTimeout(function() {
        var el = document.getElementById("results-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      errorState[1](err.message || "An error occurred");
    } finally {
      processingState[1](false);
    }
  }, [camera.isReady, camera.captureSnapshot, backend.isOnline]);

  var handleManualTryOn = useCallback(async function() {
    errorState[1](null);
    var selected = selectedState[0];
    if (!selected) { errorState[1]("Select an item from the catalog first."); return; }
    if (!camera.isReady) { errorState[1]("Camera is not ready."); return; }
    processingState[1](true);
    resultState[1](null);
    try {
      var userBase64 = camera.captureSnapshot();
      var tryOnResult: any;
      if (backend.isOnline) {
        try { tryOnResult = await tryOnClothing(userBase64, selected.image_base64 || "placeholder"); }
        catch { tryOnResult = simulateTryOn(userBase64); }
      } else {
        await new Promise(function(r) { setTimeout(r, 1200); });
        tryOnResult = simulateTryOn(userBase64);
      }
      resultState[1](tryOnResult.result_image_base64);
      poseState[1](tryOnResult.pose_detected);
      timeState[1](tryOnResult.processing_time_ms);
      if (tryOnResult.analysis) analysisState[1](tryOnResult.analysis);
    } catch (err: any) {
      errorState[1](err.message);
    } finally {
      processingState[1](false);
    }
  }, [selectedState[0], camera.isReady, camera.captureSnapshot, backend.isOnline]);

  var isBusy = processingState[0];

  var particles = [];
  for (var i = 0; i < 20; i++) {
    particles.push(<FloatingParticle key={i} delay={i * 0.7} x={Math.random() * 100} y={Math.random() * 100} size={4 + Math.random() * 12} />);
  }

  var heroTransform = "translateY(" + Math.min(scrollYState[0] * 0.3, 200) + "px)";
  var heroOpacity = Math.max(1 - scrollYState[0] / 600, 0);

  var autoPickBox = null;
  if (autoPickState[0]) {
    autoPickBox = (
      <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-white/20" style={{ backgroundColor: autoPickState[0].colorHex }}></div>
        <div className="flex-1 min-w-0">
          <p className="text-cyan-300 text-[10px] font-bold tracking-wider">🤖 AI BEST MATCH</p>
          <p className="text-white text-xs font-bold truncate">{autoPickState[0].name}</p>
          <p className="text-white/40 text-[10px]">{autoPickState[0].match_score}% match - {autoPickState[0].price}</p>
        </div>
      </div>
    );
  }

  var selectedBox = null;
  if (selectedState[0] && !autoPickState[0]) {
    selectedBox = (
      <div className="mt-4 flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: selectedState[0].colorHex }}></div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate">{selectedState[0].name}</p>
          <p className="text-white/40 text-[10px] capitalize">{selectedState[0].gender} - {selectedState[0].category}</p>
        </div>
        <button onClick={function() { selectedState[1](null); }} className="text-white/30 hover:text-white/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    );
  }

  var errorBox = null;
  if (errorState[0]) {
    errorBox = (
      <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-lg">⚠️</span>
        <p className="text-red-300 text-sm flex-1">{errorState[0]}</p>
        <button onClick={function() { errorState[1](null); }} className="text-red-400 hover:text-red-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    );
  }

  var btnDisabled = isBusy || !camera.isReady || !!camera.error;
  var btnClass = "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 ";
  if (btnDisabled) {
    btnClass += "bg-white/5 text-white/20 cursor-not-allowed";
  } else {
    btnClass += "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white hover:scale-[1.02] shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40";
  }

  var manualDisabled = isBusy || !camera.isReady || !!camera.error || !selectedState[0];
  var manualClass = "w-full py-3 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ";
  if (manualDisabled) {
    manualClass += "bg-white/5 text-white/20 cursor-not-allowed";
  } else {
    manualClass += "glass hover:bg-white/10 text-white hover:scale-[1.02]";
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "linear-gradient(180deg, #020617 0%, #0f172a 30%, #020617 100%)" }}>
      <style>{"@keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; } 50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; } } @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(6,182,212,0.3); } 50% { box-shadow: 0 0 40px rgba(6,182,212,0.6); } } @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.8s ease-out forwards; } .animate-glow { animation: glow 3s ease-in-out infinite; } .glass { background: rgba(15,23,42,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); } html { scroll-behavior: smooth; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }"}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 animate-glow">
              <span className="text-lg">👕</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">VTryOn</h1>
              <p className="text-[9px] text-white/30 font-medium tracking-wider">AI + HADOOP</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#hero" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Home</a>
            <a href="#camera-section" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Camera</a>
            <a href="#catalog-section" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Catalog</a>
            <a href="#results-section" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Results</a>
          </div>
          <StatusBar isBackendOnline={backend.isOnline} isChecking={backend.checking} />
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">{particles}</div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto" style={{ transform: heroTransform, opacity: heroOpacity }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8 animate-slide-up">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-300 text-xs font-semibold tracking-wider">POWERED BY HADOOP BIG DATA &amp; AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">Virtual</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Clothing Try-On</span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            AI auto-detects your gender &amp; body - Matches from 1000+ styles - See it on you in seconds
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <a href="#camera-section" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2">
              <span>📸</span> Start Try-On
            </a>
            <a href="#catalog-section" className="px-8 py-4 glass hover:bg-white/10 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <span>👗</span> Browse Catalog
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">1000+</p>
              <p className="text-white/30 text-xs mt-1">Styles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</p>
              <p className="text-white/30 text-xs mt-1">Detection</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">&lt;2s</p>
              <p className="text-white/30 text-xs mt-1">Speed</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* CAMERA SECTION */}
      <section id="camera-section" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionTitle label="STEP 1" title="Capture &amp; Detect" desc="Take a photo - AI auto-detects your gender, body type, and pose instantly" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="glass rounded-3xl p-6">
              <CameraFeed videoRef={camera.videoRef} isReady={camera.isReady} isInitializing={camera.isInitializing} error={camera.error} onRestart={camera.restartCamera} />
              <div className="mt-5 space-y-3">
                <button onClick={handleAutoTryOn} disabled={btnDisabled} className={btnClass}>
                  {processingState[0] ? (
                    <React.Fragment>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>AI Analyzing &amp; Matching...</span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <span className="text-lg">🚀</span>
                      <span>Smart Capture - Auto Detect &amp; Match</span>
                    </React.Fragment>
                  )}
                </button>
                <button onClick={handleManualTryOn} disabled={manualDisabled} className={manualClass}>
                  <span>🎯</span><span>Try Selected Item</span>
                </button>
              </div>
              {autoPickBox}
              {selectedBox}
            </div>
            <div id="results-section">
              {errorBox}
              <TryOnOverlay resultImageBase64={resultState[0]} analysis={analysisState[0]} poseDetected={poseState[0]} processingTime={timeState[0]} isLoading={processingState[0]} />
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section id="catalog-section" className="relative py-24 px-4">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)" }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionTitle label="STEP 2" title="AI-Curated Collection" desc="1000+ styles filtered by your detected gender - Sorted by AI match score" />
          <div className="glass rounded-3xl p-6">
            <CatalogGrid detectedGender={detectedGenderState[0]} onSelect={function(item) { selectedState[1](item); autoPickState[1](null); }} selectedId={selectedState[0] ? selectedState[0].id : null} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionTitle label="TECHNOLOGY" title="Powered By" desc="Cutting-edge AI meets big data infrastructure" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard icon="🧠" title="AI Body Detection" desc="Auto-detects gender, body build, pose stance with 95%+ accuracy" delay={0} />
            <FeatureCard icon="🗄️" title="Hadoop Big Data" desc="Processes 1000+ clothing items with distributed MapReduce pipeline" delay={150} />
            <FeatureCard icon="⚡" title="Real-Time Speed" desc="Under 2 seconds from capture to full try-on visualization" delay={300} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm">👕</span>
            </div>
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">VTryOn</span>
          </div>
          <p className="text-white/20 text-xs">Real-Time Virtual Clothing Try-On using Hadoop Big Data Processing</p>
          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com/PhantomX-stack" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-white/50 hover:text-white text-xs font-medium transition-all duration-300 hover:scale-105 hover:border-white/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              GitHub
            </a>
          </div>
          <p className="text-white/10 text-[10px]">&copy; 2024 VTryOn Project. Built with React, TypeScript, Tailwind CSS, Hadoop &amp; AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
