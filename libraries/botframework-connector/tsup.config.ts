/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'tsup';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import packageJson from './package.json';

const external = [/^botbuilder-/, /^botframework-/];

export default defineConfig({
    name: 'browser',
    platform: 'browser',
    entry: ['./src/index.ts'],
    format: ['cjs'],
    bundle: true,
    sourcemap: true,
    minify: true,
    treeshake: true,
    splitting: false,
    external,
    noExternal: Object.keys(packageJson.dependencies).filter((packageName) => {
        return !external.some((e) => packageName.match(e));
    }),
    esbuildOptions(options) {
        options.outdir = '';
        options.outfile = './lib/browser.js';
        options.inject = ['./esbuild.inject.js'];
        options.define = {
            global: 'globalThis',
        };
        options.alias = {
            crypto: 'crypto-browserify',
            http: 'stream-http',
            https: 'https-browserify',
            stream: 'stream-browserify',
        };
    },
    esbuildPlugins: [
        polyfillNode({
            polyfills: {
                buffer: false,
                child_process: true,
                crypto: false,
                fs: true,
                http: false,
                https: false,
                net: true,
                stream: false,
                tls: true,
            },
        }),
    ],
});
