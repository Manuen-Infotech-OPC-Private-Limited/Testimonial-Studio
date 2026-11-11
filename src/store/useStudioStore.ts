import { create } from 'zustand';
import {
  AuthUser,
  DesignRecord,
  TemplateData,
  TemplateId,
  ViewMode,
  SelectedObjectProperties,
} from '../types/studio';
import { TEMPLATES } from '../data/defaultTemplates';
import {
  initializeDesigns,
  fetchAllDesigns,
  fetchDesignById,
  persistDesign,
  removeDesign,
  removeAllDesigns,
  signInWithMobile,
  signUpWithMobile,
  signOutSession,
  fetchCurrentUser,
  hasSessionHint,
  incrementDownloadCount,
} from '../utils/storageApi';
import {
  getTemplateThumbnailUrl,
  parseCurrentRoute,
  syncUrlToLogin,
  syncUrlToRoute,
} from '../utils/router';

interface StudioState {
  user: AuthUser | null;
  isAuthChecking: boolean;
  isDesignsLoading: boolean;
  authError: string | null;
  currentView: ViewMode;
  designsList: DesignRecord[];
  activeDesign: DesignRecord | null;
  activeTemplateId: TemplateId;
  zoomLevel: number;
  isSaving: boolean;
  isNewUnsaved: boolean;
  hasUnsavedChanges: boolean;
  storageError: string | null;
  selectedObjectId: string | null;
  selectedProperties: SelectedObjectProperties | null;
  fabricCanvas: any | null;
  canUndo: boolean;
  canRedo: boolean;
  history: string[];
  historyIndex: number;

  // Auth Actions
  initAuth: () => Promise<AuthUser | null>;
  signIn: (mobileNumber: string, password: string) => Promise<boolean>;
  signUp: (name: string, mobileNumber: string, password: string) => Promise<boolean>;
  signOut: () => void;
  clearAuthError: () => void;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  loadDesigns: () => Promise<void>;
  refreshDesigns: () => Promise<void>;
  createNewDesign: (templateId?: TemplateId) => Promise<void>;
  openDesign: (id: string) => Promise<void>;
  saveCurrentDesign: (thumbnailUrl?: string) => Promise<void>;
  updateDesignStatus: (id: string, status: 'draft' | 'completed') => Promise<void>;
  recordDownload: () => Promise<void>;
  renameDesign: (id: string, title: string) => Promise<void>;
  duplicateDesign: (id: string) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  clearAllDesigns: () => Promise<void>;
  switchTemplate: (templateId: TemplateId) => void;

  updateTemplateData: (updater: (prev: TemplateData) => TemplateData) => void;
  updateHeader: (partial: Partial<TemplateData['header']>) => void;
  updateContent: (partial: Partial<TemplateData['content']>) => void;
  updateAuthor: (partial: Partial<TemplateData['author']>) => void;
  updateMedia: (partial: Partial<TemplateData['media']>) => void;
  updateStyling: (partial: Partial<TemplateData['styling']>) => void;
  updateFontSize: (field: string, size: number) => void;
  updateTextColor: (field: string, color: string) => void;

  setZoomLevel: (zoom: number) => void;
  setFabricCanvas: (canvas: any) => void;
  setSelectedObject: (id: string | null, properties: SelectedObjectProperties | null) => void;
  updateSelectedProperties: (props: Partial<SelectedObjectProperties>) => void;

  pushHistory: (state: string) => void;
  undo: () => void;
  redo: () => void;
}

let inFlightInitAuth: Promise<AuthUser | null> | null = null;
let inFlightLoadDesigns: Promise<void> | null = null;

export const useStudioStore = create<StudioState>((set, get) => {
  const handleStorageError = (err: unknown) => {
    const status = (err as { status?: number })?.status;
    if (status === 401) {
      get().signOut();
      return;
    }
    set({
      storageError: err instanceof Error ? err.message : 'Database request failed',
    });
  };

  const initialRoute =
    typeof window !== 'undefined' ? parseCurrentRoute() : { view: 'dashboard' as ViewMode };

  return {
    user: null,
    isAuthChecking: true,
    isDesignsLoading: typeof window !== 'undefined' ? hasSessionHint() : false,
    authError: null,
    currentView: initialRoute.view,
    designsList: [],
    activeDesign: null,
    activeTemplateId: 'template-1',
    zoomLevel: 0.75,
    isSaving: false,
    isNewUnsaved: false,
    hasUnsavedChanges: false,
    storageError: null,
    selectedObjectId: null,
    selectedProperties: null,
    fabricCanvas: null,
    canUndo: false,
    canRedo: false,
    history: [],
    historyIndex: -1,

    initAuth: async () => {
      if (inFlightInitAuth) {
        return inFlightInitAuth;
      }
      set({ isAuthChecking: true, authError: null });
      inFlightInitAuth = (async () => {
        try {
          const user = await fetchCurrentUser();
          set({ user, isAuthChecking: false });
          return user;
        } catch (err) {
          set({
            user: null,
            isAuthChecking: false,
            authError: err instanceof Error ? err.message : null,
          });
          return null;
        } finally {
          inFlightInitAuth = null;
        }
      })();
      return inFlightInitAuth;
    },

    signIn: async (mobileNumber, password) => {
      set({ authError: null });
      try {
        const { user } = await signInWithMobile(mobileNumber, password);
        set({ user, authError: null, storageError: null });
        await get().loadDesigns();
        return true;
      } catch (err) {
        set({
          authError: err instanceof Error ? err.message : 'Sign in failed',
        });
        return false;
      }
    },

    signUp: async (name, mobileNumber, password) => {
      set({ authError: null });
      try {
        const { user } = await signUpWithMobile(name, mobileNumber, password);
        set({ user, authError: null, storageError: null });
        await get().loadDesigns();
        return true;
      } catch (err) {
        set({
          authError: err instanceof Error ? err.message : 'Sign up failed',
        });
        return false;
      }
    },

    signOut: () => {
      void signOutSession();
      syncUrlToLogin(true);
      set({
        user: null,
        isDesignsLoading: false,
        designsList: [],
        activeDesign: null,
        isNewUnsaved: false,
        hasUnsavedChanges: false,
        currentView: 'dashboard',
        history: [],
        historyIndex: -1,
        canUndo: false,
        canRedo: false,
        fabricCanvas: null,
        selectedObjectId: null,
        selectedProperties: null,
        storageError: null,
        authError: null,
      });
    },

    clearAuthError: () => set({ authError: null }),

    setCurrentView: (view) => {
      syncUrlToRoute({ view });
      set({ currentView: view });
      if (get().user && (view === 'designs' || view === 'dashboard')) {
        void get().refreshDesigns();
      }
    },

    loadDesigns: async () => {
      if (!get().user && !hasSessionHint()) return;
      if (inFlightLoadDesigns) return inFlightLoadDesigns;
      set({ isDesignsLoading: true });
      inFlightLoadDesigns = (async () => {
        try {
          const designs = await initializeDesigns();
          set({ designsList: designs, isDesignsLoading: false, storageError: null });
        } catch (err) {
          set({ isDesignsLoading: false });
          handleStorageError(err);
        } finally {
          inFlightLoadDesigns = null;
        }
      })();
      return inFlightLoadDesigns;
    },

    refreshDesigns: async () => {
      if (!get().user && !hasSessionHint()) return;
      try {
        const designs = await fetchAllDesigns();
        set({ designsList: designs, isDesignsLoading: false, storageError: null });
      } catch (err) {
        set({ isDesignsLoading: false });
        handleStorageError(err);
      }
    },

    createNewDesign: async (templateId = 'template-1') => {
      const baseTemplate = TEMPLATES[templateId];
      const newId = `design-${Date.now()}`;
      const newDesign: DesignRecord = {
        id: newId,
        title: `New ${baseTemplate.name} Testimonial`,
        templateId,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail: getTemplateThumbnailUrl(templateId),
        data: JSON.parse(JSON.stringify(baseTemplate)),
      };

      // Open in editor in-memory only; persist to MongoDB only when user clicks "Save draft"
      syncUrlToRoute({ view: 'editor', templateId });

      set({
        activeDesign: newDesign,
        activeTemplateId: templateId,
        currentView: 'editor',
        isNewUnsaved: true,
        hasUnsavedChanges: false,
        storageError: null,
        selectedObjectId: null,
        selectedProperties: null,
        history: [],
        historyIndex: -1,
        canUndo: false,
        canRedo: false,
      });
    },

    openDesign: async (id: string) => {
      try {
        const found = await fetchDesignById(id);
        if (found) {
          syncUrlToRoute({ view: 'editor', designId: id });
          set({
            activeDesign: found,
            activeTemplateId: found.templateId,
            currentView: 'editor',
            isNewUnsaved: false,
            hasUnsavedChanges: false,
            storageError: null,
            selectedObjectId: null,
            selectedProperties: null,
            history: [],
            historyIndex: -1,
            canUndo: false,
            canRedo: false,
          });
        }
      } catch (err) {
        handleStorageError(err);
      }
    },

    saveCurrentDesign: async (thumbnailUrl) => {
      const { activeDesign, fabricCanvas } = get();
      if (!activeDesign || !get().user) return;

      set({ isSaving: true });
      try {
        let canvasJson = activeDesign.canvasJson;
        if (fabricCanvas) {
          canvasJson = fabricCanvas.toJSON(['id', 'name', 'selectable', 'isTemplateElement']);
        }

        const updated: DesignRecord = {
          ...activeDesign,
          status: activeDesign.status || 'draft',
          updatedAt: new Date().toISOString(),
          canvasJson,
          thumbnail: thumbnailUrl || activeDesign.thumbnail,
        };

        const saved = await persistDesign(updated);
        const all = await fetchAllDesigns();
        syncUrlToRoute({ view: 'editor', designId: saved.id });
        set((state) => ({
          designsList: all,
          isSaving: false,
          isNewUnsaved: false,
          hasUnsavedChanges: false,
          storageError: null,
          activeDesign:
            state.activeDesign?.id === updated.id &&
            state.activeDesign.updatedAt === activeDesign.updatedAt
              ? saved
              : state.activeDesign,
        }));
      } catch (err) {
        set({ isSaving: false });
        handleStorageError(err);
      }
    },

    updateDesignStatus: async (id, status) => {
      const { activeDesign, isNewUnsaved } = get();
      if (activeDesign?.id === id && isNewUnsaved) {
        set({
          activeDesign: { ...activeDesign, status },
        });
        return;
      }

      try {
        const design = await fetchDesignById(id);
        if (design) {
          design.status = status;
          design.updatedAt = new Date().toISOString();
          const saved = await persistDesign(design);
          const all = await fetchAllDesigns();
          set((state) => ({
            designsList: all,
            storageError: null,
            activeDesign: state.activeDesign?.id === id ? saved : state.activeDesign,
          }));
        }
      } catch (err) {
        handleStorageError(err);
      }
    },

    recordDownload: async () => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            downloadCount: (currentUser.downloadCount ?? 0) + 1,
          },
        });
      }
      try {
        const updatedUser = await incrementDownloadCount();
        set({ user: updatedUser });
      } catch (err) {
        handleStorageError(err);
      }
    },

    renameDesign: async (id, title) => {
      try {
        const design = await fetchDesignById(id);
        if (design) {
          design.title = title;
          design.updatedAt = new Date().toISOString();
          const saved = await persistDesign(design);
          const all = await fetchAllDesigns();
          set((state) => ({
            designsList: all,
            storageError: null,
            activeDesign: state.activeDesign?.id === id ? saved : state.activeDesign,
          }));
        }
      } catch (err) {
        handleStorageError(err);
      }
    },

    duplicateDesign: async (id) => {
      try {
        const original = await fetchDesignById(id);
        if (original) {
          const duplicate: DesignRecord = {
            ...JSON.parse(JSON.stringify(original)),
            id: `design-${Date.now()}`,
            title: `${original.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await persistDesign(duplicate);
          const all = await fetchAllDesigns();
          set({
            designsList: all,
            storageError: null,
          });
        }
      } catch (err) {
        handleStorageError(err);
      }
    },

    deleteDesign: async (id) => {
      const isActiveDeleted = get().activeDesign?.id === id;
      if (isActiveDeleted) {
        syncUrlToRoute({ view: 'designs' });
      }
      try {
        await removeDesign(id);
        const all = await fetchAllDesigns();
        set((state) => ({
          designsList: all,
          storageError: null,
          activeDesign: state.activeDesign?.id === id ? null : state.activeDesign,
          currentView: state.activeDesign?.id === id ? 'designs' : state.currentView,
        }));
      } catch (err) {
        handleStorageError(err);
      }
    },

    clearAllDesigns: async () => {
      try {
        await removeAllDesigns();
        set((state) => ({
          designsList: [],
          storageError: null,
          activeDesign: null,
          isNewUnsaved: false,
          hasUnsavedChanges: false,
          currentView: state.currentView === 'editor' ? 'designs' : state.currentView,
        }));
      } catch (err) {
        handleStorageError(err);
        throw err;
      }
    },

  switchTemplate: (templateId) => {
    const { activeDesign, isNewUnsaved } = get();
    const templateConfig = TEMPLATES[templateId];
    if (!activeDesign) {
      get().createNewDesign(templateId);
      return;
    }

    const updatedData: TemplateData = {
      ...JSON.parse(JSON.stringify(templateConfig)),
      // Preserve customer details, logos, signatures and customized styling
      header: {
        ...templateConfig.header,
        leftLogoUrl: activeDesign.data.header.leftLogoUrl || templateConfig.header.leftLogoUrl,
        rightLogoUrl: activeDesign.data.header.rightLogoUrl || templateConfig.header.rightLogoUrl,
        leftLogoSize: activeDesign.data.header.leftLogoSize || templateConfig.header.leftLogoSize,
        rightLogoSize: activeDesign.data.header.rightLogoSize || templateConfig.header.rightLogoSize,
      },
      content: {
        ...templateConfig.content,
        heading: activeDesign.data.content.heading || templateConfig.content.heading,
        bodyText: activeDesign.data.content.bodyText || templateConfig.content.bodyText,
      },
      author: {
        ...templateConfig.author,
        name: activeDesign.data.author.name || templateConfig.author.name,
        company: activeDesign.data.author.company || templateConfig.author.company,
        date: activeDesign.data.author.date || templateConfig.author.date,
        signatureUrl: activeDesign.data.author.signatureUrl || templateConfig.author.signatureUrl,
        signatureSize: activeDesign.data.author.signatureSize || templateConfig.author.signatureSize,
      },
      media: {
        ...templateConfig.media,
        supportingPhotoUrl: activeDesign.data.media.supportingPhotoUrl || templateConfig.media.supportingPhotoUrl,
      },
      styling: {
        ...templateConfig.styling,
        headingFont: activeDesign.data.styling.headingFont || templateConfig.styling.headingFont,
        bodyFont: activeDesign.data.styling.bodyFont || templateConfig.styling.bodyFont,
        scriptFont: activeDesign.data.styling.scriptFont || templateConfig.styling.scriptFont,
        fontSizes: activeDesign.data.styling.fontSizes || templateConfig.styling.fontSizes,
        textColors: activeDesign.data.styling.textColors || templateConfig.styling.textColors,
      },
    };

    const isDefaultNewTitle = /^New .+ Testimonial$/.test(activeDesign.title);
    const updatedDesign: DesignRecord = {
      ...activeDesign,
      title: isNewUnsaved && isDefaultNewTitle ? `New ${templateConfig.name} Testimonial` : activeDesign.title,
      templateId,
      data: updatedData,
      thumbnail: getTemplateThumbnailUrl(templateId),
      canvasJson: undefined, // regenerate for new template
      updatedAt: new Date().toISOString(),
    };

    if (isNewUnsaved) {
      syncUrlToRoute({ view: 'editor', templateId });
    } else {
      syncUrlToRoute({ view: 'editor', designId: updatedDesign.id });
    }

    set({
      activeDesign: updatedDesign,
      activeTemplateId: templateId,
      hasUnsavedChanges: true,
      selectedObjectId: null,
      selectedProperties: null,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
    });
  },

  updateTemplateData: (updater) => {
    const { activeDesign } = get();
    if (!activeDesign) return;
    const newData = updater(activeDesign.data);
    set({
      activeDesign: {
        ...activeDesign,
        data: newData,
        updatedAt: new Date().toISOString(),
      },
      hasUnsavedChanges: true,
    });
  },

  updateHeader: (partial) => {
    get().updateTemplateData((data) => ({
      ...data,
      header: { ...data.header, ...partial },
    }));
  },

  updateContent: (partial) => {
    get().updateTemplateData((data) => ({
      ...data,
      content: { ...data.content, ...partial },
    }));
  },

  updateAuthor: (partial) => {
    get().updateTemplateData((data) => ({
      ...data,
      author: { ...data.author, ...partial },
    }));
  },

  updateMedia: (partial) => {
    get().updateTemplateData((data) => ({
      ...data,
      media: { ...data.media, ...partial },
    }));
  },

  updateStyling: (partial) => {
    get().updateTemplateData((data) => ({
      ...data,
      styling: { ...data.styling, ...partial },
    }));
  },

  updateFontSize: (field, size) => {
    get().updateTemplateData((data) => ({
      ...data,
      styling: {
        ...data.styling,
        fontSizes: {
          ...(data.styling.fontSizes || {}),
          [field]: size,
        },
      },
    }));
  },

  updateTextColor: (field, color) => {
    get().updateTemplateData((data) => ({
      ...data,
      styling: {
        ...data.styling,
        textColors: {
          ...(data.styling.textColors || {}),
          [field]: color,
        },
      },
    }));
  },

  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),

  setSelectedObject: (id, properties) =>
    set({ selectedObjectId: id, selectedProperties: properties }),

  updateSelectedProperties: (props) => {
    const { fabricCanvas, selectedProperties } = get();
    if (selectedProperties) {
      set({
        selectedProperties: {
          ...selectedProperties,
          ...props,
        },
      });
    }

    if (fabricCanvas) {
      const activeObj = fabricCanvas.getActiveObject();
      if (activeObj) {
        if (props.text !== undefined && 'text' in activeObj) {
          activeObj.set('text', props.text);
        }
        if (props.fontSize !== undefined) activeObj.set('fontSize', props.fontSize);
        if (props.fontFamily !== undefined) activeObj.set('fontFamily', props.fontFamily);
        if (props.fontWeight !== undefined) activeObj.set('fontWeight', props.fontWeight);
        if (props.fill !== undefined) activeObj.set('fill', props.fill);
        if (props.textAlign !== undefined) activeObj.set('textAlign', props.textAlign);
        if (props.opacity !== undefined) activeObj.set('opacity', props.opacity);

        fabricCanvas.requestRenderAll();
      }
    }
  },

  pushHistory: (state) => {
    const { history, historyIndex } = get();
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(state);
    if (nextHistory.length > 30) nextHistory.shift();

    set({
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
      canUndo: nextHistory.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const { fabricCanvas, history, historyIndex } = get();
    if (!fabricCanvas || historyIndex <= 0) return;

    const targetIndex = historyIndex - 1;
    const targetState = history[targetIndex];
    fabricCanvas.loadFromJSON(targetState, () => {
      fabricCanvas.renderAll();
      set({
        historyIndex: targetIndex,
        canUndo: targetIndex > 0,
        canRedo: true,
      });
    });
  },

  redo: () => {
    const { fabricCanvas, history, historyIndex } = get();
    if (!fabricCanvas || historyIndex >= history.length - 1) return;

    const targetIndex = historyIndex + 1;
    const targetState = history[targetIndex];
    fabricCanvas.loadFromJSON(targetState, () => {
      fabricCanvas.renderAll();
      set({
        historyIndex: targetIndex,
        canUndo: true,
        canRedo: targetIndex < history.length - 1,
      });
    });
  },
  };
});

