import { defineConfig } from 'vite';
import { resolve } from 'path';
import preact from "@preact/preset-vite";
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
    plugins: [
        preact()
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
        minify: false
    }
});
