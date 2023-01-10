const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader"
      }
    ]
  },
  resolve: {
    fallback: {
      fs: false,
      perf_hooks: false,
      os: false,
      worker_threads: false,
      crypto: false,
      stream: false,
      path: require.resolve("path-browserify"),
      "child_process": false,
    },
  },
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/flowDraw.js'),
  },
  output: {
        path: __dirname + '/dist/',
        filename: './js/flowDraw.bundle.js'
  },
  plugins: [
      new BrowserSyncPlugin({
          host: 'localhost',
          port: 3000,
          server: { baseDir: ['dist'] },
          files: ['./dist/*, !./dist/example001.jscad']
      }),
      new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'src/index.html',
          inject: false
      }),
      new CopyPlugin([
          { from: 'src/run/index.html', to: 'run/index.html' }
      ]),
  ],
  devtool: 'cheap-module-source-map'
}