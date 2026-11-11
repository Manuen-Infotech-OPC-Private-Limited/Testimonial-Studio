import React from 'react';
import {
  Sparkles,
  Files,
  Store,
  Download,
  MoreHorizontal,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { TemplateId } from '../../types/studio';
import { getTemplateThumbnailUrl } from '../../utils/router';
import { DesignThumbnailPreview } from '../common/DesignThumbnailPreview';

export const DashboardView: React.FC = () => {
  const {
    user,
    designsList,
    isDesignsLoading,
    createNewDesign,
    openDesign,
    setCurrentView,
  } = useStudioStore();

  const templateCards: Array<{
    id: TemplateId;
    title: string;
    subtitle: string;
    image: string;
  }> = [
    {
      id: 'template-1',
      title: 'Luxury Gold',
      subtitle: 'Formal and elegant',
      image: getTemplateThumbnailUrl('template-1'),
    },
    {
      id: 'template-2',
      title: 'Elegant Minimal',
      subtitle: 'Clean and refined',
      image: getTemplateThumbnailUrl('template-2'),
    },
    {
      id: 'template-3',
      title: 'Corporate Classic',
      subtitle: 'Professional and structured',
      image: getTemplateThumbnailUrl('template-3'),
    },
  ];

  return (
    <div className="min-h-full bg-[#F4F6FB] px-4 py-5 sm:px-6 md:px-8 md:py-7 space-y-5 sm:space-y-6 max-w-6xl mx-auto w-full select-none">
      {/* Top Header Bar */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
          Your creative space
        </h1>
      </div>

      {/* Hero Banner ("YOUR NEXT MASTERPIECE") */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1E3F] text-white p-5 sm:p-7 md:p-8 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 4-point golden star on right */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-8 md:right-10 pointer-events-none text-[#E5B54F]">
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pr-8 sm:pr-0">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#E5B54F] uppercase">
              YOUR NEXT MASTERPIECE
            </p>
            <span className="font-caveat text-amber-300 text-base sm:text-lg font-bold">~ ready to craft</span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Every great story deserves a beautiful design.
          </h2>

          <p className="text-xs md:text-sm text-slate-300 pt-0.5 pb-3">
            Create polished testimonial posters with your original templates.
          </p>

          <div>
            <button
              onClick={() => createNewDesign('template-1')}
              className="bg-[#E5B54F] hover:bg-[#DCA236] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition-all active:scale-95 inline-flex items-center space-x-1.5"
            >
              <span>+ Start creating</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Designs created */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <Files className="w-4 h-4 text-slate-500" />
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">
              {designsList.length}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Designs created</p>
          </div>
        </div>

        {/* Card 2: Ready-to-use templates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <Store className="w-4 h-4 text-slate-500" />
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">3</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Ready-to-use templates</p>
          </div>
        </div>

        {/* Card 3: Downloads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <Download className="w-4 h-4 text-slate-500" />
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">
              {user?.downloadCount ?? 0}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Downloads</p>
          </div>
        </div>
      </div>

      {/* Choose your starting point Section */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Choose your starting point
            </h2>
            <span className="font-caveat text-lg text-amber-600 font-bold hidden sm:inline">
              — pick a layout
            </span>
          </div>
          <button
            onClick={() => setCurrentView('templates')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <span>Browse templates</span>
            <span>→</span>
          </button>
        </div>

        {/* 3 Template Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {templateCards.map((card) => (
            <a
              key={card.id}
              href={`/editor/${card.id}`}
              onClick={(e) => {
                e.preventDefault();
                createNewDesign(card.id);
              }}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between block"
            >
              {/* Visual Template Image (Top Cropped Preview) */}
              <div className="h-44 w-full rounded-xl overflow-hidden relative shadow-inner bg-slate-50 border border-slate-200/80">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="pt-3 px-1 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 group-hover:bg-amber-100 group-hover:text-amber-900 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1">
                  <span>Use</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recently edited Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
            Recently edited
          </h2>
          <button
            title="Options"
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state or designs list */}
        {isDesignsLoading && designsList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3.5 animate-pulse"
              >
                <div className="w-12 h-16 rounded-lg bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : designsList.length === 0 ? (
          <div className="rounded-2xl bg-slate-100/70 border border-slate-200/70 p-7 flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 rounded-lg bg-slate-200/90 flex items-center justify-center text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Your workspace is ready</h4>
            <p className="font-caveat text-base text-slate-500 font-semibold mt-0.5">
              Start with a template to create your first design ✨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {designsList.slice(0, 3).map((design) => (
              <div
                key={design.id}
                onClick={() => openDesign(design.id)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center space-x-3.5 group"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200/80">
                  <DesignThumbnailPreview
                    templateId={design.templateId}
                    data={design.data}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {design.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(design.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
