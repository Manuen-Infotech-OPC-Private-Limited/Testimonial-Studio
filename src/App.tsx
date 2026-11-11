import React, { useEffect, useCallback, useRef } from 'react';
import { Sidebar, MobileBottomNav } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TemplatesView } from './components/dashboard/TemplatesView';
import { MyDesignsView } from './components/dashboard/MyDesignsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { EditorView } from './components/editor/EditorView';
import { AuthView } from './components/auth/AuthView';
import { ModalHost } from './components/common/ModalHost';
import { useStudioStore } from './store/useStudioStore';
import { hasSessionHint } from './utils/storageApi';
import {
  isLoginUrl,
  parseCurrentRoute,
  RouteInfo,
  setNavigatingFromUrl,
  syncUrlToLogin,
  syncUrlToRoute,
} from './utils/router';

export const App: React.FC = () => {
  const {
    user,
    currentView,
    initAuth,
    loadDesigns,
    refreshDesigns,
    setCurrentView,
    createNewDesign,
    openDesign,
  } = useStudioStore();

  const intendedRouteRef = useRef<RouteInfo>(parseCurrentRoute());

  const handleRoute = useCallback(async (isInitial = false, overrideRoute?: RouteInfo) => {
    const route = overrideRoute || parseCurrentRoute();
    let resolvedRoute = route;
    setNavigatingFromUrl(true);
    try {
      if (route.view === 'editor') {
        if (route.designId) {
          await openDesign(route.designId);
          const activeId = useStudioStore.getState().activeDesign?.id;
          if (!activeId) {
            resolvedRoute = { view: 'designs' };
            setCurrentView('designs');
          }
        } else if (route.templateId) {
          await createNewDesign(route.templateId);
          resolvedRoute = { view: 'editor', templateId: route.templateId };
        } else {
          if (!useStudioStore.getState().activeDesign) {
            const fallbackTemplate = useStudioStore.getState().activeTemplateId || 'template-1';
            await createNewDesign(fallbackTemplate);
            resolvedRoute = { view: 'editor', templateId: fallbackTemplate };
          } else {
            setCurrentView('editor');
          }
        }
      } else {
        setCurrentView(route.view);
      }
    } finally {
      setNavigatingFromUrl(false);
      if (isInitial || resolvedRoute.designId !== route.designId || resolvedRoute.view !== route.view) {
        syncUrlToRoute(resolvedRoute, true);
      }
    }
  }, [createNewDesign, openDesign, setCurrentView]);

  const showWorkspace = Boolean(user) || hasSessionHint();

  useEffect(() => {
    if (!showWorkspace) {
      if (isLoginUrl()) {
        intendedRouteRef.current = { view: 'dashboard' };
      }
      syncUrlToLogin(true);
    }
  }, [showWorkspace]);

  useEffect(() => {
    const init = async () => {
      if (hasSessionHint()) {
        // Optimistic workspace shell is already visible; verify auth, designs, and deep route concurrently
        const [authedUser] = await Promise.all([
          initAuth(),
          loadDesigns(),
          handleRoute(true),
        ]);
        if (!authedUser) {
          useStudioStore.getState().signOut();
        }
      } else {
        const authedUser = await initAuth();
        if (authedUser) {
          await Promise.all([loadDesigns(), handleRoute(true, intendedRouteRef.current)]);
        }
      }
    };

    void init();

    // Browser navigation & cross-tab/cross-browser focus refresh listeners
    const onLocationChange = () => {
      if (useStudioStore.getState().user) {
        void handleRoute(false);
      }
    };

    const onWindowFocus = () => {
      const state = useStudioStore.getState();
      if (state.user && (state.currentView === 'dashboard' || state.currentView === 'designs')) {
        void refreshDesigns();
      }
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    window.addEventListener('focus', onWindowFocus);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [handleRoute, initAuth, loadDesigns, refreshDesigns]);

  let content: React.ReactNode;

  if (!showWorkspace) {
    content = (
      <AuthView
        onAuthSuccess={() => void handleRoute(true, intendedRouteRef.current)}
      />
    );
  } else if (currentView === 'editor') {
    content = <EditorView />;
  } else {
    content = (
      <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-slate-50">
        <Sidebar />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F4F6FB]">
          <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'templates' && <TemplatesView />}
            {currentView === 'designs' && <MyDesignsView />}
            {currentView === 'settings' && <SettingsView />}
          </main>
        </div>

        <MobileBottomNav />
      </div>
    );
  }

  return (
    <>
      {content}
      <ModalHost />
    </>
  );
};

export default App;
