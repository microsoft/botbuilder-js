const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Returns absolute path to package.json file for a package
const resolvePackageJson = (name) => require.resolve(`${name}/package.json`);

// Returns absolute path to directory containing package.json file for a package
const resolvePackageRoot = (name) => path.dirname(resolvePackageJson(name));

module.exports = () => {
    const dist = path.resolve(__dirname, 'dist');

    return {
        mode: 'none',
        entry: path.resolve(__dirname, 'src', 'index.ts'),
        output: {
            path: dist,
            libraryTarget: 'amd',
            filename: 'index.js',
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
        devtool: 'none',
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    include: path.resolve(__dirname, 'src'),
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: { compact: false },
                    include: [
                        resolvePackageRoot('adaptive-expressions'),
                        resolvePackageRoot('@microsoft/recognizers-text-data-types-timex-expression'),
                        resolvePackageRoot('antlr4ts'),
                        resolvePackageRoot('lru-cache'),
                        resolvePackageRoot('yallist'),
                    ],
                },
            ],
        },
        plugins: [new CleanWebpackPlugin()],
    };
};
