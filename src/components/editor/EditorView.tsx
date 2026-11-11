import React, { useState } from 'react';
import { Eye, SlidersHorizontal, Palette } from 'lucide-react';
import { LeftPanel } from './LeftPanel';
import { CenterCanvas } from './CenterCanvas';
import { RightPanel } from './RightPanel';
import { CanvasToolbar } from './CanvasToolbar';
import { ImageCropModal } from './ImageCropModal';
import { ExportModal } from './ExportModal';
import { useStudioStore } from '../../store/useStudioStore';
import { Template1LuxuryGold } from '../templates/Template1LuxuryGold';
import { Template2ElegantMinimal } from '../templates/Template2ElegantMinimal';
import { Template3CorporateClassic } from '../templates/Template3CorporateClassic';

export const EditorView: React.FC = () => {
  const { activeDesign, activeTemplateId } = useStudioStore();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'preview' | 'content' | 'style'>('preview');

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [cropModalData, setCropModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    onComplete: (cropped: string) => void;
  }>({
    isOpen: false,
    imageUrl: '',
    onComplete: () => {},
  });

  const handleOpenCropModal = (imageUrl: string, onComplete: (cropped: string) => void) => {
    setCropModalData({
      isOpen: true,
      imageUrl,
      onComplete,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* Top Navbar Toolbar */}
      <CanvasToolbar onOpenExportModal={() => setIsExportModalOpen(true)} />

      {/* Mobile & Tablet Panel Switcher (< lg) */}
      <div className="lg:hidden grid grid-cols-3 bg-white border-b border-slate-200 px-2.5 py-1.5 gap-1.5 shrink-0 select-none">
        {[
          { id: 'preview' as const, label: 'Preview', icon: Eye },
          { id: 'content' as const, label: 'Content', icon: SlidersHorizontal },
          { id: 'style' as const, label: 'Style', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                active
                  ? 'bg-[#0F2D6B] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Layout: Tabbed on Mobile/Tablet (< lg), 3-Panel on Desktop (>= lg) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div
          className={`${
            mobileTab === 'content' ? 'flex w-full' : 'hidden'
          } lg:flex lg:w-auto flex-1 lg:flex-none min-h-0 overflow-hidden`}
        >
          <LeftPanel onOpenCropModal={handleOpenCropModal} />
        </div>

        <div
          className={`${
            mobileTab === 'preview' ? 'flex w-full' : 'hidden'
          } lg:flex flex-1 min-h-0 min-w-0 overflow-hidden`}
        >
          <CenterCanvas
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        </div>

        <div
          className={`${
            mobileTab === 'style' ? 'flex w-full' : 'hidden'
          } lg:flex lg:w-auto flex-1 lg:flex-none min-h-0 overflow-hidden`}
        >
          <RightPanel />
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalData.isOpen}
        imageUrl={cropModalData.imageUrl}
        onClose={() => setCropModalData((prev) => ({ ...prev, isOpen: false }))}
        onCropComplete={cropModalData.onComplete}
      />

      {/* Clean unscaled offscreen export target (excludes selection borders & dashed upload boxes) */}
      {isExportModalOpen && activeDesign && (
        <div
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '800px',
            height: '1200px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <div id="testimonial-clean-export-target" className="w-[800px] h-[1200px] relative bg-white">
            {activeTemplateId === 'template-1' && (
              <Template1LuxuryGold data={activeDesign.data} isExporting={true} />
            )}
            {activeTemplateId === 'template-2' && (
              <Template2ElegantMinimal data={activeDesign.data} isExporting={true} />
            )}
            {activeTemplateId === 'template-3' && (
              <Template3CorporateClassic data={activeDesign.data} isExporting={true} />
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        targetElementId="testimonial-clean-export-target"
      />
    </div>
  );
};

export default EditorView;
