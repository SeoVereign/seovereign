import { defineConfig } from 'vite';

export default defineConfig({
    base: '/', // Use absolute paths for Vercel deployment
    server: {
        open: true,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
}); 