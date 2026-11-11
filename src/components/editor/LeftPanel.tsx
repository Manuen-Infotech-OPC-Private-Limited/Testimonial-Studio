import React, { useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  PenTool,
  Minus,
  Plus,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { useModalStore } from '../../store/useModalStore';
import { TemplateId } from '../../types/studio';
import { readFileAsDataUrl } from '../../utils/imageUtils';

interface LeftPanelProps {
  onOpenCropModal: (imageUrl: string, onComplete: (cropped: string) => void) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onOpenCropModal }) => {
  const {
    activeDesign,
    activeTemplateId,
    switchTemplate,
    updateContent,
    updateAuthor,
    updateHeader,
    updateMedia,
    updateFontSize,
  } = useStudioStore();
  const { showAlert } = useModalStore();

  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openLeft = () => leftLogoInputRef.current?.click();
    const openRight = () => rightLogoInputRef.current?.click();
    const openSig = () => signatureInputRef.current?.click();
    const openPhoto = () => photoInputRef.current?.click();

    window.addEventListener('studio:upload-left-logo', openLeft);
    window.addEventListener('studio:upload-right-logo', openRight);
    window.addEventListener('studio:upload-signature', openSig);
    window.addEventListener('studio:upload-photo', openPhoto);

    return () => {
      window.removeEventListener('studio:upload-left-logo', openLeft);
      window.removeEventListener('studio:upload-right-logo', openRight);
      window.removeEventListener('studio:upload-signature', openSig);
      window.removeEventListener('studio:upload-photo', openPhoto);
    };
  }, []);

  if (!activeDesign) return null;

  const { content, author, header, media, styling } = activeDesign.data;
  const fontSizes = styling.fontSizes || {};

  const renderFontSizeControl = (fieldKey: string, defaultSize: number, minSize = 10, maxSize = 100) => {
    const currentSize =
      fontSizes[fieldKey] ??
      (fieldKey === 'heading' && activeTemplateId === 'template-1' && styling.headingFontSize
        ? styling.headingFontSize
        : fieldKey === 'bodyText' && styling.bodyFontSize
          ? styling.bodyFontSize
          : defaultSize);

    return (
      <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5">
        <button
          type="button"
          onClick={() => {
            const next = Math.max(minSize, currentSize - 1);
            updateFontSize(fieldKey, next);
          }}
          className="p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          title="Decrease font size"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className="text-[10px] font-mono font-bold text-[#0F2D6B] min-w-[28px] text-center">
          {currentSize}px
        </span>
        <button
          type="button"
          onClick={() => {
            const next = Math.min(maxSize, currentSize + 1);
            updateFontSize(fieldKey, next);
          }}
          className="p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          title="Increase font size"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onOpenCropModal(dataUrl, (cropped) => {
        onSuccess(cropped);
      });
    } catch (err) {
      console.error('File read error', err);
      showAlert({
        title: 'Image Upload Error',
        message: 'Failed to read the selected image file. Please try another file.',
        variant: 'warning',
      });
    } finally {
      e.target.value = '';
    }
  };

  const templates: Array<{
    id: TemplateId;
    name: string;
    renderThumb: () => React.ReactNode;
  }> = [
      {
        id: 'template-1',
        name: 'Luxury Gold',
        renderThumb: () => (
          <div className="w-full h-full bg-[#FAF5E9] rounded-md p-1.5 flex flex-col justify-between border border-amber-300 relative overflow-hidden">
            {/* Top Navy bar */}
            <div className="h-2.5 bg-[#0F2D6B] rounded-sm w-full" />
            {/* Center text lines */}
            <div className="space-y-1 my-auto px-1">
              <div className="h-1 bg-amber-400 rounded-full w-2/3 mx-auto" />
              <div className="h-0.5 bg-slate-400 rounded-full w-4/5 mx-auto" />
            </div>
            {/* Bottom Navy bar */}
            <div className="h-2.5 bg-[#0F2D6B] rounded-sm w-full" />
          </div>
        ),
      },
      {
        id: 'template-2',
        name: 'Elegant Minimal',
        renderThumb: () => (
          <div className="w-full h-full bg-white rounded-md p-1.5 flex flex-col justify-between border border-amber-200 relative overflow-hidden">
            {/* Top thin gold border */}
            <div className="h-[2px] bg-gradient-to-r from-amber-400 to-amber-200 rounded-full w-full" />
            {/* Center text lines */}
            <div className="space-y-1 my-auto px-1">
              <div className="h-1 bg-[#0F2D6B] rounded-full w-1/2 mx-auto" />
              <div className="h-0.5 bg-slate-300 rounded-full w-3/4 mx-auto" />
            </div>
            {/* Bottom thin gold border */}
            <div className="h-[2px] bg-gradient-to-r from-amber-200 to-amber-400 rounded-full w-full" />
          </div>
        ),
      },
      {
        id: 'template-3',
        name: 'Corporate Classic',
        renderThumb: () => (
          <div className="w-full h-full bg-white rounded-md p-1.5 flex flex-col justify-between border border-slate-200 relative overflow-hidden">
            {/* Top Navy band */}
            <div className="h-2 bg-[#0F2D6B] rounded-sm w-full" />
            {/* Center Box with gold border */}
            <div className="border border-amber-400 rounded p-1 my-auto bg-amber-50/20">
              <div className="h-0.5 bg-[#0F2D6B] rounded-full w-3/4 mx-auto" />
            </div>
            {/* Bottom Navy band */}
            <div className="h-2 bg-[#0F2D6B] rounded-sm w-full" />
          </div>
        ),
      },
    ];

  return (
    <aside className="w-full lg:w-[280px] xl:w-[310px] h-full bg-white lg:border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto select-none shadow-sm z-10 text-slate-800">
      <div className="p-4 sm:p-5 space-y-6">
        {/* SECTION 1: TEMPLATE */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Template</h3>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {templates.slice(0, 2).map((tmpl) => {
              const isSelected = activeTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => switchTemplate(tmpl.id)}
                  className="cursor-pointer group"
                >
                  <div
                    className={`h-[56px] w-full rounded-xl p-1 transition-all flex items-center justify-center ${isSelected
                        ? 'ring-2 ring-[#0F2D6B] ring-offset-1 border border-transparent shadow-sm'
                        : 'border border-slate-200 hover:border-slate-400 bg-slate-50'
                      }`}
                  >
                    {tmpl.renderThumb()}
                  </div>
                  <p
                    className={`text-[11px] font-semibold mt-1.5 text-center truncate ${isSelected ? 'text-[#0F2D6B]' : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                  >
                    {tmpl.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Third Template (Corporate Classic) */}
          <div className="mt-3 w-1/2 pr-1.5">
            {templates.slice(2, 3).map((tmpl) => {
              const isSelected = activeTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => switchTemplate(tmpl.id)}
                  className="cursor-pointer group"
                >
                  <div
                    className={`h-[56px] w-full rounded-xl p-1 transition-all flex items-center justify-center ${isSelected
                        ? 'ring-2 ring-[#0F2D6B] ring-offset-1 border border-transparent shadow-sm'
                        : 'border border-slate-200 hover:border-slate-400 bg-slate-50'
                      }`}
                  >
                    {tmpl.renderThumb()}
                  </div>
                  <p
                    className={`text-[11px] font-semibold mt-1.5 text-center truncate ${isSelected ? 'text-[#0F2D6B]' : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                  >
                    {tmpl.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: CONTENT & DETAILS */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Content & details</h3>
            <span className="text-[10px] font-semibold text-[#0F2D6B] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {activeTemplateId === 'template-1'
                ? 'Luxury Gold'
                : activeTemplateId === 'template-2'
                  ? 'Elegant Minimal'
                  : 'Corporate Classic'}
            </span>
          </div>

          {/* Testimonial heading */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-slate-600">
                Testimonial heading
              </label>
              {renderFontSizeControl('heading', activeTemplateId === 'template-1' ? 28 : 60, 14, 100)}
            </div>
            <input
              type="text"
              value={content.heading || ''}
              onChange={(e) => updateContent({ heading: e.target.value })}
              placeholder="TESTIMONIAL"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
            />
          </div>

          {/* Testimonial description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-slate-600">
                Testimonial description
              </label>
              {renderFontSizeControl('bodyText', 19, 12, 48)}
            </div>
            <textarea
              rows={4}
              value={content.bodyText || ''}
              onChange={(e) => updateContent({ bodyText: e.target.value })}
              placeholder="The team provided excellent service and professional support throughout the event..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium leading-relaxed resize-none transition-all"
            />
          </div>

          {/* Quotation marks size for Template 2 & 3 */}
          {(activeTemplateId === 'template-2' || activeTemplateId === 'template-3') && (
            <div className="flex items-center justify-between py-1 px-1 bg-slate-50/70 rounded-xl border border-slate-100">
              <label className="block text-[11px] font-medium text-slate-700">
                Quotation marks (“ ”)
              </label>
              {renderFontSizeControl('quotes', 96, 40, 160)}
            </div>
          )}

          {/* Author Details Sub-section */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Customer details
            </p>

            {/* Customer name (Templates 2 & 3 - Template 1 uses Customer Signature) */}
            {activeTemplateId !== 'template-1' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Customer name
                  </label>
                  {renderFontSizeControl('authorName', 24, 14, 60)}
                </div>
                <input
                  type="text"
                  value={author.name || ''}
                  onChange={(e) => updateAuthor({ name: e.target.value })}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>
            )}

            {/* Role / Category (Template 1) */}
            {activeTemplateId === 'template-1' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Role / Department
                  </label>
                  {renderFontSizeControl('authorRole', 16, 10, 40)}
                </div>
                <input
                  type="text"
                  value={author.role || ''}
                  onChange={(e) => updateAuthor({ role: e.target.value })}
                  placeholder="Loans Category,"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>
            )}

            {/* Company name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-medium text-slate-600">
                  Company name
                </label>
                {renderFontSizeControl('authorCompany', 19, 10, 50)}
              </div>
              <input
                type="text"
                value={author.company || ''}
                onChange={(e) => updateAuthor({ company: e.target.value })}
                placeholder="Hari Janardhana Fin Corp."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
              />
            </div>

            {/* Date (for Template 2 & 3) */}
            {(activeTemplateId === 'template-2' || activeTemplateId === 'template-3') && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Date
                  </label>
                  {renderFontSizeControl('authorDate', 16, 10, 36)}
                </div>
                <input
                  type="text"
                  value={author.date || ''}
                  onChange={(e) => updateAuthor({ date: e.target.value })}
                  placeholder="29 October 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>
            )}
          </div>

          {/* TEMPLATE 1 SPECIFIC FIELDS: RECOMMENDATION BADGE & BEST WISHES */}
          {activeTemplateId === 'template-1' && (
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-amber-500 text-xs">★</span>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Recommendation Panel
                </p>
              </div>

              {/* Recommendation Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Badge title
                  </label>
                  {renderFontSizeControl('recommendationTitle', 14, 10, 36)}
                </div>
                <input
                  type="text"
                  value={content.recommendationTitle || ''}
                  onChange={(e) => updateContent({ recommendationTitle: e.target.value })}
                  placeholder="I STRONGLY RECOMMEND"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>

              {/* Recommended venue / entity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Badge highlight / venue
                  </label>
                  {renderFontSizeControl('recommendationHighlight', 30, 16, 72)}
                </div>
                <input
                  type="text"
                  value={content.recommendationHighlight || ''}
                  onChange={(e) => updateContent({ recommendationHighlight: e.target.value })}
                  placeholder="DOME CASTLE"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>

              {/* Recommendation Subtitle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Badge subtitle
                  </label>
                  {renderFontSizeControl('recommendationSubtitle', 14, 10, 36)}
                </div>
                <input
                  type="text"
                  value={content.recommendationSubtitle || ''}
                  onChange={(e) => updateContent({ recommendationSubtitle: e.target.value })}
                  placeholder="to anyone looking for an excellent venue for their celebrations."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>

              {/* Best Wishes Message */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Best wishes message
                  </label>
                  {renderFontSizeControl('bestWishesText', 16, 10, 44)}
                </div>
                <textarea
                  rows={3}
                  value={content.bestWishesText || ''}
                  onChange={(e) => updateContent({ bestWishesText: e.target.value })}
                  placeholder="I extend my best wishes to Sadiq Garu and the entire DOME CASTLE team for continued success and many more achievements."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium leading-relaxed resize-none transition-all"
                />
              </div>
            </div>
          )}

          {/* TEMPLATE 2 & 3 SPECIFIC FIELDS: SUBHEADING & THANK YOU NOTE */}
          {(activeTemplateId === 'template-2' || activeTemplateId === 'template-3') && (
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Closing & appreciation
              </p>

              {activeTemplateId === 'template-3' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Subheading / Context
                    </label>
                    {renderFontSizeControl('subheading', 16, 10, 44)}
                  </div>
                  <input
                    type="text"
                    value={content.subheading || ''}
                    onChange={(e) => updateContent({ subheading: e.target.value })}
                    placeholder="FROM CLIENT TO SERVICE PROVIDER"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Thank you heading
                  </label>
                  {renderFontSizeControl('thankYouHeading', 60, 24, 120)}
                </div>
                <input
                  type="text"
                  value={content.thankYouHeading || ''}
                  onChange={(e) => updateContent({ thankYouHeading: e.target.value })}
                  placeholder="Thank you"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Thank you subtitle
                  </label>
                  {renderFontSizeControl('thankYouSubtitle', 18, 10, 44)}
                </div>
                <input
                  type="text"
                  value={content.thankYouSubtitle || ''}
                  onChange={(e) => updateContent({ thankYouSubtitle: e.target.value })}
                  placeholder="for your trust and support!"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 font-medium transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: IMAGES & LOGOS */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Images & logos</h3>

          {/* Hidden inputs */}
          <input
            ref={leftLogoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFileUpload(e, (url) => {
                updateHeader({ leftLogoUrl: url });
              })
            }
          />

          <input
            ref={rightLogoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFileUpload(e, (url) => {
                updateHeader({ rightLogoUrl: url });
              })
            }
          />

          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFileUpload(e, (url) => {
                updateAuthor({ signatureUrl: url });
              })
            }
          />

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFileUpload(e, (url) => {
                updateMedia({ supportingPhotoUrl: url });
              })
            }
          />

          {/* 1. Left Logo Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-700">Left logo</label>
              {header.leftLogoUrl && (
                <button
                  type="button"
                  onClick={() => updateHeader({ leftLogoUrl: '' })}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div
              onClick={() => leftLogoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
            >
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                {header.leftLogoUrl ? 'Replace left logo' : 'Upload left logo'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG</span>

              {header.leftLogoUrl && (
                <div className="relative mt-2 group/logo flex items-center justify-center">
                  <img
                    src={header.leftLogoUrl}
                    alt="Left logo"
                    className="h-8 max-w-[140px] object-contain rounded bg-white p-1 border shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateHeader({ leftLogoUrl: '' });
                    }}
                    title="Remove left logo"
                    className="absolute -top-1.5 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-sm transition-transform hover:scale-110"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Logo Size Slider */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-slate-600">Logo size</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="2"
                  value={header.leftLogoSize || 80}
                  onChange={(e) => updateHeader({ leftLogoSize: Number(e.target.value) })}
                  className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
                  title="Adjust left logo size"
                />
                <span className="font-mono text-[11px] text-slate-800 font-bold w-9 text-right">
                  {header.leftLogoSize || 80}px
                </span>
              </div>
            </div>
          </div>

          {/* 2. Right Logo Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-700">Right logo</label>
              {header.rightLogoUrl && (
                <button
                  type="button"
                  onClick={() => updateHeader({ rightLogoUrl: '' })}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div
              onClick={() => rightLogoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
            >
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                {header.rightLogoUrl ? 'Replace right logo' : 'Upload right logo'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG</span>

              {header.rightLogoUrl && (
                <div className="relative mt-2 group/logo flex items-center justify-center">
                  <img
                    src={header.rightLogoUrl}
                    alt="Right logo"
                    className="h-8 max-w-[140px] object-contain rounded bg-white p-1 border shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateHeader({ rightLogoUrl: '' });
                    }}
                    title="Remove right logo"
                    className="absolute -top-1.5 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-sm transition-transform hover:scale-110"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Logo Size Slider */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-[10.5px] font-medium text-slate-600">Logo size</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="2"
                  value={header.rightLogoSize || 80}
                  onChange={(e) => updateHeader({ rightLogoSize: Number(e.target.value) })}
                  className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
                  title="Adjust right logo size"
                />
                <span className="font-mono text-[11px] text-slate-800 font-bold w-9 text-right">
                  {header.rightLogoSize || 80}px
                </span>
              </div>
            </div>
          </div>

          {/* 3. Customer Signature Box (Template 1 only) */}
          {activeTemplateId === 'template-1' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-700">Customer signature</label>
                {author.signatureUrl && (
                  <button
                    type="button"
                    onClick={() => updateAuthor({ signatureUrl: '' })}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div
                onClick={() => signatureInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
              >
                <PenTool className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                  {author.signatureUrl ? 'Replace signature' : 'Upload signature'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Handwritten PNG or graphic</span>

                {author.signatureUrl && (
                  <div className="relative mt-2 group/sig flex items-center justify-center">
                    <img
                      src={author.signatureUrl}
                      alt="Signature"
                      className="h-8 max-w-[140px] object-contain rounded bg-white p-1 border shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAuthor({ signatureUrl: '' });
                      }}
                      title="Remove signature"
                      className="absolute -top-1.5 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-sm transition-transform hover:scale-110"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Signature Size Slider */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[10.5px] font-medium text-slate-600">Signature size</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="30"
                    max="110"
                    step="2"
                    value={author.signatureSize || 55}
                    onChange={(e) => updateAuthor({ signatureSize: Number(e.target.value) })}
                    className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2D6B]"
                    title="Adjust signature size"
                  />
                  <span className="font-mono text-[11px] text-slate-800 font-bold w-9 text-right">
                    {author.signatureSize || 55}px
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Showcase Photo Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-700">Showcase photo</label>
              {media.supportingPhotoUrl && (
                <button
                  type="button"
                  onClick={() => updateMedia({ supportingPhotoUrl: '' })}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div
              onClick={() => photoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
            >
              <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                {media.supportingPhotoUrl ? 'Replace photo' : 'Upload photo'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Event hall or supporting photo</span>

              {media.supportingPhotoUrl && (
                <div className="relative mt-2 group/photo flex items-center justify-center">
                  <img
                    src={media.supportingPhotoUrl}
                    alt="Photo"
                    className="h-10 w-20 object-cover rounded border shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateMedia({ supportingPhotoUrl: '' });
                    }}
                    title="Remove photo"
                    className="absolute -top-1.5 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-sm transition-transform hover:scale-110"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
