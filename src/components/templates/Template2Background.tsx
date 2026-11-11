import React, { useMemo } from 'react';
import { getBackgroundSvg } from './backgroundGoldFrame';
import './Template2Background.css';

interface Template2BackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  primaryColor?: string;
  goldColor?: string;
  accentColor?: string;
}

/**
 * High-fidelity vector SVG background for Template 2 (Corporate Minimal / Gold Frame).
 * Extracted from files (1).zip (backgroundGoldFrame.ts + BackgroundGoldFrame.tsx).
 * Features:
 * - 1024 x 1536 design resolution (2:3 portrait aspect ratio)
 * - Thin gold border around all four edges (FRAME & CREAM inner stroke)
 * - Top-left sweeping bronze/brown swoosh with polished multi-stop metallic gold ribbons
 * - Bottom sweeping brown wave with soft red-brown radial highlight (#95391C) and gold ribbon upper edge
 * - Clean bright warm white central canvas (#FDFDFD)
 * - Fully supports dynamic color theming!
 */
export const Template2Background: React.FC<Template2BackgroundProps> = ({
  className = '',
  style = {},
  children,
  primaryColor,
  goldColor,
  accentColor,
}) => {
  const svgDataUri = useMemo(() => {
    const svg = getBackgroundSvg({ primaryColor, goldColor, accentColor });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [primaryColor, goldColor, accentColor]);

  if (children) {
    return (
      <div
        className={`template2-background-wrapper ${className}`}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1024 / 1536',
          backgroundImage: `url("${svgDataUri}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`template2-background-container absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <img
        src={svgDataUri}
        alt=""
        draggable={false}
        className="w-full h-full block object-cover select-none pointer-events-none"
      />
    </div>
  );
};

export default Template2Background;
