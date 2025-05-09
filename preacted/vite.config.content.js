import { defineConfig } from 'vite';
import { resolve } from 'path';
import preact from "@preact/preset-vite";
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.'
                }
            ]
        })
    ],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'src/content/index.js'),
            output: {
                entryFileNames: 'content.js',
                inlineDynamicImports: true
            }
        },
        outDir: 'dist',
        emptyOutDir: false,
        minify: false
    }
});
