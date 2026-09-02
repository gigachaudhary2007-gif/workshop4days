import React from 'react';

/**
 * LiquidGlassBackground
 * 
 * Provides a continuous, slow-moving liquid glass background animation.
 * Features 5 large, softly blurred organic fluid layers drifting at 20-45s cycles
 * with warm-white (#FAFAF8), subtle emerald (#16835B), and soft mint (#DCEFE7) tones.
 * Uses hardware-accelerated CSS transforms and respects prefers-reduced-motion.
 */
export const LiquidGlassBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#FAFAF8] select-none"
    >
      {/* Base Layer: Warm White Subtle Gradient (#FAFAF8) */}
      <div className="absolute inset-0 bg-[#FAFAF8]" />

      {/* Layer 1: Large Soft Mint Fluid Layer (32s cycle, top-left drift) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] min-w-[550px] min-h-[550px] rounded-full filter blur-[100px] sm:blur-[130px] opacity-70 animate-liquid-1"
        style={{
          background:
            'radial-gradient(ellipse at 40% 40%, rgba(220, 239, 231, 0.55) 0%, rgba(238, 247, 243, 0.4) 45%, rgba(22, 131, 91, 0.04) 70%, transparent 80%)',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: Emerald Glass Reflection Layer (26s cycle, center-right drift) */}
      <div
        className="absolute top-[20%] -right-[12%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full filter blur-[110px] sm:blur-[140px] opacity-65 animate-liquid-2"
        style={{
          background:
            'radial-gradient(circle at center, rgba(22, 131, 91, 0.065) 0%, rgba(220, 239, 231, 0.45) 40%, rgba(250, 250, 248, 0) 75%)',
          willChange: 'transform',
        }}
      />

      {/* Layer 3: Very Soft Green Floating Caustic (40s cycle, bottom-left drift) */}
      <div
        className="absolute -bottom-[20%] left-[10%] w-[60vw] h-[60vw] min-w-[600px] min-h-[600px] rounded-full filter blur-[120px] sm:blur-[150px] opacity-75 animate-liquid-3"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(238, 247, 243, 0.95) 0%, rgba(220, 239, 231, 0.35) 45%, rgba(22, 131, 91, 0.035) 75%, transparent 85%)',
          willChange: 'transform',
        }}
      />

      {/* Layer 4: Deep Ambient Mint Wave (35s cycle, header/top-right drift) */}
      <div
        className="absolute -top-[10%] right-[15%] w-[45vw] h-[45vw] min-w-[450px] min-h-[450px] rounded-full filter blur-[110px] sm:blur-[135px] opacity-60 animate-liquid-4"
        style={{
          background:
            'radial-gradient(circle at 60% 30%, rgba(220, 239, 231, 0.45) 0%, rgba(22, 131, 91, 0.045) 50%, transparent 75%)',
          willChange: 'transform',
        }}
      />

      {/* Layer 5: Slow Glass Specular Caustic Highlight (45s cycle, center drift) */}
      <div
        className="absolute top-[35%] left-[25%] w-[48vw] h-[48vw] min-w-[480px] min-h-[480px] rounded-full filter blur-[100px] sm:blur-[120px] opacity-50 animate-liquid-5"
        style={{
          background:
            'radial-gradient(ellipse at 45% 45%, rgba(255, 255, 255, 0.85) 0%, rgba(220, 239, 231, 0.25) 40%, rgba(22, 131, 91, 0.02) 65%, transparent 80%)',
          willChange: 'transform',
        }}
      />

      {/* Layer 6: Microscopic Ambient Glass Vignette & Light Diffusion */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
