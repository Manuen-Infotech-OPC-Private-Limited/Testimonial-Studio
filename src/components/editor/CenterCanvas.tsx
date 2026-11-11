// @ts-nocheck
import React, { useCallback, useEffect, useRef } from 'react';
import { Minus, Plus, CheckCircle2, CloudOff, Loader2 } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { Template1LuxuryGold } from '../templates/Template1LuxuryGold';
import { Template2ElegantMinimal } from '../templates/Template2ElegantMinimal';
import { Template3CorporateClassic } from '../templates/Template3CorporateClassic';

interface CenterCanvasProps {
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export const CenterCanvas: React.FC<CenterCanvasProps> = ({
  selectedElementId,
  onSelectElement,
}) => {
  const {
    activeDesign,
    activeTemplateId,
    zoomLevel,
    setZoomLevel,
    setSelectedObject,
    isSaving,
    isNewUnsaved,
    hasUnsavedChanges,
    storageError,
  } = useStudioStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const hasManualZoomRef = useRef(false);

  const computeFitZoom = useCallback((containerWidth: number) => {
    const horizontalPadding = containerWidth < 640 ? 24 : containerWidth < 1024 ? 48 : 64;
    const rawFit = (containerWidth - horizontalPadding) / 800;
    return Math.min(0.75, Math.max(0.28, Math.floor(rawFit * 100) / 100));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const applyAutoFit = () => {
      if (el.clientWidth > 0 && !hasManualZoomRef.current) {
        setZoomLevel(computeFitZoom(el.clientWidth));
      }
    };

    applyAutoFit();

    const observer = new ResizeObserver(applyAutoFit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [computeFitZoom, setZoomLevel]);

  if (!activeDesign) {
    return (
      <div className="flex-1 flex flex-col h-full w-full items-center justify-center bg-[#EEF2F8] text-slate-500 space-y-2.5 select-none">
        <Loader2 className="w-5 h-5 animate-spin text-[#0F2D6B]" />
        <span className="text-xs font-medium">Loading design...</span>
      </div>
    );
  }

  const handleZoom = (delta: number) => {
    hasManualZoomRef.current = true;
    const next = Math.min(1.5, Math.max(0.25, Number((zoomLevel + delta).toFixed(2))));
    setZoomLevel(next);
  };

  const handleFitToScreen = () => {
    hasManualZoomRef.current = false;
    const el = containerRef.current;
    if (el && el.clientWidth > 0) {
      setZoomLevel(computeFitZoom(el.clientWidth));
    } else {
      setZoomLevel(0.75);
    }
  };

  const handleElementClick = (elementId: string) => {
    onSelectElement(elementId);
    const data = activeDesign.data;
    const fontSizes = data.styling.fontSizes || {};
    let text = '';
    let fontSize = 24;
    let fontFamily = data.styling.headingFont || 'Spectral';
    const textColors = data.styling.textColors || {};
    let fill = textColors[elementId.replace('content.', '').replace('author.', '')] || data.styling.primaryColor || '#173D7A';

    if (elementId.includes('subheading')) {
      text = data.content.subheading || '';
      fontSize = fontSizes.subheading || 16;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.subheading || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('heading')) {
      text = data.content.heading || 'Testimonial';
      fontSize = fontSizes.heading || (activeTemplateId === 'template-1' ? 28 : 60);
      fontFamily = (activeTemplateId === 'template-1' ? data.styling.headingFont : data.styling.scriptFont) || 'Spectral';
      fill = textColors.heading || (activeTemplateId === 'template-1' ? '#FFFFFF' : (data.styling.headingColor || data.styling.primaryColor || '#102D63'));
    } else if (elementId.includes('quotes')) {
      text = '“ ”';
      fontSize = fontSizes.quotes || 96;
      fontFamily = 'Georgia';
      fill = textColors.quotes || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('bodyText')) {
      text = data.content.bodyText || '';
      fontSize = fontSizes.bodyText || data.styling.bodyFontSize || 19;
      fontFamily = data.styling.bodyFont || 'Spectral';
      fill = textColors.bodyText || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('recommendationTitle')) {
      text = data.content.recommendationTitle || '';
      fontSize = fontSizes.recommendationTitle || 14;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.recommendationTitle || '#FFFFFF';
    } else if (elementId.includes('recommendationHighlight') || elementId === 'content.recommendation') {
      text = data.content.recommendationHighlight || '';
      fontSize = fontSizes.recommendationHighlight || 30;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.recommendationHighlight || data.styling.goldColor || '#D4AF37';
    } else if (elementId.includes('recommendationSubtitle')) {
      text = data.content.recommendationSubtitle || '';
      fontSize = fontSizes.recommendationSubtitle || 14;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.recommendationSubtitle || '#E2E8F0';
    } else if (elementId.includes('bestWishesText')) {
      text = data.content.bestWishesText || '';
      fontSize = fontSizes.bestWishesText || 16;
      fontFamily = data.styling.bodyFont || 'Spectral';
      fill = textColors.bestWishesText || '#1e293b';
    } else if (elementId.includes('thankYouHeading') || elementId === 'content.thankYou') {
      text = data.content.thankYouHeading || 'Thank you';
      fontSize = fontSizes.thankYouHeading || 60;
      fontFamily = data.styling.scriptFont || 'Great Vibes';
      fill = textColors.thankYouHeading || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('thankYouSubtitle')) {
      text = data.content.thankYouSubtitle || '';
      fontSize = fontSizes.thankYouSubtitle || 18;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.thankYouSubtitle || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('author.role')) {
      text = data.author.role || '';
      fontSize = fontSizes.authorRole || 16;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.authorRole || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('author.company')) {
      text = data.author.company || '';
      fontSize = fontSizes.authorCompany || 19;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.authorCompany || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('author.date')) {
      text = data.author.date || '';
      fontSize = fontSizes.authorDate || 16;
      fontFamily = data.styling.headingFont || 'Spectral';
      fill = textColors.authorDate || data.styling.primaryColor || '#173D7A';
    } else if (elementId.includes('author.name') || elementId.includes('author.details')) {
      text = data.author.name || '';
      fontSize = fontSizes.authorName || (activeTemplateId === 'template-1' ? 32 : 24);
      fontFamily = activeTemplateId === 'template-1' ? (data.styling.scriptFont || 'Alex Brush') : (data.styling.headingFont || 'Spectral');
      fill = textColors.authorName || data.styling.primaryColor || '#173D7A';
    }

    // Only automatically pop file chooser if the item is currently empty
    if (elementId === 'header.leftLogo' && !data.header.leftLogoUrl) {
      window.dispatchEvent(new CustomEvent('studio:upload-left-logo'));
    } else if (elementId === 'header.rightLogo' && !data.header.rightLogoUrl) {
      window.dispatchEvent(new CustomEvent('studio:upload-right-logo'));
    } else if (elementId === 'author.signature' && !data.author.signatureUrl) {
      window.dispatchEvent(new CustomEvent('studio:upload-signature'));
    } else if (elementId === 'media.supportingPhoto' && !data.media.supportingPhotoUrl) {
      window.dispatchEvent(new CustomEvent('studio:upload-photo'));
    }

    setSelectedObject(elementId, {
      id: elementId,
      type: 'element',
      text,
      fontSize,
      fontFamily,
      fill,
      fontWeight: 'bold',
      textAlign: 'center',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#F4F6FB] select-none">
      {/* Top Canvas Bar: Live Preview & Zoom */}
      <div className="h-11 px-3 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-xs font-bold text-slate-800 truncate">Live preview</span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Portrait - 1080 × 1350 px
          </span>
        </div>

        {/* Zoom Controls: - 75% + Fit */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/90 rounded-lg px-1.5 sm:px-2 py-0.5 text-xs text-slate-700 font-semibold border border-slate-200 shrink-0">
          <button
            onClick={() => handleZoom(-0.05)}
            className="p-1 hover:bg-white rounded transition-colors text-slate-600"
            title="Zoom out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-9 sm:w-10 text-center font-mono text-[11px]">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.05)}
            className="p-1 hover:bg-white rounded transition-colors text-slate-600"
            title="Zoom in"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleFitToScreen}
            className="px-1.5 py-0.5 text-[10px] font-bold text-[#0F2D6B] hover:bg-white rounded transition-colors border-l border-slate-200/90 ml-0.5"
            title="Fit poster to screen"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        onClick={(e) => {
          if (e.target === containerRef.current) {
            onSelectElement(null);
            setSelectedObject(null, null);
          }
        }}
        className="flex-1 overflow-auto flex items-start justify-center p-3 sm:p-6 md:p-8 bg-[#EEF2F8]"
      >
        <div
          className="mx-auto shrink-0"
          style={{
            width: `${800 * zoomLevel}px`,
            height: `${1200 * zoomLevel}px`,
          }}
        >
          <div
            className="transition-transform duration-100 ease-out origin-top-left shadow-xl rounded-sm border border-slate-200/80 bg-white"
            style={{
              transform: `scale(${zoomLevel})`,
              width: '800px',
              height: '1200px',
            }}
          >
            {/* Target for high-res export */}
            <div id="testimonial-export-target" className="w-[800px] h-[1200px] relative">
              {activeTemplateId === 'template-1' && (
                <Template1LuxuryGold
                  data={activeDesign.data}
                  selectedElementId={selectedElementId}
                  onElementClick={handleElementClick}
                />
              )}
              {activeTemplateId === 'template-2' && (
                <Template2ElegantMinimal
                  data={activeDesign.data}
                  selectedElementId={selectedElementId}
                  onElementClick={handleElementClick}
                />
              )}
              {activeTemplateId === 'template-3' && (
                <Template3CorporateClassic
                  data={activeDesign.data}
                  selectedElementId={selectedElementId}
                  onElementClick={handleElementClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <div className="h-9 px-3 sm:px-6 bg-white border-t border-slate-200/90 flex items-center justify-between gap-2 shrink-0 text-xs text-slate-500">
        <span className="text-[11px] hidden sm:inline">Preview updates as you edit</span>
        {isSaving ? (
          <div className="flex items-center space-x-1.5 text-blue-600 font-semibold text-[11px] truncate">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Saving to MongoDB...</span>
          </div>
        ) : storageError ? (
          <div
            className="flex items-center space-x-1.5 text-rose-600 font-semibold text-[11px] truncate"
            title={storageError}
          >
            <CloudOff className="w-3.5 h-3.5 shrink-0" />
            <span>Save error — check backend</span>
          </div>
        ) : isNewUnsaved ? (
          <div className="flex items-center space-x-1.5 text-amber-600 font-semibold text-[11px] truncate">
            <span className="truncate">Not saved yet — tap Save to add to My projects</span>
          </div>
        ) : hasUnsavedChanges ? (
          <div className="flex items-center space-x-1.5 text-amber-600 font-semibold text-[11px] truncate">
            <span className="truncate">Unsaved changes — tap Save</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold text-[11px] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Saved to MongoDB</span>
          </div>
        )}
      </div>
    </div>
  );
};
