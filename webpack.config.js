let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        popup: "./src/popup.ts",
        background: "./src/background.ts",
        agent: "./src/agent.ts"
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js", ".json"]
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    },
    externals: {
        "chrome": "chrome"
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/popup.html" },
            { from: "src/popup.css" },
            { from: "src/images", to: "images" },
            { from: "src/lib", to: "lib" },
            { from: "src/manifest.json" },
            { from: "src/key.pem" }
        ])
    ]
};