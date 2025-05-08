// vite.config.mjs
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path';

export default defineConfig({
    plugins: [preact()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
                content: resolve(__dirname, 'src/content.js'),
                background: resolve(__dirname, 'src/background.js'),
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
    }
})