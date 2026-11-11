export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export async function cropImageCanvas(
  dataUrl: string,
  cropArea: { x: number; y: number; width: number; height: number },
  targetSize?: { width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = targetSize?.width || cropArea.width;
      const h = targetSize?.height || cropArea.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2d context'));
        return;
      }

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        w,
        h
      );

      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = dataUrl;
  });
}

