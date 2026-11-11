import React from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Quote,
  Check,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

interface CanvasToolbarProps {
  onOpenExportModal: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onOpenExportModal,
}) => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    saveCurrentDesign,
    updateDesignStatus,
    activeDesign,
    isSaving,
    setCurrentView,
  } = useStudioStore();

  const [savedRecently, setSavedRecently] = React.useState(false);
  const isCompleted = activeDesign?.status === 'completed';

  const handleSave = async () => {
    await saveCurrentDesign();
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 2500);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-20">
      {/* Left: Brand Breadcrumb */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Brand Icon */}
        <div
          onClick={() => setCurrentView('dashboard')}
          className="w-8 h-8 rounded-lg bg-[#0F2D6B] flex items-center justify-center text-white cursor-pointer hover:bg-[#0B214E] transition-colors shadow-sm shrink-0"
          title="Back to Dashboard"
        >
          <Quote className="w-4 h-4 fill-white -scale-x-100" />
        </div>

        {/* Breadcrumb Title & Status Toggle */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm min-w-0">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="hidden md:inline font-bold text-[#0F2D6B] hover:text-blue-900 transition-colors shrink-0"
          >
            Testimonial Studio
          </button>
          <span className="hidden md:inline text-slate-300 font-light">/</span>
          <span className="text-slate-600 sm:text-slate-500 font-semibold sm:font-medium truncate">
            Create design
          </span>
          {activeDesign && (
            <button
              type="button"
              onClick={() =>
                updateDesignStatus(activeDesign.id, isCompleted ? 'draft' : 'completed')
              }
              title={isCompleted ? 'Click to mark as Draft' : 'Click to mark as Completed'}
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors shrink-0 ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
              }`}
            >
              {isCompleted ? 'Completed' : 'Draft'}
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded-lg transition-colors ${
            canUndo
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded-lg transition-colors ${
            canRedo
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 mx-0.5 sm:mx-1 hidden sm:block" />

        {/* Save Draft */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all flex items-center space-x-1.5"
        >
          {savedRecently ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Saved!</span>
            </>
          ) : isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <span className="sm:hidden">Save</span>
              <span className="hidden sm:inline">{isCompleted ? 'Save' : 'Save draft'}</span>
            </>
          )}
        </button>

        {/* Export CTA Button */}
        <button
          onClick={onOpenExportModal}
          className="px-2.5 sm:px-4 py-1.5 rounded-lg bg-[#0F2D6B] hover:bg-[#0B214E] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
