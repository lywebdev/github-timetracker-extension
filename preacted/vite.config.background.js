import { defineConfig } from 'vite';
import { resolve } from 'path';
import preact from "@preact/preset-vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
    plugins: [
        preact(),
        cssInjectedByJsPlugin(),
    ],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'src/background/index.js'),
            output: {
                entryFileNames: 'background.js',
                inlineDynamicImports: true
            }
        },
        outDir: 'dist',
        emptyOutDir: false,
        // minify: false
    }
});
