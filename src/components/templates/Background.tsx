import React from 'react';
import { getBackgroundSvg } from './backgroundSvg';

interface BackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Full-page background. The 1024 x 1536 artwork is scaled to cover its
 * container, so content can be layered on top via `children`.
 */
const Background: React.FC<BackgroundProps> = ({ className, style, children }) => {
  const svg = getBackgroundSvg();
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1024 / 1536',
        backgroundImage: url,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Background;
