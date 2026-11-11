import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2, X, Loader2 } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

export const ModalHost: React.FC = () => {
  const { isOpen, isBusy, config, errorMessage, setBusy, setError, closeModal } = useModalStore();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isBusy, closeModal]);

  if (!isOpen || !config) return null;

  const isDanger = config.variant === 'danger';
  const isWarning = config.variant === 'warning';

  const handleConfirm = async () => {
    if (!config.onConfirm) {
      closeModal();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await config.onConfirm();
      closeModal();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : 'Action failed. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => {
        if (!isBusy) closeModal();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-4 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-50 text-rose-600'
                  : isWarning
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-[#0F2D6B]'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {config.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mb-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          {config.mode === 'confirm' && (
            <button
              type="button"
              disabled={isBusy}
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
            >
              {config.cancelLabel || 'Cancel'}
            </button>
          )}

          <button
            type="button"
            disabled={isBusy}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#0F2D6B] hover:bg-[#0B214E]'
            }`}
          >
            {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{config.confirmLabel || 'OK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHost;

