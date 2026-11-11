import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function githubPagesSpaFallback(basePath: string): Plugin {
  const withLeading = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedBase = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  const pathSegmentsToKeep =
    normalizedBase === '/' ? 0 : normalizedBase.slice(1, -1).split('/').length;

  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Testimonial Studio</title>
    <script>
      (function () {
        var l = window.location;
        if (l.search.indexOf('p=') !== -1) return;
        var segs = ${pathSegmentsToKeep};
        var parts = l.pathname.split('/');
        var base = parts.slice(0, 1 + segs).join('/') + '/';
        var route = '/' + parts.slice(1 + segs).join('/');
        var query = l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '';
        l.replace(l.protocol + '//' + l.host + base + '?p=' + encodeURIComponent(route) + query + l.hash);
      })();
    </script>
  </head>
  <body></body>
</html>
`,
      });
    },
  };
}

const basePath = process.env.VITE_BASE_PATH || '/';

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react(), githubPagesSpaFallback(basePath)],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || '.', './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
