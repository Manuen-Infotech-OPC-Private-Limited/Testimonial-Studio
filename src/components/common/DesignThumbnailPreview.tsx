import React, { useLayoutEffect, useRef, useState } from 'react';
import type { TemplateData, TemplateId } from '../../types/studio';
import { Template1LuxuryGold } from '../templates/Template1LuxuryGold';
import { Template2ElegantMinimal } from '../templates/Template2ElegantMinimal';
import { Template3CorporateClassic } from '../templates/Template3CorporateClassic';

interface DesignThumbnailPreviewProps {
  templateId: TemplateId;
  data: TemplateData;
  className?: string;
}

const CANVAS_WIDTH = 800;

/**
 * Renders a crisp, non-interactive live scaled view of the poster's current design data,
 * aligned to the top edge and cropped by the parent container height.
 */
export const DesignThumbnailPreview: React.FC<DesignThumbnailPreviewProps> = ({
  templateId,
  data,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / CANVAS_WIDTH);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderTemplate = () => {
    switch (templateId) {
      case 'template-1':
        return <Template1LuxuryGold data={data} isExporting={true} />;
      case 'template-2':
        return <Template2ElegantMinimal data={data} isExporting={true} />;
      case 'template-3':
        return <Template3CorporateClassic data={data} isExporting={true} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-white select-none pointer-events-none ${className}`}
    >
      {scale > 0 && (
        <div
          style={{
            width: `${CANVAS_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {renderTemplate()}
        </div>
      )}
    </div>
  );
};

export default DesignThumbnailPreview;

