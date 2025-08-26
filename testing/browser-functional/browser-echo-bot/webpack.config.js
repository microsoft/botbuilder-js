/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { join, resolve, dirname } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// Returns absolute path to package.json file for a package
const resolvePackageJson = (name) => require.resolve(`${name}/package.json`);

// Returns absolute path to directory containing package.json file for a package
const resolvePackageRoot = (name) => dirname(resolvePackageJson(name));

module.exports = {
    entry: './src/app.ts',
    devtool: 'source-map',
    devServer: {
        static: './dist',
        hot: true,
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                include: [
                    join(__dirname, 'src'),
                    resolvePackageRoot('botbuilder-core'),
                    resolvePackageRoot('botbuilder-dialogs'),
                ],
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [{ from: resolve(__dirname, 'index.html'), to: '' }],
        }),
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    resolve: {
        extensions: ['.css', '.js', '.ts'],
        fallback: {
            fs: false,
            net: false,
            tls: false,
            vm: false,
            path: false,
            crypto: false,
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
            'process/browser': require.resolve('process/browser'),
        },
        alias: {
            crypto: resolve(__dirname, 'crypto-shim.js'),
        },
    },
    output: {
        filename: 'app.js',
        path: resolve(__dirname, 'dist'),
    },
};
