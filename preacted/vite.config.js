import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'

export default defineConfig({
    plugins: [preact()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
                background: resolve(__dirname, 'src/background/index.js'),
                content: resolve(__dirname, 'src/content/index.js')
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        }
    }
})