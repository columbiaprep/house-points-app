// glow.tsx
import React from 'react';

// Props type for the glowing row wrapper
type GlowProps = {
  house: string; // Used to determine glow color
  children: React.ReactElement; // The <tr> row element to be styled
};

export default function GlowingEffect({ house, children }: GlowProps) {
  // RGB glow colors for each house key can be changed to any color to suit the house better if needed
  // Map of house names to RGBA color values for glow styling
  const colorMap: Record<string, string> = {
    GreenIvy:        'rgba(72,187,120,0.6)',
    GoldHearts:      'rgba(245,158,11,0.6)',
    RedPhoenix:      'rgba(239,68,68,0.6)',
    OrangeSuperNova: 'rgba(249,115,22,0.6)',
    PinkPanther:     'rgba(236,72,153,0.6)',
    BlueThunder:     'rgba(59,130,246,0.6)',
    PurpleRain:      'rgba(139,92,246,0.6)',
    SilverKnights:   'rgba(156,163,175,0.6)',
  };

  // Fallback color if house isn't in the map
  const glowColor = colorMap[house] || 'rgba(107,114,128,0.4)'; // Default color grey

  // Clone the child element (expected to be a <tr>) and add custom styles to it
  const styledRow = React.cloneElement(children, {
    className: `${children.props.className || ''} relative`, // Preserve any existing classes and add 'relative' 
    // NOTE!!: **`relative` (Tailwind/CSS):** Sets the element’s position to `relative`, allowing absolutely positioned child elements to be anchored to it, without moving the element itself.

    style: {
      ...children.props.style, // Keep original inline styles
      boxShadow: `0 0 8px ${glowColor}, 0 0 20px ${glowColor}`, // Initial glow effect
      animation: 'glow 2s ease-in-out infinite', // Animate the glow or glow effect
    },
  });

  return (
    <>
      {styledRow}
      <style jsx global>{`
        @keyframes glow {
          0%,100% { box-shadow: 0 0 8px ${glowColor}, 0 0 20px ${glowColor}; }
          50%     { box-shadow: 0 0 16px ${glowColor}, 0 0 40px ${glowColor}; }
        }
      `}</style>
    </>
  );
}
