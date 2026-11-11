import React from 'react';
import Template1LuxuryGold from './Template1LuxuryGold';
import { useStudioStore } from '../../store/useStudioStore';
import { TemplateData } from '../../types/studio';
import { TEMPLATES } from '../../data/defaultTemplates';

export interface TestimonialPosterProps {
  data?: TemplateData;
  isExporting?: boolean;
  onElementClick?: (elementId: string) => void;
  selectedElementId?: string | null;
}

export default function TestimonialPoster({
  data: propsData,
  isExporting = false,
  onElementClick,
  selectedElementId: propsSelectedId,
}: TestimonialPosterProps) {
  const store = useStudioStore();
  const activeData = propsData || store.activeDesign?.data || TEMPLATES['template-1'];
  const selectedElementId = propsSelectedId !== undefined ? propsSelectedId : store.selectedObjectId;

  return (
    <Template1LuxuryGold
      data={activeData}
      isExporting={isExporting}
      onElementClick={onElementClick || ((id) => store.setSelectedObject(id, null))}
      selectedElementId={selectedElementId}
    />
  );
}

export { Template1LuxuryGold };
