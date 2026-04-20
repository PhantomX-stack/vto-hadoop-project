import React from "react";
import { useScrollAnimation } from "../hooks";

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = function(props) {
  var anim = useScrollAnimation();
  return (
    <div ref={anim.ref} className={"glass rounded-3xl p-8 text-center transition-all duration-700 hover:scale-105 hover:border-cyan-500/20 " + (anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")} style={{ transitionDelay: props.delay + "ms" }}>
      <span className="text-5xl mb-4 block">{props.icon}</span>
      <h3 className="text-white font-bold text-base mb-2">{props.title}</h3>
      <p className="text-white/40 text-xs leading-relaxed">{props.desc}</p>
    </div>
  );
};
