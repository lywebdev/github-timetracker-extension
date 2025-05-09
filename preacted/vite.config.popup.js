import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import {viteStaticCopy} from "vite-plugin-static-copy";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: 'popup.html',
                    dest: ''
                }
            ]
        }),
        cssInjectedByJsPlugin(),
    ],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'popup.jsx'),
            output: {
                entryFileNames: 'popup.js',
                inlineDynamicImports: true
            }
        },
        outDir: 'dist',
        emptyOutDir: false,
        // minify: false
    }
});
