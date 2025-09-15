import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [],
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always', // Force inline styles for better WebView performance
    assets: 'inline' // Inline small assets
  },
  prefetch: {
    prefetchAll: true, // Aggressive prefetching for WebView
    defaultStrategy: 'viewport' // Only prefetch what's in viewport
  },
  vite: {
    build: {
      emptyOutDir: true,
      cssCodeSplit: false
    }
  }
});

