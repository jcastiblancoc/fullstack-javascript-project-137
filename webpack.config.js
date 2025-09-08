import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            sourceType: 'module'
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.json$/,
        type: 'json'
      }
    ],
  },
  devServer: {
    static: './dist',
  },
  mode: 'development',
};
