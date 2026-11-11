import React, { useState, useRef } from 'react';
import { X, Check, RotateCw, ZoomIn, ZoomOut, Crop } from 'lucide-react';
import { cropImageCanvas } from '../../utils/imageUtils';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  aspectRatioLabel?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  title = 'Crop & Position Image',
  aspectRatioLabel = 'Custom',
}) => {
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '3:1' | '16:9' | '2:3'>('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen || !imageUrl) return null;

  const handleApplyCrop = async () => {
    setIsProcessing(true);
    try {
      if (!imgRef.current) return;
      const naturalW = imgRef.current.naturalWidth;
      const naturalH = imgRef.current.naturalHeight;

      // Crop based on selected aspect ratio or center area
      let cropW = naturalW;
      let cropH = naturalH;

      if (aspectRatio === '1:1') {
        const side = Math.min(naturalW, naturalH);
        cropW = side;
        cropH = side;
      } else if (aspectRatio === '3:1') {
        cropH = Math.min(naturalH, naturalW / 3);
        cropW = cropH * 3;
      } else if (aspectRatio === '16:9') {
        cropW = Math.min(naturalW, naturalH * (16 / 9));
        cropH = cropW * (9 / 16);
      } else if (aspectRatio === '2:3') {
        cropW = Math.min(naturalW, naturalH * (2 / 3));
        cropH = cropW * (3 / 2);
      }

      const cropX = Math.max(0, (naturalW - cropW) / 2);
      const cropY = Math.max(0, (naturalH - cropH) / 2);

      const result = await cropImageCanvas(imageUrl, {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH,
      });

      onCropComplete(result);
      onClose();
    } catch (e) {
      console.error('Crop failed', e);
      // Fallback: use original
      onCropComplete(imageUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Crop className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[200px] sm:min-h-[300px] max-h-[45dvh] overflow-hidden relative canvas-checkerboard">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="To crop"
            style={{ transform: `scale(${zoom})` }}
            className="max-h-[36dvh] sm:max-h-[360px] max-w-full object-contain transition-transform duration-100 shadow-md rounded"
          />
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-6 bg-white space-y-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Aspect Ratio Presets */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="font-bold text-slate-600 mr-1">Ratio:</span>
              {(['free', '1:1', '3:1', '16:9', '2:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ratio.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-slate-700">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl shadow flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Apply Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

