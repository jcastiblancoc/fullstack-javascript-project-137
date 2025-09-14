// webpack.config.js
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: './src/index.js',
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './_index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: './dist',
    // IMPORTANT: never open a browser in CI / headless runners.
    // Keep it false to avoid webpack-dev-server trying to open a browser
    // (which triggers wsl-utils and provoca el crash).
    open: false,
    port: 8080,
  },
  mode: 'development',
};
