let CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtendedDefinePlugin = require('extended-define-webpack-plugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let _getParam = (name) => process.argv.find(p => p.startsWith(`--${name}=`)).split("=")[1];

let env = _getParam("env");


const config = {
  amazon: {
    environment: env,
    tabUrlRegEx: /^http(s)?:\/\/music\.amazon\..+/,
    showVolumeBar: false,
    openPlayerUrl: "https://music.amazon.com",
    reviewsUrl: "https://chrome.google.com/webstore/detail/amazon-web-app-playback/lnkimoaahjmlmbiafbfjdjdnmmoeecoo/reviews"
  },
  spotify: {
    environment: env,
    tabUrlRegEx: /^http(s)?:\/\/\w+\.spotify\.com.+/,
    showVolumeBar: true,
    openPlayerUrl: "https://open.spotify.com",
    reviewsUrl: "https://chrome.google.com/webstore/detail/spotify-web-app-playback/goikghbjckploljhlfmjjfggccmlnbea/reviews"
  }
}

module.exports = {
  entry: {
    popup: [
      `./src/popup.ts`,
      `./src/main.scss`
    ],
    background: "./src/background.ts",
    agent: `./src/${env}/agent.ts`,
    "component.setting": "./src/components/setting.scss"
  },
  output: {
    filename: "[name].js",
    path: __dirname + `/dist/${env}`
  },

  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".js", ".json"],
    plugins: [
      new TsConfigPathsPlugin()
    ]
  },

  module: {
    rules: [
      { test: /\.ts$/, loader: "awesome-typescript-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.scss$/,
        // test: /\.css|\.s(c|a)ss$/,
        use: [
          // {
          //   loader: './lit-scss.js',
          //   options: {
          //     minify: false, // defaults to false
          //   },
          // }, "extract-loader", // instead of style loaded together with lit-scss
          // "style-loader", // creates style nodes from JS strings
          MiniCssExtractPlugin.loader, // create css files, instead of style-loader
          "css-loader", // translates CSS into CommonJS
          // {
          //   loader: "typings-for-css-modules-loader", // instead of css-loader
          //   options: {
          //     modules: true,
          //     namedExport: true,
          //     camelCase: true
          //   }
          // },
          {
            loader: "sass-loader", // compiles Sass to CSS, using Node Sass by default
            options: {
              includePaths: [`src/${env}`]
            }
          }
        ]
      }
    ]
  },
  watchOptions: {
    ignored: /node_modules/
  },
  externals: {
    "chrome": "chrome"
  },
  plugins: [
    new CleanWebpackPlugin([`dist/${env}`]),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CopyWebpackPlugin([
      { from: "src/popup.html" },
      { from: "src/images", to: "images" },
      { from: `src/${env}/images`, to: "images" },
      { from: "src/lib", to: "lib" },
      { from: `src/${env}/manifest.json` },
      { from: `src/${env}/key.pem` }
    ]),
    new ExtendedDefinePlugin({
      __CONFIG__: config[env]
    })
  ]
};