/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));

const external = [/^botbuilder-/, /^botframework-/];

export default defineConfig((options) => {
    return {
        name: 'browser',
        platform: 'browser',
        entry: options.define?.entry?.split(' ') ?? ['./src/index.ts'],
        format: ['cjs'],
        bundle: true,
        sourcemap: true,
        minify: options.minify !== false,
        treeshake: true,
        splitting: false,
        external,
        env: {
            NODE_ENV: 'production',
        },
        noExternal: Object.keys(packageJson.dependencies).filter((packageName) => {
            return !external.some((e) => packageName.match(e));
        }),
        esbuildOptions(options) {
            options.outdir = '';
            options.outfile = options.define.outfile ?? 'lib/browser.js';
            options.inject = [resolve(__dirname, 'esbuild.inject.js')];
            options.define = {
                global: 'globalThis',
            };
            options.alias = {
                assert: 'assert',
                crypto: resolve(__dirname, 'crypto-shim.js'),
                http: 'stream-http',
                https: 'https-browserify',
                stream: 'stream-browserify',
                // Changed from .browser to .es5 file, as imported classes are not exported in .browser file.
                '@microsoft/recognizers-text-data-types-timex-expression':
                    '@microsoft/recognizers-text-data-types-timex-expression/dist/recognizers-text-data-types-timex-expression.es5.js',
            };
        },
        esbuildPlugins: [
            polyfillNode({
                polyfills: {
                    assert: false,
                    buffer: false,
                    child_process: true,
                    crypto: false,
                    fs: true,
                    http: false,
                    https: false,
                    net: true,
                    process: false,
                    stream: false,
                    tls: true,
                },
            }),
        ],
    };
});
