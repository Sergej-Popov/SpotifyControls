let CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtendedDefinePlugin = require('extended-define-webpack-plugin');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

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
    popup: `./src/popup.ts`,
    background: "./src/background.ts",
    agent: `./src/${env}/agent.ts`
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
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  watchOptions: {
    ignored: /node_modules/
  },
  externals: {
    "chrome": "chrome"
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "src/popup.html" },
      { from: `src/${env}/popup.css` },
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