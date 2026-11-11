import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Minus,
  Plus,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { TemplateId } from '../../types/studio';
import {
  LUXURY_PALETTE_PRESETS,
  TEMPLATE_DEFAULT_PALETTES,
  hexToRgb,
  rgbToHsl,
  hslToHex,
} from '../../utils/colorUtils';

function deriveWashHex(baseHex: string, defaultBaseHex: string, defaultWashHex: string, satCap: number): string {
  if (baseHex.toLowerCase() === defaultBaseHex.toLowerCase()) {
    return defaultWashHex;
  }
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, Math.min(satCap, hsl.s), 0.84);
}

interface ThemeColorRowProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ThemeColorRow: React.FC<ThemeColorRowProps> = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <label className="block text-[11px] font-semibold text-slate-700">{label}</label>
    <div className="flex items-center space-x-2">
      <label
        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 shadow-sm shrink-0 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value.startsWith('#') && value.length === 7 ? value : '#0c2b66'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 font-medium uppercase"
      />
    </div>
  </div>
);

interface FieldOption {
  key: string;
  label: string;
  elementId: string;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  isScript?: boolean;
}

const TEMPLATE_FIELDS_CONFIG: Record<TemplateId, FieldOption[]> = {
  'template-1': [
    { key: 'heading', label: 'Testimonial heading', elementId: 'content.heading', defaultSize: 28, minSize: 14, maxSize: 90 },
    { key: 'bodyText', label: 'Testimonial description', elementId: 'content.bodyText', defaultSize: 19, minSize: 12, maxSize: 48 },
    { key: 'authorRole', label: 'Role / Department', elementId: 'author.role', defaultSize: 16, minSize: 10, maxSize: 40 },
    { key: 'authorCompany', label: 'Company name', elementId: 'author.company', defaultSize: 19, minSize: 10, maxSize: 50 },
    { key: 'recommendationTitle', label: 'Badge title', elementId: 'content.recommendationTitle', defaultSize: 14, minSize: 10, maxSize: 36 },
    { key: 'recommendationHighlight', label: 'Badge highlight / venue', elementId: 'content.recommendationHighlight', defaultSize: 30, minSize: 16, maxSize: 72 },
    { key: 'recommendationSubtitle', label: 'Badge subtitle', elementId: 'content.recommendationSubtitle', defaultSize: 14, minSize: 10, maxSize: 36 },
    { key: 'bestWishesText', label: 'Best wishes message', elementId: 'content.bestWishesText', defaultSize: 16, minSize: 10, maxSize: 44 },
  ],
  'template-2': [
    { key: 'heading', label: 'Testimonial heading', elementId: 'content.heading', defaultSize: 60, minSize: 20, maxSize: 100, isScript: true },
    { key: 'bodyText', label: 'Testimonial description', elementId: 'content.bodyText', defaultSize: 19, minSize: 12, maxSize: 48 },
    { key: 'quotes', label: 'Quotation marks (“ ”)', elementId: 'content.quotes', defaultSize: 96, minSize: 40, maxSize: 160 },
    { key: 'authorName', label: 'Customer name', elementId: 'author.name', defaultSize: 24, minSize: 14, maxSize: 60 },
    { key: 'authorCompany', label: 'Company name', elementId: 'author.company', defaultSize: 18, minSize: 10, maxSize: 48 },
    { key: 'authorDate', label: 'Date', elementId: 'author.date', defaultSize: 16, minSize: 10, maxSize: 36 },
    { key: 'thankYouHeading', label: 'Thank you heading', elementId: 'content.thankYouHeading', defaultSize: 60, minSize: 24, maxSize: 120, isScript: true },
    { key: 'thankYouSubtitle', label: 'Thank you subtitle', elementId: 'content.thankYouSubtitle', defaultSize: 18, minSize: 10, maxSize: 44 },
  ],
  'template-3': [
    { key: 'heading', label: 'Testimonial heading', elementId: 'content.heading', defaultSize: 60, minSize: 20, maxSize: 100, isScript: true },
    { key: 'subheading', label: 'Subheading / Context', elementId: 'content.subheading', defaultSize: 16, minSize: 10, maxSize: 44 },
    { key: 'bodyText', label: 'Testimonial description', elementId: 'content.bodyText', defaultSize: 19, minSize: 12, maxSize: 48 },
    { key: 'quotes', label: 'Quotation marks (“ ”)', elementId: 'content.quotes', defaultSize: 96, minSize: 40, maxSize: 160 },
    { key: 'authorName', label: 'Customer name', elementId: 'author.name', defaultSize: 24, minSize: 14, maxSize: 60 },
    { key: 'authorCompany', label: 'Company name', elementId: 'author.company', defaultSize: 18, minSize: 10, maxSize: 48 },
    { key: 'authorDate', label: 'Date', elementId: 'author.date', defaultSize: 16, minSize: 10, maxSize: 36 },
    { key: 'thankYouHeading', label: 'Thank you heading', elementId: 'content.thankYouHeading', defaultSize: 60, minSize: 24, maxSize: 120, isScript: true },
    { key: 'thankYouSubtitle', label: 'Thank you subtitle', elementId: 'content.thankYouSubtitle', defaultSize: 18, minSize: 10, maxSize: 44 },
  ],
};

export const RightPanel: React.FC = () => {
  const {
    selectedObjectId,
    selectedProperties,
    updateSelectedProperties,
    activeDesign,
    activeTemplateId,
    updateStyling,
    updateHeader,
    updateAuthor,
    updateFontSize,
    updateTextColor,
    setSelectedObject,
  } = useStudioStore();

  const [fieldOverride, setFieldOverride] = useState<string | null>(null);

  // Reset override whenever canvas selection changes
  useEffect(() => {
    setFieldOverride(null);
  }, [selectedObjectId]);

  if (!activeDesign) return null;

  const { styling, header, author } = activeDesign.data;
  const fontSizes = styling.fontSizes || {};
  const textColors = styling.textColors || {};

  const isLeftLogo = selectedObjectId?.includes('leftLogo');
  const isRightLogo = selectedObjectId?.includes('rightLogo');
  const isLogo = isLeftLogo || isRightLogo;
  const isSignature = selectedObjectId?.includes('signature');

  const currentTemplateFields = TEMPLATE_FIELDS_CONFIG[activeTemplateId] || TEMPLATE_FIELDS_CONFIG['template-1'];

  // Map selected object ID to a field key
  const getFieldKeyFromId = (id: string | null): string => {
    if (!id) return currentTemplateFields[0]?.key || 'heading';
    if (id.includes('subheading')) return 'subheading';
    if (id.includes('quotes')) return 'quotes';
    if (id.includes('heading')) return 'heading';
    if (id.includes('bodyText')) return 'bodyText';
    if (id.includes('recommendationTitle')) return 'recommendationTitle';
    if (id.includes('recommendationHighlight') || id === 'content.recommendation') return 'recommendationHighlight';
    if (id.includes('recommendationSubtitle')) return 'recommendationSubtitle';
    if (id.includes('bestWishesText')) return 'bestWishesText';
    if (id.includes('thankYouHeading') || id === 'content.thankYou') return 'thankYouHeading';
    if (id.includes('thankYouSubtitle')) return 'thankYouSubtitle';
    if (id.includes('author.role')) return 'authorRole';
    if (id.includes('author.company')) return 'authorCompany';
    if (id.includes('author.date')) return 'authorDate';
    if (id.includes('author.name') || id.includes('author.details')) return 'authorName';
    return currentTemplateFields[0]?.key || 'heading';
  };

  const activeFieldKey = fieldOverride || getFieldKeyFromId(selectedObjectId);
  const activeFieldConfig =
    currentTemplateFields.find((f) => f.key === activeFieldKey) || currentTemplateFields[0];

  const currentFieldFontSize =
    fontSizes[activeFieldKey] ??
    (activeFieldKey === 'heading' && activeTemplateId === 'template-1' && styling.headingFontSize
      ? styling.headingFontSize
      : activeFieldKey === 'bodyText' && styling.bodyFontSize
      ? styling.bodyFontSize
      : activeFieldConfig.defaultSize);

  const isScriptElement =
    activeFieldConfig.isScript ||
    activeFieldKey === 'thankYouHeading' ||
    (activeFieldKey === 'heading' && (activeTemplateId === 'template-2' || activeTemplateId === 'template-3')) ||
    (activeFieldKey === 'authorName' && activeTemplateId === 'template-1');

  const currentFontFamily =
    selectedProperties?.fontFamily ||
    (isScriptElement ? styling.scriptFont : styling.headingFont) ||
    'Spectral';

  const currentTextColor =
    textColors[activeFieldKey] ||
    (activeFieldKey === 'heading' && activeTemplateId === 'template-1'
      ? '#FFFFFF'
      : activeFieldKey === 'heading'
      ? (styling.headingColor || styling.primaryColor || '#102D63')
      : selectedProperties?.fill ||
        styling.primaryColor ||
        '#173D7A');

  const handleFieldChange = (newKey: string) => {
    setFieldOverride(newKey);
    const target = currentTemplateFields.find((f) => f.key === newKey);
    if (target) {
      const defaultFieldColor =
        newKey === 'heading' && activeTemplateId === 'template-1'
          ? '#FFFFFF'
          : newKey === 'heading'
          ? (styling.headingColor || styling.primaryColor || '#102D63')
          : styling.primaryColor || '#173D7A';

      setSelectedObject(target.elementId, {
        id: target.elementId,
        type: 'element',
        fontSize: fontSizes[newKey] ?? target.defaultSize,
        fontFamily: target.isScript ? (styling.scriptFont || 'Alex Brush') : (styling.headingFont || 'Spectral'),
        fill: textColors[newKey] || defaultFieldColor,
      });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const clamped = Math.max(activeFieldConfig.minSize, Math.min(activeFieldConfig.maxSize, newSize));
    updateFontSize(activeFieldKey, clamped);
    updateSelectedProperties({ fontSize: clamped });

    if (activeFieldKey === 'heading' && activeTemplateId === 'template-1') {
      updateStyling({ headingFontSize: clamped });
    } else if (activeFieldKey === 'bodyText') {
      updateStyling({ bodyFontSize: clamped });
    }
  };

  const handleStepFontSize = (delta: number) => {
    handleFontSizeChange(currentFieldFontSize + delta);
  };

  const handleFontSizeInput = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      handleFontSizeChange(num);
    }
  };

  const handleFontChange = (font: string) => {
    updateSelectedProperties({ fontFamily: font });
    if (isScriptElement) {
      updateStyling({ scriptFont: font });
    } else if (activeFieldKey === 'bodyText') {
      updateStyling({ bodyFont: font });
    } else {
      updateStyling({ headingFont: font });
    }
  };

  const handleColorChange = (hex: string) => {
    updateSelectedProperties({ fill: hex });
    updateTextColor(activeFieldKey, hex);
    if (activeFieldKey === 'heading' && activeTemplateId !== 'template-1') {
      updateStyling({ headingColor: hex });
    }
  };

  // Logo size management
  const currentLogoSize = isLeftLogo
    ? header.leftLogoSize || 80
    : header.rightLogoSize || (activeTemplateId === 'template-3' ? 95 : 80);

  const handleLogoSizeChange = (size: number) => {
    if (isLeftLogo) {
      updateHeader({ leftLogoSize: size });
    } else if (isRightLogo) {
      updateHeader({ rightLogoSize: size });
    }
  };

  const currentSigSize = author.signatureSize || 55;

  return (
    <aside className="w-full lg:w-[250px] xl:w-[270px] h-full bg-white lg:border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto select-none shadow-sm z-10 text-slate-800 p-4 sm:p-5 space-y-6">
      {/* SECTION 1: PROPERTIES HEADER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Properties</h3>
          <span className="text-[10px] font-semibold text-[#0F2D6B] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {activeTemplateId === 'template-1'
              ? 'Luxury Gold'
              : activeTemplateId === 'template-2'
              ? 'Elegant Minimal'
              : 'Corporate Classic'}
          </span>
        </div>

        {/* LOGO PROPERTIES (Shown when Left or Right Logo is selected) */}
        {isLogo ? (
          <div className="space-y-4 pt-1">
            <div className="bg-[#E8F0FE] text-[#1967D2] text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center">
              <span>Selected: {isLeftLogo ? 'Left Logo' : 'Right Logo'}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span>Logo height</span>
                <span className="font-mono font-bold text-[#0F2D6B]">{currentLogoSize} px</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="2"
                value={currentLogoSize}
                onChange={(e) => handleLogoSizeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
              />
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[60, 80, 110, 140].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleLogoSizeChange(sz)}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      currentLogoSize === sz
                        ? 'bg-[#0F2D6B] text-white border-[#0F2D6B]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent(isLeftLogo ? 'studio:upload-left-logo' : 'studio:upload-right-logo')
                  );
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-50 text-[#0F2D6B] hover:bg-blue-100/80 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace logo file</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isLeftLogo) updateHeader({ leftLogoUrl: '' });
                  else updateHeader({ rightLogoUrl: '' });
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove logo</span>
              </button>
            </div>
          </div>
        ) : isSignature ? (
          /* SIGNATURE PROPERTIES (Shown when Signature is selected) */
          <div className="space-y-4 pt-1">
            <div className="bg-[#E8F0FE] text-[#1967D2] text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center">
              <span>Selected: Signature</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span>Signature height</span>
                <span className="font-mono font-bold text-[#0F2D6B]">{currentSigSize} px</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="2"
                value={currentSigSize}
                onChange={(e) => updateAuthor({ signatureSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
              />
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[40, 55, 75, 95].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateAuthor({ signatureSize: sz })}
                    className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      currentSigSize === sz
                        ? 'bg-[#0F2D6B] text-white border-[#0F2D6B]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('studio:upload-signature'))}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-50 text-[#0F2D6B] hover:bg-blue-100/80 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace signature</span>
              </button>

              <button
                type="button"
                onClick={() => updateAuthor({ signatureUrl: '' })}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove signature</span>
              </button>
            </div>
          </div>
        ) : (
          /* FIELD TYPOGRAPHY & FONT SIZE CONTROLS */
          <div className="space-y-4">
            {/* Field Selector Dropdown */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                Field to format
              </label>
              <select
                value={activeFieldKey}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
              >
                {currentTemplateFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* FONT SIZE CONTROLS FOR ACTIVE FIELD */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">
                  Font size
                </label>
                <span className="font-mono text-xs font-bold text-[#0F2D6B] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {currentFieldFontSize} px
                </span>
              </div>

              {/* Slider for smooth live sizing */}
              <input
                type="range"
                min={activeFieldConfig.minSize}
                max={activeFieldConfig.maxSize}
                step="1"
                value={currentFieldFontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
              />

              {/* Stepper with Numeric Input */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStepFontSize(-1)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
                  title="Decrease font size"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={`${currentFieldFontSize} px`}
                    onChange={(e) => handleFontSizeInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-center rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleStepFontSize(1)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
                  title="Increase font size"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Stepper Presets */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[-4, -2].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleStepFontSize(delta)}
                    className="py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {delta}px
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(activeFieldConfig.defaultSize)}
                  title={`Reset to default (${activeFieldConfig.defaultSize}px)`}
                  className="py-1 flex items-center justify-center text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                  Def
                </button>
                {[2, 4].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleStepFontSize(delta)}
                    className="py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    +{delta}px
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-700">Font family</label>
              <select
                value={currentFontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
              >
                <option value="Spectral">Spectral (Default)</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Inter">Inter</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Great Vibes">Great Vibes (Script)</option>
                <option value="Alex Brush">Alex Brush (Calligraphy)</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Cinzel">Cinzel (Roman Serif)</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            {/* Text / Heading Color */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-700">
                {activeFieldKey === 'heading'
                  ? activeTemplateId === 'template-1'
                    ? 'Heading text color'
                    : 'Heading color'
                  : 'Text color'}
              </label>
              <div className="flex items-center space-x-2">
                <label
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 shadow-sm shrink-0 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: currentTextColor }}
                >
                  <input
                    type="color"
                    value={
                      currentTextColor.startsWith('#')
                        ? currentTextColor
                        : activeFieldKey === 'heading' && activeTemplateId === 'template-1'
                        ? '#FFFFFF'
                        : '#173D7A'
                    }
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                </label>
                <input
                  type="text"
                  value={currentTextColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 font-medium uppercase"
                />
              </div>
            </div>

            {/* In Template 1, also allow changing Ribbon Banner color directly when Heading is selected */}
            {activeFieldKey === 'heading' && activeTemplateId === 'template-1' && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Ribbon banner color
                </label>
                <div className="flex items-center space-x-2">
                  <label
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 shadow-sm shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundColor:
                        styling.headingColor ||
                        styling.primaryColor ||
                        '#0c2b66',
                    }}
                  >
                    <input
                      type="color"
                      value={
                        styling.headingColor ||
                        styling.primaryColor ||
                        '#0c2b66'
                      }
                      onChange={(e) => updateStyling({ headingColor: e.target.value })}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <input
                    type="text"
                    value={
                      styling.headingColor ||
                      styling.primaryColor ||
                      '#0c2b66'
                    }
                    onChange={(e) => updateStyling({ headingColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 font-medium uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: TEMPLATE THEME COLORS */}
      <div className="pt-4 border-t border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">Template Colors</h4>
          </div>
          <button
            type="button"
            onClick={() => {
              const defaults = TEMPLATE_DEFAULT_PALETTES[activeTemplateId] || TEMPLATE_DEFAULT_PALETTES['template-1'];
              updateStyling({
                primaryColor: defaults.primaryColor,
                headingColor: defaults.headingColor || defaults.primaryColor,
                goldColor: defaults.goldColor,
                accentColor: defaults.accentColor,
                bgTopColor: undefined,
                bgSideColor: undefined,
              });
            }}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 transition-colors"
            title="Reset template colors to default"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        <ThemeColorRow
          label="Primary Theme"
          value={
            styling.primaryColor ||
            (TEMPLATE_DEFAULT_PALETTES[activeTemplateId]?.primaryColor || '#0c2b66')
          }
          onChange={(hex) => updateStyling({ primaryColor: hex, bgTopColor: undefined })}
        />

        <ThemeColorRow
          label={activeTemplateId === 'template-1' ? 'Heading / Ribbon' : 'Heading Color'}
          value={
            styling.headingColor ||
            styling.primaryColor ||
            (TEMPLATE_DEFAULT_PALETTES[activeTemplateId]?.headingColor || '#0c2b66')
          }
          onChange={(hex) => updateStyling({ headingColor: hex })}
        />

        <ThemeColorRow
          label="Gold / Metallic Accent"
          value={
            styling.goldColor ||
            (TEMPLATE_DEFAULT_PALETTES[activeTemplateId]?.goldColor || '#d4af37')
          }
          onChange={(hex) => updateStyling({ goldColor: hex, bgSideColor: undefined })}
        />

        {activeTemplateId === 'template-1' && (
          <>
            <ThemeColorRow
              label="Bg Top Glow (Light Blue)"
              value={
                styling.bgTopColor ||
                deriveWashHex(
                  styling.primaryColor || '#0c2b66',
                  '#0c2b66',
                  '#AFD4FE',
                  0.82
                )
              }
              onChange={(hex) => updateStyling({ bgTopColor: hex })}
            />
            <ThemeColorRow
              label="Bg Side Glow (Light Gold)"
              value={
                styling.bgSideColor ||
                deriveWashHex(
                  styling.goldColor || '#d4af37',
                  '#d4af37',
                  '#FCDEA3',
                  0.9
                )
              }
              onChange={(hex) => updateStyling({ bgSideColor: hex })}
            />
          </>
        )}

        {activeTemplateId === 'template-2' && (
          <ThemeColorRow
            label="Secondary Accent"
            value={styling.accentColor || '#7a2e1d'}
            onChange={(hex) => updateStyling({ accentColor: hex })}
          />
        )}

        {/* Luxury Curated Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-700">Luxury Palettes</label>
          <div className="grid grid-cols-2 gap-1.5">
            {LUXURY_PALETTE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  updateStyling({
                    primaryColor: preset.primaryColor,
                    headingColor: preset.headingColor || preset.primaryColor,
                    goldColor: preset.goldColor,
                    accentColor: preset.accentColor,
                    bgTopColor: undefined,
                    bgSideColor: undefined,
                  });
                }}
                className="flex items-center space-x-1.5 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left group"
                title={preset.description}
              >
                <div className="flex -space-x-1 shrink-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: preset.goldColor }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-700 truncate group-hover:text-slate-900 leading-tight">
                  {preset.name.split('&')[0].trim()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
