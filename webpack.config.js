const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const preCSS = require('precss');
const autoPrefixer = require('autoprefixer');

const extractCSS = new MiniCssExtractPlugin({
  filename: '[name].fonts.css'
});
const extractSCSS = new MiniCssExtractPlugin({
  filename: '[name].styles.css'
});

const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

const prodPlugins = [
  new webpack.DefinePlugin({ // <-- key to reducing React's size
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  new webpack.optimize.AggressiveMergingPlugin(), // Merge chunks
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new HardSourceWebpackPlugin(),
  extractCSS,
  extractSCSS,
  new HtmlWebpackPlugin({
    inject: true,
    template: './public/index.html',
  }),
  new CopyWebpackPlugin(
    [
      { from: './public/assets/img', to: 'assets/img' },
    ],
    { copyUnmodified: false },
  ),
  new CompressionPlugin({
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
];
const devPlugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new HardSourceWebpackPlugin(),
  extractCSS,
  extractSCSS,
  new HtmlWebpackPlugin({
    inject: true,
    template: './public/index.html',
  }),
  new CopyWebpackPlugin(
    [
      { from: './public/assets/img', to: 'assets/img' },
      { from: './public/favicon.ico', to: 'assets/img/favicon.ico' },
      { from: './public/manifest.json', to: 'assets/manifest.json' },
    ],
    { copyUnmodified: false },
  ),
  new CompressionPlugin({
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
];

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  entry: {
    index: ['@babel/polyfill', `${SRC_DIR}/index.js`],
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].bundle.js',
  },
  // watch: true,
  devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: {
    contentBase: BUILD_DIR,
    //   port: 9001,
    compress: true,
    hot: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-syntax-dynamic-import", '@babel/plugin-transform-destructuring',
              '@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties'],
          },
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader',
        }, {
          loader: 'postcss-loader', // Run post css actions
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            // loader: 'url-loader'
            loader: 'file-loader',
            options: {
              name: './img/[name].[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: './fonts/[name].[hash].[ext]',
        },
      }],
  },
  plugins: env.prod ? prodPlugins : devPlugins,
});
