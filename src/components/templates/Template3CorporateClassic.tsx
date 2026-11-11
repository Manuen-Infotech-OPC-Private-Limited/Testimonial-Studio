import React from 'react';
import { Upload } from 'lucide-react';
import { TemplateData } from '../../types/studio';
import Template3Background from './Template3Background';

export { default as Template3Background } from './Template3Background';

interface Template3Props {
  data: TemplateData;
  isExporting?: boolean;
  onElementClick?: (elementId: string) => void;
  selectedElementId?: string | null;
}

export const Template3CorporateClassic: React.FC<Template3Props> = ({
  data,
  isExporting = false,
  onElementClick,
  selectedElementId,
}) => {
  const { header, content, author, media, styling } = data;
  const leftLogoHeight = header.leftLogoSize || 85;
  const rightLogoHeight = header.rightLogoSize || 95;
  const fontSizes = styling.fontSizes || {};
  const textColors = styling.textColors || {};
  const quoteSize = fontSizes.quotes || 96;

  const getTextColor = (fieldKey: string, fallback: string = styling.primaryColor || '#0e2b5d') => {
    if (fieldKey === 'heading') {
      return textColors.heading || styling.headingColor || styling.primaryColor || fallback;
    }
    return textColors[fieldKey] || styling.primaryColor || fallback;
  };

  const fontHeading = styling.headingFont ? `'${styling.headingFont}', Georgia, serif` : "'Spectral', Georgia, serif";
  const fontBody = styling.bodyFont ? `'${styling.bodyFont}', Georgia, serif` : fontHeading;
  const fontScript = styling.scriptFont ? `'${styling.scriptFont}', cursive` : "'Great Vibes', 'Alex Brush', cursive";

  const getAdaptiveBodyTypography = (text: string, customSize?: number) => {
    if (customSize) {
      return {
        fontSize: `${customSize}px`,
        lineHeight: '1.75',
      };
    }
    const length = (text || '').trim().length;
    if (length < 120) return { fontSize: '24px', lineHeight: '1.8' };
    if (length < 240) return { fontSize: '22px', lineHeight: '1.76' };
    if (length < 420) return { fontSize: '20px', lineHeight: '1.72' };
    if (length < 620) return { fontSize: '18px', lineHeight: '1.7' };
    return { fontSize: '16.5px', lineHeight: '1.62' };
  };

  const bodyTypography = getAdaptiveBodyTypography(content.bodyText, styling.bodyFontSize);

  const getElementClass = (id: string) => {
    if (isExporting) return '';
    const isSelected = selectedElementId === id;
    return `cursor-pointer transition-all duration-150 rounded ${
      isSelected
        ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/30'
        : 'hover:outline hover:outline-1 hover:outline-amber-400 hover:bg-amber-50/20'
    }`;
  };

  return (
    <div
      id="testimonial-template-3"
      className="relative w-[800px] h-[1200px] overflow-hidden select-none bg-white text-slate-800 shadow-2xl"
      style={{
        width: '800px',
        height: '1200px',
        minWidth: '800px',
        minHeight: '1200px',
        fontFamily: fontHeading,
      }}
    >
      {/* High-Fidelity Canvas Background */}
      <Template3Background
        primaryColor={styling.primaryColor}
        goldColor={styling.goldColor}
      />

      {/* HEADER: LOGO SLOTS - Fixed height row so changing logo size NEVER moves other sections */}
      <div
        className="relative z-10 px-14 flex items-center justify-between shrink-0"
        style={{ height: '110px', minHeight: '110px', maxHeight: '110px', paddingTop: '20px' }}
      >
        {/* Left Logo Slot */}
        <div
          onClick={() => onElementClick?.('header.leftLogo')}
          className={`flex items-center justify-center p-1 ${getElementClass(
            'header.leftLogo'
          )}`}
          style={{ maxWidth: `${Math.max(320, leftLogoHeight * 4)}px` }}
        >
          {header.leftLogoUrl ? (
            <img
              src={header.leftLogoUrl}
              alt={header.leftLogoLabel}
              style={{
                height: `${leftLogoHeight}px`,
                width: 'auto',
                maxHeight: `${leftLogoHeight}px`,
                maxWidth: `${Math.max(320, leftLogoHeight * 4)}px`,
              }}
              className="object-contain drop-shadow-sm transition-all duration-150"
            />
          ) : !isExporting ? (
            <div
              className="border-2 border-dashed border-amber-300/80 rounded-xl px-4 py-2.5 flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50/40"
              style={{ minHeight: '52px' }}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Add Left Logo</span>
            </div>
          ) : null}
        </div>

        {/* Vertical Divider */}
        {header.showDivider && (
          <div
            className="w-[2px] mx-2 self-center"
            style={{ height: '50px', backgroundColor: styling.goldColor || '#CF9D38' }}
          />
        )}

        {/* Right Logo Slot */}
        <div
          onClick={() => onElementClick?.('header.rightLogo')}
          className={`flex items-center justify-center p-1 ${getElementClass(
            'header.rightLogo'
          )}`}
          style={{ maxWidth: `${Math.max(320, rightLogoHeight * 4)}px` }}
        >
          {header.rightLogoUrl ? (
            <img
              src={header.rightLogoUrl}
              alt={header.rightLogoLabel}
              style={{
                height: `${rightLogoHeight}px`,
                width: 'auto',
                maxHeight: `${rightLogoHeight}px`,
                maxWidth: `${Math.max(320, rightLogoHeight * 4)}px`,
              }}
              className="object-contain drop-shadow-sm transition-all duration-150"
            />
          ) : !isExporting ? (
            <div
              className="border-2 border-dashed border-amber-300/80 rounded-xl px-4 py-2.5 flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50/40"
              style={{ minHeight: '52px' }}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Add Right Logo</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* TITLE SECTION: SCRIPT "Testimonial" + CORPORATE SUBTITLE */}
      <div className="relative z-10 mt-6 px-14 flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-center space-x-6">
          <div
            className="flex-1 max-w-[150px] h-[3px] rounded-full"
            style={{ backgroundColor: styling.goldColor || '#CF9D38' }}
          />
          <div
            onClick={() => onElementClick?.('content.heading')}
            className={`px-4 py-1 text-center ${getElementClass('content.heading')}`}
          >
            <span
              className="italic select-none"
              style={{
                fontFamily: fontScript,
                fontWeight: 700,
                fontSize: fontSizes.heading ? `${fontSizes.heading}px` : '60px',
                color: getTextColor('heading', '#0e2b5d'),
              }}
            >
              {content.heading}
            </span>
          </div>
          <div
            className="flex-1 max-w-[150px] h-[3px] rounded-full"
            style={{ backgroundColor: styling.goldColor || '#CF9D38' }}
          />
        </div>

        {content.subheading && (
          <div
            onClick={() => onElementClick?.('content.subheading')}
            className={`mt-2 text-center ${getElementClass('content.subheading')}`}
          >
            <p
              className="font-bold tracking-[0.08em] uppercase"
              style={{
                fontFamily: fontHeading,
                fontSize: fontSizes.subheading ? `${fontSizes.subheading}px` : '16px',
                color: getTextColor('subheading', '#0e2b5d'),
              }}
            >
              {content.subheading}
            </p>
          </div>
        )}
      </div>

      {/* MAIN TESTIMONIAL QUOTATION BOX */}
      <div className="relative z-10 mt-6 px-12">
        <div
          onClick={() => onElementClick?.('content.bodyText')}
          className={`relative rounded-3xl border-[2.5px] p-8 shadow-sm bg-white/70 backdrop-blur-[1px] ${getElementClass(
            'content.bodyText'
          )}`}
          style={{ borderColor: styling.goldColor || '#CF9D38' }}
        >
          {/* Giant Opening Quote */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('content.quotes');
            }}
            className={`font-serif select-none opacity-95 leading-none block -mt-4 -ml-2 mb-1 cursor-pointer rounded ${getElementClass('content.quotes')}`}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: `${quoteSize}px`,
              lineHeight: '0.75',
              color: getTextColor('quotes', '#0e2b5d'),
            }}
          >
            “
          </span>

          {/* Testimonial Text */}
          <div
            className="font-normal px-3"
            style={{
              fontFamily: fontBody,
              ...bodyTypography,
              fontSize: fontSizes.bodyText ? `${fontSizes.bodyText}px` : bodyTypography.fontSize,
              color: getTextColor('bodyText', '#0e2b5d'),
            }}
          >
            <div className="space-y-3.5">
              {(content.bodyText || '')
                .split('\n\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
            </div>
          </div>

          {/* Giant Closing Quote */}
          <div className="flex justify-end -mb-5 -mr-2">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onElementClick?.('content.quotes');
              }}
              className={`font-serif select-none opacity-95 leading-none cursor-pointer rounded ${getElementClass('content.quotes')}`}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: `${quoteSize}px`,
                lineHeight: '0.75',
                color: getTextColor('quotes', '#0e2b5d'),
              }}
            >
              ”
            </span>
          </div>
        </div>
      </div>

      {/* BACKGROUND WATERMARK (Optional - only rendered if user uploads one) */}
      {media.watermarkUrl && (
        <div className="absolute right-6 bottom-10 w-[380px] h-[440px] pointer-events-none z-0 opacity-15 overflow-hidden">
          <img
            src={media.watermarkUrl}
            alt="Custom Watermark"
            className="w-full h-full object-contain filter grayscale contrast-125"
          />
        </div>
      )}

      {/* CUSTOMER DETAILS */}
      <div className="relative z-10 mt-6 px-16">
        <div
          onClick={() => onElementClick?.('author.details')}
          className={`p-3 max-w-sm ${getElementClass('author.details')}`}
          style={{ fontFamily: fontHeading }}
        >
          <div
            className="w-14 h-[4px] mb-3 rounded-full"
            style={{ backgroundColor: styling.goldColor || '#CF9D38' }}
          />
          <h3
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('author.name');
            }}
            className={`font-extrabold tracking-tight cursor-pointer rounded px-1 ${getElementClass('author.name')}`}
            style={{
              fontFamily: fontHeading,
              fontSize: fontSizes.authorName ? `${fontSizes.authorName}px` : '24px',
              color: getTextColor('authorName', '#0e2b5d'),
            }}
          >
            {author.name}
          </h3>
          <p
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('author.company');
            }}
            className={`font-bold mt-0.5 cursor-pointer rounded px-1 ${getElementClass('author.company')}`}
            style={{
              fontFamily: fontHeading,
              fontSize: fontSizes.authorCompany ? `${fontSizes.authorCompany}px` : '18px',
              color: getTextColor('authorCompany', '#0e2b5d'),
            }}
          >
            {author.company}
          </p>
          <p
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('author.date');
            }}
            className={`mt-1 font-medium cursor-pointer rounded px-1 ${getElementClass('author.date')}`}
            style={{
              fontFamily: fontHeading,
              fontSize: fontSizes.authorDate ? `${fontSizes.authorDate}px` : '16px',
              color: getTextColor('authorDate', '#0e2b5d'),
            }}
          >
            {author.date}
          </p>
        </div>
      </div>

      {/* THANK YOU SECTION */}
      <div className="relative z-10 mt-4 flex flex-col items-center justify-center text-center">
        <div
          onClick={() => onElementClick?.('content.thankYou')}
          className={`p-3 relative ${getElementClass('content.thankYou')}`}
        >
          <div className="relative inline-block">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onElementClick?.('content.thankYouHeading');
              }}
              className={`italic select-none cursor-pointer rounded px-1 ${getElementClass('content.thankYouHeading')}`}
              style={{
                fontFamily: fontScript,
                fontWeight: 700,
                fontSize: fontSizes.thankYouHeading ? `${fontSizes.thankYouHeading}px` : '60px',
                color: getTextColor('thankYouHeading', '#0e2b5d'),
              }}
            >
              {content.thankYouHeading || 'Thank you'}
            </span>

            {/* Golden Brush Underline Arc */}
            <svg
              className="absolute -bottom-1 left-2 w-[110%] h-[12px] pointer-events-none"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 5 6 C 60 11 140 10 195 4 C 140 7 60 8 5 6 Z"
                fill={styling.goldColor || '#CF9D38'}
              />
            </svg>
          </div>

          <p
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('content.thankYouSubtitle');
            }}
            className={`font-semibold tracking-wide mt-3 cursor-pointer rounded px-1 ${getElementClass('content.thankYouSubtitle')}`}
            style={{
              fontFamily: fontHeading,
              fontSize: fontSizes.thankYouSubtitle ? `${fontSizes.thankYouSubtitle}px` : '18px',
              color: getTextColor('thankYouSubtitle', '#0e2b5d'),
            }}
          >
            {content.thankYouSubtitle || 'for your excellent service and support!'}
          </p>
        </div>
      </div>
    </div>
  );
};
