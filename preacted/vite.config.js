import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.'
                },
                {
                    src: 'popup.html',
                    dest: ''
                }
            ]
        })
    ],
    build: {
        rollupOptions: {
            input: {
                // popup: resolve(__dirname, 'popup.html'),
                popup: 'popup.jsx',
                background: resolve(__dirname, 'src/background/index.js'),
                content: resolve(__dirname, 'src/content/index.js')
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    }
});


// export default defineConfig({
//     plugins: [
//         preact(),
//         viteStaticCopy({
//             targets: [
//                 {
//                     src: 'manifest.json',
//                     dest: '.'
//                 },
//                 {
//                     src: 'src/popup/popup.html',
//                     dest: ''
//                 }
//             ]
//         })
//     ],
//     build: {
//         rollupOptions: {
//             input: {
//                 popup: resolve(__dirname, 'src/popup/popup.jsx'),
//                 background: resolve(__dirname, 'src/background/popup.jsx'),
//                 content: resolve(__dirname, 'src/content/popup.jsx')
//             },
//             output: {
//                 entryFileNames: '[name].js',
//                 chunkFileNames: 'chunks/[name].js',
//                 assetFileNames: 'assets/[name].[ext]'
//             }
//         },
//         outDir: 'dist',
//         emptyOutDir: true
//     }
// })