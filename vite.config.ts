import react from '@vitejs/plugin-react';
import * as path from 'node:path';
import { defineConfig } from 'vite';

const noop = path.resolve(__dirname, 'src/noop.ts');

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            fs: noop,
            path: noop,
        },
    },
});
