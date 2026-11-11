import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Download,
  Copy,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { useModalStore } from '../../store/useModalStore';
import { TEMPLATES } from '../../data/defaultTemplates';
import { DesignRecord, TemplateId } from '../../types/studio';
import { DesignThumbnailPreview } from '../common/DesignThumbnailPreview';

export const MyDesignsView: React.FC = () => {
  const {
    designsList,
    isDesignsLoading,
    storageError,
    openDesign,
    createNewDesign,
    duplicateDesign,
    deleteDesign,
    clearAllDesigns,
    renameDesign,
    updateDesignStatus,
  } = useStudioStore();
  const { showConfirm } = useModalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'completed' | TemplateId>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'oldest'>('recent');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!activeMenuId && !showFilterMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setShowFilterMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuId, showFilterMenu]);

  // Relative date formatter matching "Edited 2 hours ago", "Edited yesterday", "Edited Oct 30"
  const formatRelativeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Edited just now';
      if (diffHours < 24) return `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Edited yesterday';
      if (diffDays < 7) return `Edited ${diffDays} days ago`;

      return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch {
      return 'Edited recently';
    }
  };

  // Metrics counts
  const totalCount = designsList.length;
  const draftCount = designsList.filter((d) => d.status === 'draft').length;
  const completedCount = totalCount - draftCount;

  // Filter & Search logic
  const filteredDesigns = designsList
    .filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.data.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.data.author.company.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'draft') return d.status === 'draft';
      if (selectedFilter === 'completed') return d.status === 'completed';
      return d.templateId === selectedFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const handleStartRename = (design: DesignRecord) => {
    setEditingId(design.id);
    setNewTitle(design.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (newTitle.trim()) {
      renameDesign(id, newTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      onClick={() => {
        setActiveMenuId(null);
        setShowFilterMenu(false);
      }}
      className="min-h-full bg-[#F4F6FB] px-4 py-5 sm:px-6 md:px-8 md:py-7 space-y-5 sm:space-y-6 max-w-6xl mx-auto w-full select-none"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
            My projects
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            All your testimonial designs, in one place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {totalCount > 0 && (
            <button
              onClick={() =>
                showConfirm({
                  title: 'Delete all projects?',
                  message:
                    'This will permanently delete all saved designs from your projects in MongoDB. This action cannot be undone.',
                  confirmLabel: 'Delete all',
                  cancelLabel: 'Cancel',
                  variant: 'danger',
                  onConfirm: () => clearAllDesigns(),
                })
              }
              className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
          <button
            onClick={() => createNewDesign('template-1')}
            className="bg-[#0F2D6B] hover:bg-[#0B214E] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New design</span>
          </button>
        </div>
      </div>

      {storageError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
          {storageError}
        </div>
      )}

      {/* Metrics Row: 3 Clean White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total projects */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Total projects</span>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">{totalCount}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1.5">Across all templates</p>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Drafts</span>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">{draftCount}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5">In progress</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Completed</span>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">{completedCount}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5">Ready to share</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center space-x-3 relative">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterMenu((prev) => !prev);
            }}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm ${selectedFilter !== 'all'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>

          {/* Filter Dropdown */}
          {showFilterMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-30 text-xs font-medium space-y-0.5"
            >
              {[
                { id: 'all', label: 'All projects' },
                { id: 'draft', label: 'Drafts only' },
                { id: 'completed', label: 'Completed only' },
                { id: 'template-1', label: 'Luxury Gold' },
                { id: 'template-2', label: 'Elegant Minimal' },
                { id: 'template-3', label: 'Corporate Classic' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedFilter(opt.id as any);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${selectedFilter === opt.id
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Heading & Sort */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">All projects</h2>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-none"
          >
            <option value="recent">Recently edited</option>
            <option value="name">Title (A-Z)</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isDesignsLoading && designsList.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-3 animate-pulse"
            >
              <div className="h-44 w-full rounded-xl bg-slate-100" />
              <div className="space-y-2 px-0.5">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            {totalCount === 0 ? 'No saved projects yet.' : 'No projects found matching your search.'}
          </p>
          <button
            onClick={() => createNewDesign('template-1')}
            className="text-xs font-bold text-[#0F2D6B] hover:underline"
          >
            + Create a new testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDesigns.map((design) => {
            const isEditing = editingId === design.id;
            const templateInfo = TEMPLATES[design.templateId];
            const isDraft = design.status === 'draft';
            const isMenuOpen = activeMenuId === design.id;

            return (
              <div
                key={design.id}
                className={`bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative ${
                  isMenuOpen ? 'z-30' : 'z-0'
                }`}
              >
                {/* Live Cropped Design Preview Box */}
                <div
                  onClick={() => openDesign(design.id)}
                  className={`h-44 w-full rounded-xl relative cursor-pointer border overflow-hidden bg-white ${
                    design.templateId === 'template-1'
                      ? 'border-amber-200/80'
                      : design.templateId === 'template-2'
                        ? 'border-amber-300/80'
                        : 'border-slate-200'
                  }`}
                >
                  <DesignThumbnailPreview
                    templateId={design.templateId}
                    data={design.data}
                  />
                </div>

                {/* Card Information */}
                <div className="pt-3 px-0.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(design.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 text-xs font-bold border border-blue-400 rounded-lg px-2 py-1 outline-none min-w-0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(design.id)}
                            className="text-xs bg-[#0F2D6B] text-white px-2 py-1 rounded-lg font-bold shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3
                          onClick={() => openDesign(design.id)}
                          className="font-bold text-sm text-slate-900 group-hover:text-[#0F2D6B] transition-colors truncate cursor-pointer"
                          title={design.title}
                        >
                          {design.title}
                        </h3>
                      )}
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {templateInfo?.name || 'Luxury Gold'}
                      </p>
                    </div>

                    {/* Three Dots Action Button & Dropdown outside preview */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFilterMenu(false);
                          setActiveMenuId(isMenuOpen ? null : design.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Project actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 text-xs font-semibold text-slate-700 space-y-0.5 animate-fadeIn"
                        >
                          <button
                            onClick={() => openDesign(design.id)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Design</span>
                          </button>
                          <button
                            onClick={() => handleStartRename(design)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              duplicateDesign(design.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center space-x-2"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => {
                              updateDesignStatus(design.id, isDraft ? 'completed' : 'draft');
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center space-x-2"
                          >
                            {isDraft ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mark Completed</span>
                              </>
                            ) : (
                              <>
                                <FileEdit className="w-3.5 h-3.5 text-orange-500" />
                                <span>Move to Draft</span>
                              </>
                            )}
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              showConfirm({
                                title: 'Delete project?',
                                message: `Are you sure you want to delete "${design.title}"? This cannot be undone.`,
                                confirmLabel: 'Delete',
                                cancelLabel: 'Cancel',
                                variant: 'danger',
                                onConfirm: () => deleteDesign(design.id),
                              });
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Relative Timestamp */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => updateDesignStatus(design.id, isDraft ? 'completed' : 'draft')}
                      title={isDraft ? 'Click to mark as Completed' : 'Click to move back to Draft'}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                        isDraft
                          ? 'bg-orange-50 text-orange-600 border-orange-200/60 hover:bg-orange-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                      }`}
                    >
                      {isDraft ? 'Draft' : 'Completed'}
                    </button>

                    <span className="text-[11px] text-slate-400">
                      {formatRelativeDate(design.updatedAt || design.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Open design -> and download icon */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openDesign(design.id)}
                    className="text-xs font-semibold text-[#0F2D6B] hover:underline flex items-center space-x-1"
                  >
                    <span>Open design</span>
                    <span>&rarr;</span>
                  </button>

                  <button
                    onClick={() => openDesign(design.id)}
                    title="Export / Download"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDesignsView;
