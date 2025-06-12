import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // relative asset paths so that build output works on any hosting root
    server: {
        open: true,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
}); 