const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Define plugins array
const plugins = [
  new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    inject: 'body'
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].css',
  })
];

// Add CopyWebpackPlugin only if assets directory exists and has actual files
const assetsDir = path.resolve(__dirname, 'src/assets');
if (fs.existsSync(assetsDir)) {
  // Get all files recursively
  const hasFiles = fs.readdirSync(assetsDir).some(item => {
    const itemPath = path.join(assetsDir, item);
    return fs.statSync(itemPath).isFile() || 
           (fs.statSync(itemPath).isDirectory() && fs.readdirSync(itemPath).length > 0);
  });
  
  if (hasFiles) {
    plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          { 
            from: './src/assets', 
            to: 'assets',
            noErrorOnMissing: true
          }
        ]
      })
    );
  } else {
    console.log('Assets directory is empty, skipping CopyWebpackPlugin');
  }
}

module.exports = {
  mode: 'development',
  entry: {
    main: ['./src/js/app.js', './src/css/styles.css']
  },
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devtool: 'source-map',
  devServer: {
    static: './dist',
    hot: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      }
    ]
  },
  plugins: plugins
}; 