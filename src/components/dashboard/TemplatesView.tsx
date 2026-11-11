import React, { useState } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { TemplateId } from '../../types/studio';
import { getTemplateThumbnailUrl } from '../../utils/router';

export const TemplatesView: React.FC = () => {
  const { createNewDesign } = useStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'luxury' | 'minimal' | 'corporate'>('all');

  const templates = [
    {
      id: 'template-1' as TemplateId,
      category: 'luxury',
      title: 'Luxury Gold',
      subtitle: 'Navy, gold and decorative borders',
      image: getTemplateThumbnailUrl('template-1'),
    },
    {
      id: 'template-2' as TemplateId,
      category: 'minimal',
      title: 'Elegant Minimal',
      subtitle: 'White, navy and gold accents',
      image: getTemplateThumbnailUrl('template-2'),
    },
    {
      id: 'template-3' as TemplateId,
      category: 'corporate',
      title: 'Corporate Classic',
      subtitle: 'Structured and professional',
      image: getTemplateThumbnailUrl('template-3'),
    },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-full bg-[#F4F6FB] px-4 py-5 sm:px-6 md:px-8 md:py-7 space-y-5 sm:space-y-6 max-w-6xl mx-auto w-full select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
            Template library
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Choose a design to start your next testimonial.
          </p>
        </div>

        {/* Action Button: + Create design */}
        <button
          onClick={() => createNewDesign('template-1')}
          className="self-start sm:self-auto bg-[#0F2D6B] hover:bg-[#0B214E] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create design</span>
        </button>
      </div>

      {/* Search and Category Filter Pills */}
      <div className="space-y-3">
        {/* Search input with filter icon */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center flex-wrap gap-2">
          {[
            { id: 'all', label: 'All templates - 3' },
            { id: 'luxury', label: 'Luxury' },
            { id: 'minimal', label: 'Minimal' },
            { id: 'corporate', label: 'Corporate' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-1 rounded-full text-xs transition-all ${
                  isActive
                    ? 'bg-[#DCEBFE] text-[#1967D2] font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Templates Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Template Preview Image (Top Cropped Preview) */}
            <div
              onClick={() => createNewDesign(tmpl.id)}
              className="h-44 w-full rounded-xl overflow-hidden relative shadow-inner bg-slate-50 border border-slate-200/80 cursor-pointer"
            >
              <img
                src={tmpl.image}
                alt={tmpl.title}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>

            {/* Template Info */}
            <div className="pt-3 px-0.5">
              <h3 className="font-bold text-sm text-slate-900">{tmpl.title}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{tmpl.subtitle}</p>

              {/* Use template CTA Button */}
              <button
                onClick={() => createNewDesign(tmpl.id)}
                className="w-full mt-3 py-2.5 rounded-xl bg-[#0F2D6B] hover:bg-[#0B214E] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Callout Info Box */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm space-y-1">
        <div className="flex items-center space-x-2 text-slate-700">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold">Your original templates remain unchanged.</span>
        </div>
        <p className="text-xs text-slate-400 pl-6 leading-relaxed">
          Selecting a template creates a new editable design in your projects.
        </p>
      </div>
    </div>
  );
};

export default TemplatesView;
