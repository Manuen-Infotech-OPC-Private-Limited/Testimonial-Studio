import React, { useEffect, useRef } from 'react';
import { GRID_CELL, GRID_H, GRID_HEX, GRID_W, TOP_LEFT_RIBBON } from './template1-background-data';
import type { RGB, TopLeftRibbon } from './template1-background-types';
import Template1BottomWaveSvg from './Template1BottomWaveSvg';
import { hexToRgb, rgbToHsl, hslToRgb } from '../../utils/colorUtils';
import './TestimonialBackground.css';

interface TestimonialBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  photoUrl?: string;
  onPhotoClick?: () => void;
  primaryColor?: string;
  goldColor?: string;
  bgTopColor?: string;
  bgSideColor?: string;
}

const TL_CANVAS_W = 300;
const TL_CANVAS_H = 160;
const TL_SUPERSAMPLE = 3;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function getWashTargetRgb(explicitColor: string | undefined, fallbackHex: string, defaultExplicitHex: string, satCap: number) {
  if (explicitColor && explicitColor.toLowerCase() !== defaultExplicitHex.toLowerCase()) {
    return hexToRgb(explicitColor);
  }
  const rgb = hexToRgb(fallbackHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToRgb(hsl.h, Math.min(satCap, hsl.s), 0.84);
}

function blendRgb(fromR: number, fromG: number, fromB: number, to: { r: number; g: number; b: number }, t: number): [number, number, number] {
  return [
    Math.round(fromR * (1 - t) + to.r * t),
    Math.round(fromG * (1 - t) + to.g * t),
    Math.round(fromB * (1 - t) + to.b * t),
  ];
}

function recolorCornerPixel(r: number, g: number, b: number, primaryHex: string): [number, number, number] {
  const targetRgb = hexToRgb(primaryHex);
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
  const lOrig = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const lNew = Math.max(0.02, Math.min(0.88, targetHsl.l * (lOrig / 0.16)));
  const outRgb = hslToRgb(targetHsl.h, targetHsl.s, lNew);

  if (r > 30) {
    const blend = Math.min(1, (r - 30) / 90);
    return [
      Math.round(outRgb.r * (1 - blend) + 250 * blend),
      Math.round(outRgb.g * (1 - blend) + 248 * blend),
      Math.round(outRgb.b * (1 - blend) + 244 * blend),
    ];
  }
  return [outRgb.r, outRgb.g, outRgb.b];
}

function recolorRibbonSample(rgb: RGB, goldHex: string): RGB {
  const targetRgb = hexToRgb(goldHex);
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
  const lOrig = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  const lNew = Math.max(0.04, Math.min(0.96, targetHsl.l * (lOrig / 0.62)));
  const outRgb = hslToRgb(targetHsl.h, targetHsl.s, lNew);

  let rOut = outRgb.r;
  let gOut = outRgb.g;
  let bOut = outRgb.b;

  if (lOrig > 0.78) {
    const spec = Math.min(1, (lOrig - 0.78) / 0.22);
    rOut = Math.round(rOut * (1 - spec) + 255 * spec);
    gOut = Math.round(gOut * (1 - spec) + 255 * spec);
    bOut = Math.round(bOut * (1 - spec) + 235 * spec);
  }
  return [rOut, gOut, bOut];
}

function drawField(
  canvas: HTMLCanvasElement,
  primaryColor?: string,
  goldColor?: string,
  bgTopColor?: string,
  bgSideColor?: string
): void {
  const small = document.createElement('canvas');
  small.width = GRID_W;
  small.height = GRID_H;
  const sctx = small.getContext('2d');
  const ctx = canvas.getContext('2d');
  if (sctx === null || ctx === null) {
    return;
  }

  const effectivePrimary = primaryColor || '#0c2b66';
  const effectiveGold = goldColor || '#d4af37';
  const isDefaultPrimary = effectivePrimary.toLowerCase() === '#0c2b66';
  const isDefaultGold = effectiveGold.toLowerCase() === '#d4af37';
  const hasCustomTopWash = Boolean(bgTopColor && bgTopColor.toLowerCase() !== '#afd4fe');
  const hasCustomSideWash = Boolean(bgSideColor && bgSideColor.toLowerCase() !== '#fcdea3');

  const shouldRecolorTopWash = !isDefaultPrimary || hasCustomTopWash;
  const shouldRecolorSideWash = !isDefaultGold || hasCustomSideWash;

  const topWashRgb = shouldRecolorTopWash
    ? getWashTargetRgb(bgTopColor, effectivePrimary, '#afd4fe', 0.82)
    : null;
  const sideWashRgb = shouldRecolorSideWash
    ? getWashTargetRgb(bgSideColor, effectiveGold, '#fcdea3', 0.9)
    : null;

  const img = sctx.createImageData(GRID_W, GRID_H);
  const px = img.data;
  for (let i = 0; i < GRID_W * GRID_H; i++) {
    let r = parseInt(GRID_HEX.substr(i * 6, 2), 16);
    let g = parseInt(GRID_HEX.substr(i * 6 + 2, 2), 16);
    let b = parseInt(GRID_HEX.substr(i * 6 + 4, 2), 16);

    if (!isDefaultPrimary || shouldRecolorTopWash || shouldRecolorSideWash) {
      const gx = i % GRID_W;
      const gy = Math.floor(i / GRID_W);

      if (!isDefaultPrimary && gx < 15 && gy < 12 && b > 85 && r < 120) {
        const [nr, ng, nb] = recolorCornerPixel(r, g, b, effectivePrimary);
        r = nr;
        g = ng;
        b = nb;
      } else if (Math.max(r, g, b) - Math.min(r, g, b) > 3) {
        const hsl = rgbToHsl(r, g, b);
        if (topWashRgb && b > r && hsl.h >= 170 && hsl.h <= 260) {
          const t = clamp((255 - Math.min(r, g, b)) / 83, 0, 1);
          [r, g, b] = blendRgb(253, 252, 250, topWashRgb, t);
        } else if (sideWashRgb && r >= b && hsl.h >= 15 && hsl.h <= 70) {
          const t = clamp((255 - Math.min(r, g, b)) / 92, 0, 1);
          [r, g, b] = blendRgb(253, 252, 250, sideWashRgb, t);
        }
      }
    }

    px[i * 4] = r;
    px[i * 4 + 1] = g;
    px[i * 4 + 2] = b;
    px[i * 4 + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, GRID_W, GRID_H, 0, 0, GRID_W * GRID_CELL, GRID_H * GRID_CELL);
}

function drawTopLeftRibbon(canvas: HTMLCanvasElement, data: TopLeftRibbon, goldColor?: string): void {
  const SC = TL_SUPERSAMPLE;
  const { n: N, g: G, h: H, ks: KS, j1: J1, j2: J2, prof: P } = data;
  const rows = N.length;
  const keyCount = P.length;

  const isDefaultGold = !goldColor || goldColor.toLowerCase() === '#d4af37';

  canvas.width = TL_CANVAS_W * SC;
  canvas.height = TL_CANVAS_H * SC;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }
  const image = ctx.createImageData(canvas.width, canvas.height);
  const out = image.data;

  const interp = (arr: readonly number[], y: number): number => {
    const t = clamp(y - 0.5, 0, rows - 1);
    const i = Math.floor(t);
    const f = t - i;
    const i2 = Math.min(i + 1, rows - 1);
    return arr[i] * (1 - f) + arr[i2] * f;
  };

  const sample = (y: number, segment: 0 | 1, u: number): RGB => {
    const count = segment === 1 ? J2 : J1;
    const offset = segment === 1 ? J1 : 0;
    const q = clamp(u * count - 0.5, 0, count - 1);
    const j0 = Math.floor(q);
    const jf = q - j0;
    const j1 = Math.min(j0 + 1, count - 1);

    const kf = clamp((y - 0.5) / KS, 0, keyCount - 1);
    const k0 = Math.floor(kf);
    const kk = kf - k0;
    const k1 = Math.min(k0 + 1, keyCount - 1);

    const rgb: RGB = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      const a = P[k0][offset + j0][c] * (1 - jf) + P[k0][offset + j1][c] * jf;
      const b = P[k1][offset + j0][c] * (1 - jf) + P[k1][offset + j1][c] * jf;
      rgb[c] = a * (1 - kk) + b * kk;
    }
    return rgb;
  };

  for (let sy = 0; sy < rows * SC; sy++) {
    const y = (sy + 0.5) / SC;
    const n = interp(N, y);
    const g = interp(G, y);
    const h = interp(H, y);

    for (let sx = 0; sx < TL_CANVAS_W * SC; sx++) {
      const x = (sx + 0.5) / SC;
      if (x < n - 0.5 || x > h + 0.5) {
        continue;
      }

      let rgb =
        x <= g
          ? sample(y, 0, (x - n) / Math.max(g - n, 0.001))
          : sample(y, 1, (x - g) / Math.max(h - g, 0.001));

      if (!isDefaultGold) {
        rgb = recolorRibbonSample(rgb, goldColor);
      }

      let alpha = 1;
      if (x < n) {
        alpha = Math.max(0, 1 - (n - x) * SC * 0.9);
      }
      if (x > h) {
        alpha = Math.min(alpha, Math.max(0, 1 - (x - h) * SC));
      }

      const i = (sy * canvas.width + sx) * 4;
      out[i] = rgb[0];
      out[i + 1] = rgb[1];
      out[i + 2] = rgb[2];
      out[i + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
}

export const TestimonialBackground: React.FC<TestimonialBackgroundProps> = ({
  className = '',
  style = {},
  photoUrl,
  onPhotoClick,
  primaryColor,
  goldColor,
  bgTopColor,
  bgSideColor,
}) => {
  const fieldRef = useRef<HTMLCanvasElement | null>(null);
  const tlRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fieldRef.current) {
      drawField(fieldRef.current, primaryColor, goldColor, bgTopColor, bgSideColor);
    }
    if (tlRef.current) {
      drawTopLeftRibbon(tlRef.current, TOP_LEFT_RIBBON, goldColor);
    }
  }, [primaryColor, goldColor, bgTopColor, bgSideColor]);

  return (
    <div
      className={`testimonial-background-container ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Layer 1: Smooth Ivory and Pale-Blue Wash Field */}
      <canvas
        ref={fieldRef}
        width={682}
        height={1024}
        className="testimonial-field-canvas"
      />

      {/* Layer 2: Vector Bottom Wave Ribbons with Integrated Showcase Photo */}
      <Template1BottomWaveSvg
        className="testimonial-background-svg"
        photoUrl={photoUrl}
        onPhotoClick={onPhotoClick}
        primaryColor={primaryColor}
        goldColor={goldColor}
      />

      {/* Layer 3: Anti-aliased Upper-Left Gold & Navy Ribbon */}
      <canvas
        ref={tlRef}
        className="testimonial-tl-canvas"
      />
    </div>
  );
};

export default TestimonialBackground;
