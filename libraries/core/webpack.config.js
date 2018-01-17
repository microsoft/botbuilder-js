module.exports = {
  entry: './src/botbuilder.ts',
  output: {
    filename: './lib-es5/botbuilder.js',
    library: 'botbuilder-core',
    libraryTarget: 'amd'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    loaders: [
      { test: /.ts$/, loader: 'awesome-typescript-loader?tsconfig=tsconfig-webpack.json' }
    ]
  }
};