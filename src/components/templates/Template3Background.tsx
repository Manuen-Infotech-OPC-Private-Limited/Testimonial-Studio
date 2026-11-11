import React, { useMemo } from 'react';
import { getBackgroundSvg } from './backgroundSvg';
import './Template3Background.css';

interface Template3BackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  primaryColor?: string;
  goldColor?: string;
}

/**
 * High-fidelity vector SVG background for Template 3 (Corporate Classic).
 * Extracted from files.zip (backgroundSvg.ts + Background.tsx).
 * Features:
 * - 1024 x 1536 design resolution (2:3 portrait aspect ratio)
 * - Navy swooshes with polished multi-stop metallic gold ribbons (top-left, bottom-left, bottom-right)
 * - Soft gold core highlights with Gaussian blur
 * - Detailed subtle watercolor officer/shield watermark in bottom-right
 * - Fully supports dynamic color theming!
 */
export const Template3Background: React.FC<Template3BackgroundProps> = ({
  className = '',
  style = {},
  children,
  primaryColor,
  goldColor,
}) => {
  const svgDataUri = useMemo(() => {
    const svg = getBackgroundSvg({ primaryColor, goldColor });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [primaryColor, goldColor]);

  if (children) {
    return (
      <div
        className={`template3-background-wrapper ${className}`}
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
      className={`template3-background-container absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
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

export default Template3Background;
