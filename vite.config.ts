import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const port = parseInt(env.VITE_PORT || env.ARCHON_HERALD_CLIENT_PORT || '4000', 10);

    return {
        base: '/',
        plugins: [react()],
        server: {
            port,
            proxy: {
                // Dev proxy: /api/* → flaxlap Drawbridge (which mounts Herald at /names)
                '/api': {
                    target: env.VITE_API_PROXY_TARGET || 'http://flaxlap.local:4222',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '/names/api'),
                },
                // OAuth endpoints (not under /api prefix on the server)
                '/oauth': {
                    target: env.VITE_API_PROXY_TARGET || 'http://flaxlap.local:4222',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/oauth/, '/names/oauth'),
                },
                // OIDC discovery
                '/.well-known': {
                    target: env.VITE_API_PROXY_TARGET || 'http://flaxlap.local:4222',
                    changeOrigin: true,
                    rewrite: (path) => `/names${path}`,
                },
            },
        },
        preview: {
            port,
            allowedHosts: true,
        },
        build: {
            outDir: './build',
        },
    };
});