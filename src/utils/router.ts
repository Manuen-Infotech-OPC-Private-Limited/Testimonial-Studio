import { TemplateId, ViewMode } from '../types/studio';

export interface RouteInfo {
  view: ViewMode;
  templateId?: TemplateId;
  designId?: string;
}

// Convert aliases (e.g. 'luxury-gold' -> 'template-1')
export function normalizeTemplateId(slug?: string): TemplateId | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s === 'template-1' || s === 'luxury-gold' || s === 'luxury' || s === '1') return 'template-1';
  if (s === 'template-2' || s === 'elegant-minimal' || s === 'minimal' || s === '2') return 'template-2';
  if (s === 'template-3' || s === 'corporate-classic' || s === 'corporate' || s === '3') return 'template-3';
  return undefined;
}

export function templateIdToSlug(id: TemplateId): string {
  switch (id) {
    case 'template-1':
      return 'template-1';
    case 'template-2':
      return 'template-2';
    case 'template-3':
      return 'template-3';
    default:
      return id;
  }
}

function getNormalizedBasePath(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base === '/' ? '' : base.replace(/\/+$/, '');
}

function shouldUseHashRouting(): boolean {
  if (import.meta.env.VITE_HASH_ROUTING === 'true') return true;
  if (getNormalizedBasePath() !== '') return true;
  return typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
}

export function getTemplateThumbnailUrl(templateId: TemplateId | string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}templates/${templateId}.png`;
}

export function isLoginUrl(): boolean {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    return hash.slice(1).replace(/\/+$/, '') === '/login';
  }
  const basePrefix = getNormalizedBasePath();
  let path = window.location.pathname;
  if (basePrefix && (path === basePrefix || path.startsWith(`${basePrefix}/`))) {
    path = path.slice(basePrefix.length) || '/';
  }
  return path.replace(/\/+$/, '') === '/login';
}

/**
 * Parse current browser URL (supporting both HTML5 pathname and hash routing)
 */
export function parseCurrentRoute(): RouteInfo {
  let path = window.location.pathname;
  const hash = window.location.hash;

  // If hash is present and starts with '#/', prefer hash
  if (hash && hash.startsWith('#/')) {
    path = hash.slice(1); // remove '#'
  } else {
    const basePrefix = getNormalizedBasePath();
    if (basePrefix && (path === basePrefix || path.startsWith(`${basePrefix}/`))) {
      path = path.slice(basePrefix.length) || '/';
    }
  }

  // Remove leading/trailing slashes and split
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath ? cleanPath.split('/') : [];

  // Default root or login path -> dashboard after auth
  if (
    segments.length === 0 ||
    segments[0] === 'dashboard' ||
    segments[0] === 'login' ||
    segments[0] === 'signin' ||
    segments[0] === 'signup'
  ) {
    return { view: 'dashboard' };
  }

  const first = segments[0].toLowerCase();

  if (first === 'templates') {
    if (segments.length > 1) {
      const tmpl = normalizeTemplateId(segments[1]);
      if (tmpl) {
        return { view: 'editor', templateId: tmpl };
      }
    }
    return { view: 'templates' };
  }

  if (first === 'designs' || first === 'my-designs' || first === 'projects') {
    if (segments.length > 1) {
      return { view: 'editor', designId: segments[1] };
    }
    return { view: 'designs' };
  }

  if (first === 'settings') {
    return { view: 'settings' };
  }

  if (first === 'editor') {
    if (segments.length > 1) {
      if (segments[1] === 'design' && segments.length > 2) {
        return { view: 'editor', designId: segments[2] };
      }
      const tmpl = normalizeTemplateId(segments[1]);
      if (tmpl) {
        return { view: 'editor', templateId: tmpl };
      }
      // Could be design id directly: /editor/design-12345
      if (segments[1].startsWith('design-')) {
        return { view: 'editor', designId: segments[1] };
      }
    }
    return { view: 'editor' };
  }

  // Fallback to dashboard
  return { view: 'dashboard' };
}

/**
 * Generate standard URL path from RouteInfo
 */
export function getRouteUrl(route: RouteInfo): string {
  switch (route.view) {
    case 'dashboard':
      return '/dashboard';
    case 'templates':
      if (route.templateId) {
        return `/templates/${templateIdToSlug(route.templateId)}`;
      }
      return '/templates';
    case 'designs':
      return '/designs';
    case 'settings':
      return '/settings';
    case 'editor':
      if (route.designId) {
        return `/editor/design/${route.designId}`;
      }
      if (route.templateId) {
        return `/editor/${templateIdToSlug(route.templateId)}`;
      }
      return '/editor';
    default:
      return '/dashboard';
  }
}

let isNavigatingFromUrl = false;

export function setNavigatingFromUrl(val: boolean) {
  isNavigatingFromUrl = val;
}

export function isNavigatingFromUrlActive() {
  return isNavigatingFromUrl;
}

function navigateUrl(targetUrl: string, state: Record<string, unknown>, replace: boolean) {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;

  if (shouldUseHashRouting()) {
    const expectedHash = `#${targetUrl}`;
    if (currentHash === expectedHash) return;
    try {
      const basePath = `${getNormalizedBasePath()}/`;
      if (replace) {
        window.history.replaceState(state, '', `${basePath}${expectedHash}`);
      } else {
        window.history.pushState(state, '', `${basePath}${expectedHash}`);
      }
    } catch {
      window.location.hash = expectedHash;
    }
    return;
  }

  // Don't push if already at this URL (or hash)
  if (currentPath === targetUrl || (currentHash && currentHash.slice(1) === targetUrl)) {
    return;
  }

  try {
    if (replace) {
      window.history.replaceState(state, '', targetUrl);
    } else {
      window.history.pushState(state, '', targetUrl);
    }
  } catch {
    // Fallback to hash if pushState fails in restricted sandbox environments
    window.location.hash = '#' + targetUrl;
  }
}

export function syncUrlToLogin(replace = true) {
  navigateUrl('/login', { auth: true }, replace);
}

/**
 * Push or replace browser URL without full page reload
 */
export function syncUrlToRoute(route: RouteInfo, replace = false) {
  if (isNavigatingFromUrl) return;
  navigateUrl(getRouteUrl(route), { route }, replace);
}

