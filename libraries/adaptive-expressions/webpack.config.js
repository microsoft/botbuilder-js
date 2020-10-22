const path = require('path');

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';
    const devMode = mode === 'development';

    console.info('running webpack with mode:', mode);

    return {
        mode: mode,
        entry: {
            'adaptivecards-expressions': path.resolve(__dirname, './src/index.ts'),
        },
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: devMode ? '[name].js' : '[name].min.js',
            libraryTarget: 'umd',
            library: 'AEL',
            globalObject: 'this',
        },
        devtool: devMode ? 'inline-source-map' : 'source-map',
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    include: path.resolve(__dirname, './src'),
                },
            ],
        },
    };
};
