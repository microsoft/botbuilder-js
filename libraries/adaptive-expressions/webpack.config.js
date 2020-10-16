const path = require('path');
const defaultTSConfig = require('./tsconfig.json');

module.exports = (env, argv) => {
    return {
        mode: 'none',

        entry: {
            index: './src/index.ts',
        },
        output: {
            path: path.resolve(__dirname, './dist'),
            libraryTarget: 'amd',
            filename: 'index.js',
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
                    options: {
                        compilerOptions: {
                            ...defaultTSConfig.compilerOptions,
                            outDir: './dist',
                        },
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                        },
                    ],
                    include: [
                        path.resolve(
                            __dirname,
                            './node_modules/@microsoft/recognizers-text-data-types-timex-expression'
                        ),
                        path.resolve(__dirname, './node_modules/antlr4ts'),
                        path.resolve(__dirname, './node_modules/lru-cache'),
                        path.resolve(__dirname, './node_modules/yallist'),
                    ],
                },
            ],
        },
    };
};
