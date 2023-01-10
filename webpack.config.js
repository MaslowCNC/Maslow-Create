const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
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