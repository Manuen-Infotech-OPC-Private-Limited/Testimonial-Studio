import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf';
  quality?: number; // 0.8 - 1.0
  scale?: number; // 1x, 2x (recommended), 3x
  fileName?: string;
  sourceType?: 'html' | 'fabric';
  fabricCanvas?: any;
  elementId?: string;
}

export async function exportDesign(options: ExportOptions): Promise<string> {
  const {
    format,
    quality = 0.95,
    scale = 2,
    fileName = 'testimonial-poster',
    sourceType = 'html',
    fabricCanvas,
    elementId,
  } = options;

  let dataUrl = '';

  if (sourceType === 'fabric' && fabricCanvas) {
    // Export from Fabric.js Canvas
    if (format === 'jpeg') {
      dataUrl = fabricCanvas.toDataURL({
        format: 'jpeg',
        quality,
        multiplier: scale,
      });
    } else {
      dataUrl = fabricCanvas.toDataURL({
        format: 'png',
        multiplier: scale,
      });
    }
  } else {
    // Export from DOM Element (Pixel-perfect HTML/SVG composite at exact 800x1200 * scale)
    const targetEl = document.getElementById(elementId || 'testimonial-export-target');
    if (!targetEl) {
      throw new Error('Export element not found in DOM');
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const baseWidth = targetEl.clientWidth || 800;
    const baseHeight = targetEl.clientHeight || 1200;
    const captureOptions = {
      width: baseWidth,
      height: baseHeight,
      canvasWidth: baseWidth,
      canvasHeight: baseHeight,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      cacheBust: true,
    };

    if (format === 'jpeg') {
      dataUrl = await toJpeg(targetEl, {
        ...captureOptions,
        quality,
      });
    } else {
      dataUrl = await toPng(targetEl, captureOptions);
    }
  }

  // Handle Download based on format
  if (format === 'pdf') {
    // Create High-Resolution PDF with jsPDF
    // Standard A4 portrait: 210mm x 297mm (aspect ratio 1 : 1.414)
    // Or Poster 2:3 ratio: 200mm x 300mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [200, 300],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, 200, 300, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
  } else {
    // Download image
    const link = document.createElement('a');
    link.download = `${fileName}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return dataUrl;
}

