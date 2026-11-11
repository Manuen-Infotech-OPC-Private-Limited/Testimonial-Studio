import React, { useEffect, useState } from 'react';
import { X, Download, FileImage, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { exportDesign } from '../../utils/exportUtils';
import { useStudioStore } from '../../store/useStudioStore';
import { useModalStore } from '../../store/useModalStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  targetElementId = 'testimonial-export-target',
}) => {
  const { activeDesign, fabricCanvas, isNewUnsaved, updateDesignStatus, recordDownload } =
    useStudioStore();
  const { showAlert } = useModalStore();
  const [format, setFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');
  const [scale, setScale] = useState<number>(2);
  const [fileName, setFileName] = useState(
    activeDesign?.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'testimonial-poster'
  );
  const [sourceType, setSourceType] = useState<'html' | 'fabric'>('html');
  const [markCompletedOnExport, setMarkCompletedOnExport] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFileName(activeDesign?.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'testimonial-poster');
      setExportSuccess(false);
    }
  }, [isOpen, activeDesign?.id, activeDesign?.title]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await exportDesign({
        format,
        scale,
        fileName: fileName.trim() || 'testimonial-poster',
        sourceType,
        fabricCanvas,
        elementId: targetElementId,
        quality: 0.95,
      });

      const shouldMarkCompleted =
        markCompletedOnExport &&
        activeDesign &&
        !isNewUnsaved &&
        activeDesign.status !== 'completed';

      await Promise.all([
        recordDownload(),
        shouldMarkCompleted
          ? updateDesignStatus(activeDesign.id, 'completed')
          : Promise.resolve(),
      ]);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Export failed:', e);
      showAlert({
        title: 'Export Failed',
        message: 'Could not export the poster. Please try again or check the console for details.',
        variant: 'warning',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92dvh] overflow-y-auto flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Export Testimonial Poster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* File Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Format Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { id: 'png', label: 'PNG Image', desc: 'Lossless HD', icon: <FileImage className="w-4 h-4" /> },
                { id: 'jpeg', label: 'JPG Image', desc: 'Compact / Web', icon: <FileImage className="w-4 h-4" /> },
                { id: 'pdf', label: 'PDF Document', desc: 'Print Ready 2:3', icon: <FileText className="w-4 h-4" /> },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id as any)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                    format === fmt.id
                      ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      format === fmt.id ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {fmt.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{fmt.label}</p>
                    <p className="text-[10px] text-slate-500">{fmt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Multiplier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Resolution Quality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
              {[
                { scale: 1, label: '1x (800 × 1200)', note: 'Fast' },
                { scale: 2, label: '2x (1600 × 2400)', note: 'Recommended' },
                { scale: 3, label: '3x (2400 × 3600)', note: 'Ultra HD' },
              ].map((item) => (
                <button
                  key={item.scale}
                  type="button"
                  onClick={() => setScale(item.scale)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    scale === item.scale
                      ? 'border-amber-400 bg-amber-400/20 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] text-amber-700 font-semibold">{item.note}</div>
                </button>
              ))}
            </div>
          </div>

          {activeDesign && !isNewUnsaved && activeDesign.status !== 'completed' && (
            <label className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={markCompletedOnExport}
                onChange={(e) => setMarkCompletedOnExport(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F2D6B] focus:ring-[#0F2D6B]"
              />
              <span>Mark project status as Completed after download</span>
            </label>
          )}

          {/* Clean export disclaimer */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Editor controls, selection borders, and application chrome will be excluded. The final file contains strictly the pure testimonial design.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-[0.98]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {format.toUpperCase()}...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

