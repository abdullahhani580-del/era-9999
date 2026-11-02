import React, { memo } from 'react';

interface Props {
  isDark: boolean;
}

/**
 * Ultra-smooth, GPU-accelerated ambient background.
 * Uses hardware-accelerated CSS mesh gradients and subtle ambient orbs
 * with zero continuous canvas overhead for locked 60/120 FPS performance.
 */
export const FuturisticBackground: React.FC<Props> = memo(({ isDark }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full select-none transition-colors duration-500 ${
        isDark
          ? 'bg-[#030611]'
          : 'bg-[#f5f7fb]'
      }`}
    >
      {/* Top Ambient Glow Orb */}
      <div
        className={`absolute -top-32 left-1/4 w-[36rem] h-[36rem] sm:w-[48rem] sm:h-[48rem] rounded-full blur-[120px] pointer-events-none transition-all duration-700 transform-gpu ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent'
            : 'bg-gradient-to-br from-sky-200/25 via-blue-100/15 to-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Middle Right Violet Glow Orb */}
      <div
        className={`absolute top-1/4 -right-24 w-[32rem] h-[32rem] sm:w-[42rem] sm:h-[42rem] rounded-full blur-[130px] pointer-events-none transition-all duration-700 transform-gpu ${
          isDark
            ? 'bg-gradient-to-bl from-purple-600/12 via-indigo-600/8 to-transparent'
            : 'bg-gradient-to-bl from-indigo-100/20 via-slate-100/15 to-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Bottom Emerald/Cyan Ambient Glow Orb */}
      <div
        className={`absolute bottom-[-10rem] left-[-5rem] w-[35rem] h-[35rem] sm:w-[44rem] sm:h-[44rem] rounded-full blur-[140px] pointer-events-none transition-all duration-700 transform-gpu ${
          isDark
            ? 'bg-gradient-to-tr from-emerald-500/10 via-cyan-500/8 to-transparent'
            : 'bg-gradient-to-tr from-emerald-100/20 via-teal-100/10 to-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Micro-mesh Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity"
        style={{
          opacity: isDark ? 0.035 : 0.06,
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)'
            : 'radial-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
});

FuturisticBackground.displayName = 'FuturisticBackground';
