import React, { useId } from 'react';
import { generateMetallicStops, generateRibbonBaseStops, adjustBrightness } from '../../utils/colorUtils';

interface Template1RibbonBannerProps {
  heading?: string;
  onClick?: () => void;
  className?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  primaryColor?: string;
  goldColor?: string;
}

/**
 * Recreates the exact arched royal-blue & metallic-gold ribbon banner
 * with chevron / fishtail ends and flanking double gold rule lines
 * from media_1793865658336_c65bf25d.png.
 * Now fully responsive to dynamic theme color changes!
 */
export const Template1RibbonBanner: React.FC<Template1RibbonBannerProps> = ({
  heading = 'TESTIMONIAL',
  onClick,
  className = '',
  fontFamily,
  fontSize,
  textColor,
  primaryColor = '#0c2b66',
  goldColor = '#D4AF37',
}) => {
  const uid = useId().replace(/:/g, '');
  const goldRibbonId = `t1GoldRibbon-${uid}`;
  const blueBaseId = `t1BlueBase-${uid}`;
  const blueGlowId = `t1BlueGlow-${uid}`;
  const flankLeftId = `t1FlankLeft-${uid}`;
  const flankRightId = `t1FlankRight-${uid}`;
  const ribbonShadowId = `t1RibbonShadow-${uid}`;
  const textShadowId = `t1TextShadow-${uid}`;

  const text = heading || 'TESTIMONIAL';
  // Dynamically compute font size to ensure longer titles stay beautifully centered inside ribbon
  const defaultSize = text.length <= 11 ? 26 : Math.max(16, Math.round((26 * 11) / text.length));
  const finalFontSize = fontSize || defaultSize;

  // Check if using default colors - preserve pristine original gradient stops 100%
  const isDefaultPrimary = primaryColor.toLowerCase() === '#0c2b66';
  const isDefaultGold = goldColor.toLowerCase() === '#d4af37';

  const goldStops = isDefaultGold
    ? [
        { offset: '0%', color: '#7A4D08' },
        { offset: '8%', color: '#B6801A' },
        { offset: '22%', color: '#E2AE38' },
        { offset: '38%', color: '#FDE88E' },
        { offset: '50%', color: '#FFFEEB' },
        { offset: '62%', color: '#FDE88E' },
        { offset: '78%', color: '#E2AE38' },
        { offset: '92%', color: '#B6801A' },
        { offset: '100%', color: '#7A4D08' },
      ]
    : generateMetallicStops(goldColor);

  const baseStops = isDefaultPrimary
    ? [
        { offset: '0%', color: '#00184E' },
        { offset: '15%', color: '#002978' },
        { offset: '35%', color: '#0242A6' },
        { offset: '50%', color: '#0A5CD4' },
        { offset: '65%', color: '#0242A6' },
        { offset: '85%', color: '#002978' },
        { offset: '100%', color: '#00184E' },
      ]
    : generateRibbonBaseStops(primaryColor);

  const glowCenter = isDefaultPrimary ? '#3094FF' : adjustBrightness(primaryColor, 0.5);
  const glowMid = isDefaultPrimary ? '#0C62DD' : adjustBrightness(primaryColor, 0.2);
  const glowOuter = isDefaultPrimary ? '#003598' : primaryColor;
  const glowEdge = isDefaultPrimary ? '#001C5E' : adjustBrightness(primaryColor, -0.4);

  const flankEdge = isDefaultGold ? '#CCA046' : adjustBrightness(goldColor, -0.15);
  const flankBright = isDefaultGold ? '#E5BD58' : adjustBrightness(goldColor, 0.25);

  return (
    <div
      onClick={onClick}
      className={`relative w-full max-w-[580px] flex items-center justify-center select-none cursor-pointer ${className}`}
      title="Click to edit heading"
    >
      <svg
        viewBox="0 0 540 82"
        className="w-full h-auto drop-shadow-md overflow-visible"
        style={{ maxHeight: '90px' }}
      >
        <defs>
          {/* Metallic Gold Gradient for Top & Bottom Ribbon Borders */}
          <linearGradient id={goldRibbonId} x1="0%" y1="0%" x2="100%" y2="0%">
            {goldStops.map((stop, idx) => (
              <stop key={idx} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Deep Royal / Navy Blue Base Gradient */}
          <linearGradient id={blueBaseId} x1="0%" y1="0%" x2="100%" y2="0%">
            {baseStops.map((stop, idx) => (
              <stop key={idx} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Vibrant Center Radial Specular Sheen */}
          <radialGradient id={blueGlowId} cx="50%" cy="45%" r="48%">
            <stop offset="0%" stopColor={glowCenter} stopOpacity="0.9" />
            <stop offset="30%" stopColor={glowMid} stopOpacity="0.6" />
            <stop offset="60%" stopColor={glowOuter} stopOpacity="0.2" />
            <stop offset="100%" stopColor={glowEdge} stopOpacity="0" />
          </radialGradient>

          {/* Left Flanking Gold Double Rule Gradient */}
          <linearGradient id={flankLeftId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={flankEdge} stopOpacity="0" />
            <stop offset="30%" stopColor={flankEdge} stopOpacity="0.5" />
            <stop offset="100%" stopColor={flankBright} stopOpacity="1" />
          </linearGradient>

          {/* Right Flanking Gold Double Rule Gradient */}
          <linearGradient id={flankRightId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={flankBright} stopOpacity="1" />
            <stop offset="70%" stopColor={flankEdge} stopOpacity="0.5" />
            <stop offset="100%" stopColor={flankEdge} stopOpacity="0" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id={ribbonShadowId} x="-10%" y="-15%" width="120%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#001236" floodOpacity="0.32" />
          </filter>
          <filter id={textShadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000F2E" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Left Flanking Double Gold Accent Lines */}
        <line x1="2" y1="39.5" x2="54" y2="39.5" stroke={`url(#${flankLeftId})`} strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="44.5" x2="54" y2="44.5" stroke={`url(#${flankLeftId})`} strokeWidth="2" strokeLinecap="round" />

        {/* Right Flanking Double Gold Accent Lines */}
        <line x1="486" y1="39.5" x2="538" y2="39.5" stroke={`url(#${flankRightId})`} strokeWidth="2" strokeLinecap="round" />
        <line x1="486" y1="44.5" x2="538" y2="44.5" stroke={`url(#${flankRightId})`} strokeWidth="2" strokeLinecap="round" />

        {/* Ribbon Group with Shadow */}
        <g filter={`url(#${ribbonShadowId})`}>
          {/* Base Navy/Royal Blue Arched Ribbon */}
          <path
            d="M 60,24 C 110,16 200,15 270,15 C 340,15 430,16 480,24 L 464,42 L 480,68 C 430,65 340,65 270,65 C 200,65 110,65 60,68 L 76,42 Z"
            fill={`url(#${blueBaseId})`}
          />

          {/* Center Vivid Specular Glow Overlay */}
          <path
            d="M 60,24 C 110,16 200,15 270,15 C 340,15 430,16 480,24 L 464,42 L 480,68 C 430,65 340,65 270,65 C 200,65 110,65 60,68 L 76,42 Z"
            fill={`url(#${blueGlowId})`}
          />

          {/* Left Fishtail Notch Gold Border */}
          <path
            d="M 60,68 L 76,42 L 60,24"
            fill="none"
            stroke={`url(#${goldRibbonId})`}
            strokeWidth="3.2"
            strokeLinejoin="miter"
            strokeLinecap="round"
          />

          {/* Right Fishtail Notch Gold Border */}
          <path
            d="M 480,24 L 464,42 L 480,68"
            fill="none"
            stroke={`url(#${goldRibbonId})`}
            strokeWidth="3.2"
            strokeLinejoin="miter"
            strokeLinecap="round"
          />

          {/* Top Arched Metallic Gold Border Ribbon */}
          <path
            d="M 60,24 C 110,16 200,15 270,15 C 340,15 430,16 480,24"
            fill="none"
            stroke={`url(#${goldRibbonId})`}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Top Edge White-Gold Specular Highlight Line */}
          <path
            d="M 120,18.5 C 190,16.5 270,16.5 350,17.5"
            fill="none"
            stroke="#FFFEE8"
            strokeWidth="1.2"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />

          {/* Bottom Arched Metallic Gold Border Ribbon */}
          <path
            d="M 60,68 C 110,65 200,65 270,65 C 340,65 430,65 480,68"
            fill="none"
            stroke={`url(#${goldRibbonId})`}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Bottom Edge White-Gold Specular Highlight Line */}
          <path
            d="M 120,66.5 C 190,65.5 270,65.5 350,66.5"
            fill="none"
            stroke="#FFFEE8"
            strokeWidth="1.2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
        </g>

        {/* Crisp Heading Typography */}
        <text
          x="270"
          y="49.5"
          textAnchor="middle"
          fill={textColor || '#FFFFFF'}
          fontFamily={fontFamily ? `'${fontFamily}', Georgia, serif` : "'Spectral', 'Cinzel', 'Playfair Display', Georgia, serif"}
          fontWeight="800"
          fontSize={finalFontSize}
          letterSpacing="0.16em"
          filter={`url(#${textShadowId})`}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default Template1RibbonBanner;

