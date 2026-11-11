import React from 'react';
import { Upload } from 'lucide-react';
import { TemplateData } from '../../types/studio';
import Template2Background from './Template2Background';

export { default as Template2Background } from './Template2Background';

interface Template2Props {
  data: TemplateData;
  isExporting?: boolean;
  onElementClick?: (elementId: string) => void;
  selectedElementId?: string | null;
}

export const Template2ElegantMinimal: React.FC<Template2Props> = ({
  data,
  isExporting = false,
  onElementClick,
  selectedElementId,
}) => {
  const { header, content, author, styling } = data;
  const leftLogoHeight = header.leftLogoSize || 85;
  const rightLogoHeight = header.rightLogoSize || 85;
  const fontSizes = styling.fontSizes || {};
  const textColors = styling.textColors || {};
  const quoteSize = fontSizes.quotes || 96;

  const getTextColor = (fieldKey: string, fallback: string = styling.primaryColor || '#102D63') => {
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
    if (length < 120) return { fontSize: '25px', lineHeight: '1.8' };
    if (length < 240) return { fontSize: '23px', lineHeight: '1.78' };
    if (length < 420) return { fontSize: '21px', lineHeight: '1.75' };
    if (length < 620) return { fontSize: '19px', lineHeight: '1.72' };
    return { fontSize: '17px', lineHeight: '1.65' };
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
      id="testimonial-template-2"
      className="relative w-[800px] h-[1200px] overflow-hidden select-none bg-[#FFFEFC] text-slate-800 shadow-2xl"
      style={{
        width: '800px',
        height: '1200px',
        minWidth: '800px',
        minHeight: '1200px',
        fontFamily: fontHeading,
      }}
    >
      {/* Pure Vector Decorative Background Plate */}
      <Template2Background
        primaryColor={styling.primaryColor}
        goldColor={styling.goldColor}
        accentColor={styling.accentColor}
      />

      {/* Header logos - Fixed height row so changing logo size NEVER moves the heading or other sections */}
      <div
        className="relative z-10 px-16 flex items-center justify-between shrink-0"
        style={{ height: '110px', minHeight: '110px', maxHeight: '110px', paddingTop: '20px' }}
      >
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
              className="object-contain transition-all duration-150"
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
              className="object-contain transition-all duration-150"
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

      {/* Testimonial heading */}
      <div className="relative z-10 mt-6 px-14 flex items-center justify-center gap-6">
        <div
          className="flex-1 max-w-[140px] h-[3px] rounded-full"
          style={{ background: `linear-gradient(to right, transparent, ${styling.goldColor || '#CCA242'})` }}
        />

        <div
          onClick={() => onElementClick?.('content.heading')}
          className={`px-4 py-1 text-center ${getElementClass('content.heading')}`}
        >
          <span
            className="italic"
            style={{
              fontFamily: fontScript,
              fontWeight: 700,
              fontSize: fontSizes.heading ? `${fontSizes.heading}px` : '60px',
              color: getTextColor('heading', '#102D63'),
            }}
          >
            {content.heading}
          </span>
        </div>

        <div
          className="flex-1 max-w-[140px] h-[3px] rounded-full"
          style={{ background: `linear-gradient(to left, transparent, ${styling.goldColor || '#CCA242'})` }}
        />
      </div>

      {/* Testimonial text */}
      <div className="relative z-10 mt-8 px-16">
        <div
          onClick={() => onElementClick?.('content.bodyText')}
          className={`relative p-6 ${getElementClass('content.bodyText')}`}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              onElementClick?.('content.quotes');
            }}
            className={`absolute -top-7 -left-3 font-serif leading-none cursor-pointer rounded ${getElementClass('content.quotes')}`}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: `${quoteSize}px`,
              lineHeight: '0.75',
              color: getTextColor('quotes', '#102D63'),
            }}
          >
            “
          </span>

          <div
            className="font-normal text-left pl-6 pr-4"
            style={{
              fontFamily: fontBody,
              ...bodyTypography,
              fontSize: fontSizes.bodyText ? `${fontSizes.bodyText}px` : bodyTypography.fontSize,
              color: getTextColor('bodyText', '#102D63'),
            }}
          >
            <div className="space-y-3.5">
              {(content.bodyText || '')
                .split('\n\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line text-left">
                    {para}
                  </p>
                ))}
            </div>
          </div>

          <div className="flex justify-end mt-1 pr-2">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onElementClick?.('content.quotes');
              }}
              className={`font-serif leading-none cursor-pointer rounded ${getElementClass('content.quotes')}`}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: `${quoteSize}px`,
                lineHeight: '0.75',
                color: getTextColor('quotes', '#102D63'),
              }}
            >
              ”
            </span>
          </div>
        </div>
      </div>

      {/* Customer details */}
      <div className="relative z-10 mt-6 px-20">
        <div
          onClick={() => onElementClick?.('author.details')}
          className={`p-3 max-w-sm ${getElementClass('author.details')}`}
          style={{ fontFamily: fontHeading }}
        >
          <div
            className="w-14 h-[4px] mb-3 rounded-full"
            style={{ backgroundColor: styling.goldColor || '#CCA242' }}
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
              color: getTextColor('authorName', '#102D63'),
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
              color: getTextColor('authorCompany', '#102D63'),
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
              color: getTextColor('authorDate', '#102D63'),
            }}
          >
            {author.date}
          </p>
        </div>
      </div>

      {/* Thank-you section */}
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
              className={`italic cursor-pointer rounded px-1 ${getElementClass('content.thankYouHeading')}`}
              style={{
                fontFamily: fontScript,
                fontWeight: 700,
                fontSize: fontSizes.thankYouHeading ? `${fontSizes.thankYouHeading}px` : '60px',
                color: getTextColor('thankYouHeading', '#102D63'),
              }}
            >
              {content.thankYouHeading || 'Thank you'}
            </span>

            <svg
              className="absolute -bottom-1 left-2 w-[110%] h-[12px] pointer-events-none"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 8 C55 12 145 9 195 2"
                stroke={styling.goldColor || '#CCA242'}
                strokeWidth="3"
                strokeLinecap="round"
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
              color: getTextColor('thankYouSubtitle', '#102D63'),
            }}
          >
            {content.thankYouSubtitle || 'for your trust and support!'}
          </p>
        </div>
      </div>
    </div>
  );
};