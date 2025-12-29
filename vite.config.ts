import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;

          // Core frameworks
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';

          // UI and primitives
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('lucide-react') || id.includes('lucide')) return 'icons';
          if (id.includes('sonner')) return 'toasts';

          // Data, queries, and auth
          if (id.includes('@tanstack')) return 'tanstack';
          if (id.includes('@supabase')) return 'supabase';

          // Charts and visualization
          if (id.includes('recharts')) return 'charts';

          // Router, forms, and utils
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('react-hook-form') || id.includes('@hookform')) return 'forms';
          if (id.includes('date-fns')) return 'date-fns';
          if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) return 'utils';

          // Smaller feature libs
          if (id.includes('cmdk')) return 'cmdk';
          if (id.includes('react-day-picker')) return 'daypicker';
          if (id.includes('next-themes')) return 'themes';
          if (id.includes('input-otp')) return 'otp';
          if (id.includes('react-resizable-panels')) return 'panels';
          if (id.includes('vaul') || id.includes('zod')) return 'validation';

          // Fallback vendor chunk
          return 'vendor';
        },
      },
    },
  },
}));
