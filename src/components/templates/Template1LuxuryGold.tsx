import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { TemplateData } from '../../types/studio';
import TestimonialBackground from './TestimonialBackground';
import Template1RibbonBanner from './Template1RibbonBanner';
import { adjustBrightness } from '../../utils/colorUtils';

export { default as TestimonialBackground } from './TestimonialBackground';
export { default as Template1RibbonBanner } from './Template1RibbonBanner';

interface Template1Props {
  data: TemplateData;
  isExporting?: boolean;
  onElementClick?: (elementId: string) => void;
  selectedElementId?: string | null;
}

export const Template1LuxuryGold: React.FC<Template1Props> = ({
  data,
  isExporting = false,
  onElementClick,
  selectedElementId,
}) => {
  const { header, content, author, media, styling } = data;
  const leftLogoHeight = header.leftLogoSize || 80;
  const rightLogoHeight = header.rightLogoSize || 80;
  const signatureHeight = author.signatureSize || 58;

  const fontHeading = styling.headingFont ? `'${styling.headingFont}', Georgia, serif` : "'Spectral', Georgia, serif";
  const fontBody = styling.bodyFont ? `'${styling.bodyFont}', Georgia, serif` : fontHeading;
  const fontSizes = styling.fontSizes || {};
  const textColors = styling.textColors || {};

  const getTextColor = (fieldKey: string, fallback: string = styling.primaryColor || '#0c2b66') => {
    return textColors[fieldKey] || styling.primaryColor || fallback;
  };

  const isDefaultPrimary = (styling.primaryColor || '#0c2b66').toLowerCase() === '#0c2b66';
  const isDefaultGold = (styling.goldColor || '#d4af37').toLowerCase() === '#d4af37';
  const badgePrimaryBg = isDefaultPrimary
    ? 'linear-gradient(to bottom, #092252, #041638)'
    : `linear-gradient(to bottom, ${styling.primaryColor}, ${adjustBrightness(styling.primaryColor, -0.45)})`;
  const badgeBorderColor = isDefaultGold ? '#D4AF37' : styling.goldColor;
  const badgeRingColor = isDefaultGold ? 'rgba(241, 216, 126, 0.7)' : `${adjustBrightness(styling.goldColor, 0.2)}B3`;
  const badgeInnerBorder = isDefaultGold ? 'rgba(204, 162, 68, 0.4)' : `${styling.goldColor}66`;
  const badgeStarColor = isDefaultGold ? '#FFDE59' : adjustBrightness(styling.goldColor, 0.25);
  const badgeHighlightColor = textColors.recommendationHighlight || badgeStarColor;

  // Dynamically compute body typography to fill the vertical space without empty gaps
  const getAdaptiveBodyTypography = (text: string, customSize?: number) => {
    if (customSize) {
      return {
        fontSize: `${customSize}px`,
        lineHeight: customSize >= 25 ? '1.85' : '1.75',
      };
    }

    const raw = (text || '').trim();
    const length = raw.length;

    if (length < 150) {
      return {
        fontSize: '29px',
        lineHeight: '1.95',
      };
    }
    if (length < 320) {
      return {
        fontSize: '25.5px',
        lineHeight: '1.85',
      };
    }
    if (length < 520) {
      return {
        fontSize: '22.5px',
        lineHeight: '1.8',
      };
    }
    if (length < 750) {
      return {
        fontSize: '19.5px',
        lineHeight: '1.72',
      };
    }
    return {
      fontSize: '17px',
      lineHeight: '1.65',
    };
  };

  const bodyTypography = getAdaptiveBodyTypography(content.bodyText, styling.bodyFontSize);

  const getElementClass = (id: string) => {
    if (isExporting) return '';
    const isSelected = selectedElementId === id;

    return `cursor-pointer transition-all duration-150 rounded ${isSelected
      ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30'
      : 'hover:outline hover:outline-1 hover:outline-amber-400 hover:bg-amber-50/20'
      }`;
  };

  return (
    <div
      id="testimonial-template-1"
      className="testimonial-poster relative w-[800px] h-[1200px] overflow-hidden select-none bg-[#fffdf7] text-slate-800 shadow-2xl"
      style={{
        width: '800px',
        height: '1200px',
        minWidth: '800px',
        minHeight: '1200px',
        fontFamily: fontHeading,
      }}
    >
      {/* Background decoration with seamless vector wave and showcase photo */}
      <TestimonialBackground
        photoUrl={media.supportingPhotoUrl}
        onPhotoClick={() => onElementClick?.('media.supportingPhoto')}
        primaryColor={styling.primaryColor}
        goldColor={styling.goldColor}
        bgTopColor={styling.bgTopColor}
        bgSideColor={styling.bgSideColor}
      />

      {/* Main template content */}
      <div className="testimonial-content relative z-10 w-full h-full flex flex-col pt-6 pb-4">
        {/* Top: Header & Logos + Ribbon banner */}
        <div className="shrink-0">
          {/* Logo slots - Fixed height row so changing logo size NEVER moves the ribbon or other sections */}
          <div
            className="px-12 flex items-center justify-between shrink-0"
            style={{ height: '110px', minHeight: '110px', maxHeight: '110px' }}
          >
            <div
              onClick={() => onElementClick?.('header.leftLogo')}
              className={`flex items-center justify-center p-1 ml-10 ${getElementClass(
                'header.leftLogo'
              )}`}
              style={{ maxWidth: `${Math.max(320, leftLogoHeight * 4)}px` }}
            >
              {header.leftLogoUrl ? (
                <img
                  src={header.leftLogoUrl}
                  alt={header.leftLogoLabel || 'Left Logo'}
                  style={{
                    height: `${leftLogoHeight}px`,
                    width: 'auto',
                    maxHeight: `${leftLogoHeight}px`,
                    maxWidth: `${Math.max(320, leftLogoHeight * 4)}px`,
                  }}
                  className="object-contain drop-shadow transition-all duration-150"
                />
              ) : !isExporting ? (
                <div
                  className="border-2 border-dashed border-amber-300/80 rounded-xl px-4 py-2 flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50/50 backdrop-blur-sm shadow-sm"
                  style={{ minHeight: '52px' }}
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ Add Left Logo</span>
                </div>
              ) : null}
            </div>

            {header.showDivider && (
              <div
                className="w-[1.5px] mx-4 self-center"
                style={{
                  height: '50px',
                  background: `linear-gradient(to bottom, transparent, ${badgeBorderColor}, transparent)`,
                }}
              />
            )}

            <div
              onClick={() => onElementClick?.('header.rightLogo')}
              className={`flex items-center justify-center p-1 mr-6 ${getElementClass(
                'header.rightLogo'
              )}`}
              style={{ maxWidth: `${Math.max(320, rightLogoHeight * 4)}px` }}
            >
              {header.rightLogoUrl ? (
                <img
                  src={header.rightLogoUrl}
                  alt={header.rightLogoLabel || 'Right Logo'}
                  style={{
                    height: `${rightLogoHeight}px`,
                    width: 'auto',
                    maxHeight: `${rightLogoHeight}px`,
                    maxWidth: `${Math.max(320, rightLogoHeight * 4)}px`,
                  }}
                  className="object-contain drop-shadow transition-all duration-150"
                />
              ) : !isExporting ? (
                <div
                  className="border-2 border-dashed border-amber-300/80 rounded-xl px-4 py-2 flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50/50 backdrop-blur-sm shadow-sm"
                  style={{ minHeight: '52px' }}
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ Add Right Logo</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Testimonial arched ribbon banner with flanking double rules */}
          <div className="w-full px-6 flex justify-center items-center mt-2 mb-1">
            <Template1RibbonBanner
              heading={content.heading || 'TESTIMONIAL'}
              fontFamily={styling.headingFont}
              fontSize={fontSizes.heading}
              textColor={textColors.heading}
              primaryColor={styling.headingColor || styling.primaryColor}
              goldColor={styling.goldColor}
              onClick={() => onElementClick?.('content.heading')}
              className={getElementClass('content.heading')}
            />
          </div>
        </div>

        {/* Content Flow Section: Body Text -> Recommendation Badge -> Best Wishes -> Signature & Author Details */}
        {/* Uses natural top-down flow so bottom fields move up dynamically when content is short */}
        <div className="flex-1 flex flex-col justify-start items-center px-12 pt-5 min-h-0">
          {/* Testimonial body text */}
          <div
            onClick={() => onElementClick?.('content.bodyText')}
            className={`w-full max-w-[720px] px-2 text-center cursor-pointer ${getElementClass('content.bodyText')}`}
            style={{
              fontFamily: fontBody,
              ...bodyTypography,
              fontSize: fontSizes.bodyText ? `${fontSizes.bodyText}px` : bodyTypography.fontSize,
              color: getTextColor('bodyText', '#1e293b'),
            }}
          >
            <div className="space-y-3.5">
              {(content.bodyText || '')
                .split('\n\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line text-center">
                    {para}
                  </p>
                ))}
            </div>
          </div>

          {/* Lower: Recommendation Badge and Best Wishes */}
          <div className="w-full space-y-3 px-2 mt-6">
            <div>
              <div
                onClick={() => onElementClick?.('content.recommendation')}
                className={`relative rounded-2xl p-4 text-center shadow-xl border-2 ${getElementClass(
                  'content.recommendation'
                )}`}
                style={{
                  background: badgePrimaryBg,
                  borderColor: badgeBorderColor,
                  boxShadow: `0 0 0 1px ${badgeRingColor}, 0 20px 25px -5px rgba(0, 0, 0, 0.25)`,
                }}
              >
                <div
                  className="absolute inset-1.5 rounded-xl border pointer-events-none"
                  style={{ borderColor: badgeInnerBorder }}
                />

                <div className="flex items-center justify-between px-6">
                  <span className="text-3xl select-none" style={{ color: badgeStarColor }}>★</span>
                  <div className="flex-1 px-4 space-y-0.5">
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementClick?.('content.recommendationTitle');
                      }}
                      className={`font-semibold tracking-wider uppercase mb-1 cursor-pointer rounded px-1 ${getElementClass('content.recommendationTitle')}`}
                      style={{
                        fontFamily: fontHeading,
                        fontSize: fontSizes.recommendationTitle ? `${fontSizes.recommendationTitle}px` : '14px',
                        color: textColors.recommendationTitle || '#FFFFFF',
                      }}
                    >
                      {content.recommendationTitle || 'I STRONGLY RECOMMEND'}
                    </p>
                    <h2
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementClick?.('content.recommendationHighlight');
                      }}
                      className={`font-extrabold tracking-wide drop-shadow-md cursor-pointer rounded px-1 ${getElementClass('content.recommendationHighlight')}`}
                      style={{
                        fontFamily: fontHeading,
                        fontSize: fontSizes.recommendationHighlight ? `${fontSizes.recommendationHighlight}px` : '30px',
                        color: badgeHighlightColor,
                      }}
                    >
                      {content.recommendationHighlight || 'DOME CASTLE'}
                    </h2>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementClick?.('content.recommendationSubtitle');
                      }}
                      className={`italic mt-1 cursor-pointer rounded px-1 ${getElementClass('content.recommendationSubtitle')}`}
                      style={{
                        fontFamily: fontHeading,
                        fontSize: fontSizes.recommendationSubtitle ? `${fontSizes.recommendationSubtitle}px` : '14px',
                        color: textColors.recommendationSubtitle || '#E2E8F0',
                      }}
                    >
                      {content.recommendationSubtitle ||
                        'to anyone looking for an excellent venue for their celebrations.'}
                    </p>
                  </div>
                  <span className="text-3xl select-none" style={{ color: badgeStarColor }}>★</span>
                </div>
              </div>
            </div>

            {content.bestWishesText && (
              <div className="px-2 text-center">
                <div
                  onClick={() => onElementClick?.('content.bestWishesText')}
                  className={`p-1.5 leading-relaxed font-medium ${getElementClass(
                    'content.bestWishesText'
                  )}`}
                  style={{
                    fontFamily: fontBody,
                    fontSize: fontSizes.bestWishesText ? `${fontSizes.bestWishesText}px` : '16.5px',
                    color: getTextColor('bestWishesText', '#1e293b'),
                  }}
                >
                  <p>{content.bestWishesText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom fields: Signature and author details */}
          <div className="w-full flex items-start px-2 mt-6">
            <div className="z-20 max-w-[340px] text-left">
              <div className="mb-2 inline-flex items-center space-x-2">
                {author.signatureUrl ? (
                  <>
                    <div
                      onClick={() => onElementClick?.('author.signature')}
                      className={`cursor-pointer inline-block ${getElementClass('author.signature')}`}
                      title="Click to select signature"
                    >
                      <img
                        src={author.signatureUrl}
                        alt="Signature"
                        style={{ height: `${signatureHeight}px`, maxHeight: `${signatureHeight}px` }}
                        className="max-w-[280px] object-contain drop-shadow transition-all duration-150"
                      />
                    </div>
                    {!isExporting && (
                      <button
                        type="button"
                        onClick={() => {
                          onElementClick?.('author.signature');
                          window.dispatchEvent(new CustomEvent('studio:upload-signature'));
                        }}
                        className="border border-dashed border-amber-300/90 rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50/70 hover:bg-amber-100 transition-colors shadow-xs"
                        title="Upload new signature image"
                      >
                        Replace
                      </button>
                    )}
                  </>
                ) : !isExporting ? (
                  <div
                    onClick={() => {
                      onElementClick?.('author.signature');
                      window.dispatchEvent(new CustomEvent('studio:upload-signature'));
                    }}
                    className={`border-2 border-dashed border-amber-300/80 rounded-xl px-4 py-2 flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50/50 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-amber-50/80 transition-all ${getElementClass(
                      'author.signature'
                    )}`}
                    style={{ minHeight: `${Math.min(signatureHeight, 52)}px` }}
                    title="Upload signature image"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>+ Upload Signature</span>
                  </div>
                ) : null}
              </div>

              <div
                className="space-y-0.5"
                style={{ fontFamily: fontHeading }}
              >
                <p
                  onClick={() => onElementClick?.('author.role')}
                  className={`font-medium cursor-pointer rounded px-0.5 ${getElementClass('author.role')}`}
                  style={{
                    fontSize: fontSizes.authorRole ? `${fontSizes.authorRole}px` : '16px',
                    color: getTextColor('authorRole', styling.primaryColor || '#0c2b66'),
                  }}
                >
                  {author.role}
                </p>
                <p
                  onClick={() => onElementClick?.('author.company')}
                  className={`font-bold cursor-pointer rounded px-0.5 ${getElementClass('author.company')}`}
                  style={{
                    fontFamily: fontHeading,
                    fontSize: fontSizes.authorCompany ? `${fontSizes.authorCompany}px` : '19px',
                    color: getTextColor('authorCompany', styling.primaryColor || '#0c2b66'),
                  }}
                >
                  {author.company}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting showcase photo upload placeholder (only when empty and not exporting) */}
      {!media.supportingPhotoUrl && !isExporting ? (
        <div
          onClick={() => onElementClick?.('media.supportingPhoto')}
          className="absolute right-8 bottom-8 w-[380px] h-[190px] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50/80 cursor-pointer pointer-events-auto flex flex-col items-center justify-center p-4 text-center z-20"
        >
          <ImageIcon className="w-6 h-6 text-amber-600 mb-1.5" />
          <p className="text-xs font-bold text-amber-900">+ Upload Showcase Photo</p>
          <p className="text-[10px] text-amber-700/80 mt-0.5">(Optional — stays clean if empty)</p>
        </div>
      ) : null}
    </div>
  );
};

export default Template1LuxuryGold;
export { Template1LuxuryGold as TestimonialPoster };