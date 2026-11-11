/**
 * Color manipulation & harmonic gradient generation utilities
 * Supports dynamic color theming across all testimonial templates
 * while preserving 100% pixel-perfect initial default colors.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface PalettePreset {
  id: string;
  name: string;
  primaryColor: string;
  goldColor: string;
  accentColor?: string;
  headingColor?: string;
  description: string;
}

export const TEMPLATE_DEFAULT_PALETTES: Record<string, { primaryColor: string; goldColor: string; accentColor?: string; headingColor?: string }> = {
  'template-1': {
    primaryColor: '#0c2b66',
    goldColor: '#D4AF37',
    accentColor: '#1e40af',
    headingColor: '#0c2b66',
  },
  'template-2': {
    primaryColor: '#122c60',
    goldColor: '#cca242',
    accentColor: '#7a2e1d',
    headingColor: '#122c60',
  },
  'template-3': {
    primaryColor: '#0e2b5d',
    goldColor: '#cf9d38',
    accentColor: '#1e3a8a',
    headingColor: '#0e2b5d',
  },
};

export const LUXURY_PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'royal-navy-gold',
    name: 'Royal Navy & Gold',
    primaryColor: '#0c2b66',
    goldColor: '#D4AF37',
    accentColor: '#7A1E28',
    description: 'Classic luxury navy blue with polished metallic gold ribbons',
  },
  {
    id: 'emerald-champagne',
    name: 'Emerald & Champagne',
    primaryColor: '#0A3B2A',
    goldColor: '#D4B86A',
    accentColor: '#14532D',
    description: 'Deep jewel emerald green paired with champagne gold sheen',
  },
  {
    id: 'imperial-ruby-gold',
    name: 'Imperial Ruby & Gold',
    primaryColor: '#4A0E17',
    goldColor: '#E5B74D',
    accentColor: '#7A1B28',
    description: 'Opulent deep crimson ruby with rich radiant warm gold',
  },
  {
    id: 'midnight-onyx-silver',
    name: 'Midnight Onyx & Silver',
    primaryColor: '#181A1E',
    goldColor: '#BFC6D0',
    accentColor: '#303640',
    description: 'Ultra-modern deep obsidian charcoal with platinum chrome silver',
  },
  {
    id: 'royal-plum-rosegold',
    name: 'Royal Plum & Rose Gold',
    primaryColor: '#321435',
    goldColor: '#E2A77A',
    accentColor: '#5E2750',
    description: 'Regal dark amethyst plum with warm blushing rose gold ribbons',
  },
  {
    id: 'sapphire-amber',
    name: 'Sapphire & Amber',
    primaryColor: '#0B2545',
    goldColor: '#E6A122',
    accentColor: '#134074',
    description: 'Vivid corporate sapphire blue with warm amber gold highlights',
  },
];

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function sanitizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

export function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) {
    return { r: 12, g: 43, b: 102 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h = (h % 360 + 360) % 360;
  h /= 360;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Adjust lightness of a hex color by a percentage (-1 to +1)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (percent > 0) {
    hsl.l = hsl.l + (1 - hsl.l) * percent;
  } else {
    hsl.l = hsl.l * (1 + percent);
  }
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Linearly interpolate between two hex colors
 */
export function interpolateHex(hex1: string, hex2: string, factor: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = c1.r + (c2.r - c1.r) * factor;
  const g = c1.g + (c2.g - c1.g) * factor;
  const b = c1.b + (c2.b - c1.b) * factor;
  return rgbToHex(r, g, b);
}

/**
 * Generates specular harmonic gradient stops for metallic ribbons (e.g. Gold, Rose Gold, Silver)
 */
export function generateMetallicStops(accentHex: string): Array<{ offset: string; color: string }> {
  const rgb = hexToRgb(accentHex);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const shadow = hslToHex(h, Math.min(1, s * 1.1), Math.max(0.12, l * 0.45));
  const deepMid = hslToHex(h, s, Math.max(0.25, l * 0.75));
  const base = accentHex;
  const highlight = hslToHex(h, Math.min(1, s * 0.85), Math.min(0.92, l * 1.35));
  const specular = hslToHex(h, Math.min(1, s * 0.4), Math.min(0.98, l * 1.65));

  return [
    { offset: '0%', color: shadow },
    { offset: '8%', color: deepMid },
    { offset: '22%', color: base },
    { offset: '38%', color: highlight },
    { offset: '50%', color: specular },
    { offset: '62%', color: highlight },
    { offset: '78%', color: base },
    { offset: '92%', color: deepMid },
    { offset: '100%', color: shadow },
  ];
}

/**
 * Generates royal arched ribbon body gradient stops based on primary color
 */
export function generateRibbonBaseStops(primaryHex: string): Array<{ offset: string; color: string }> {
  const rgb = hexToRgb(primaryHex);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const darkFlank = hslToHex(h, Math.min(1, s * 1.15), Math.max(0.08, l * 0.4));
  const midFlank = hslToHex(h, Math.min(1, s * 1.05), Math.max(0.15, l * 0.65));
  const centerBody = hslToHex(h, s, Math.min(0.7, l * 1.15));
  const centerCrest = hslToHex(h, Math.min(1, s * 0.95), Math.min(0.85, l * 1.45));

  return [
    { offset: '0%', color: darkFlank },
    { offset: '15%', color: midFlank },
    { offset: '35%', color: centerBody },
    { offset: '50%', color: centerCrest },
    { offset: '65%', color: centerBody },
    { offset: '85%', color: midFlank },
    { offset: '100%', color: darkFlank },
  ];
}

