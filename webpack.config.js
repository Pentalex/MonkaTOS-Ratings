/* eslint-env node, mocha */
const webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin");
// ClosurePlugin = require("closure-webpack-plugin");

// load the secrets
const alias = {};

const secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js");

const fileExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "eot",
    "otf",
    "svg",
    "ttf",
    "woff",
    "woff2",
];

if (fileSystem.existsSync(secretsPath)) {
    alias["secrets"] = secretsPath;
}

const options = {
    mode: env.NODE_ENV,
    entry: {
        options: path.join(__dirname, "src", "js", "options.js"),
        background: path.join(__dirname, "src", "js", "background.js"),
        content: path.join(__dirname, "src", "js", "content.js"),
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].bundle.js",
        sourceMapFilename: "[name].js.map",
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                exclude: /node_modules/,
            },
            {
                test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
                loader: "file-loader",
                options: { name: "[name].[ext]" },
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: alias,
    },
    plugins: [
        // clean the build folder
        new CleanWebpackPlugin(),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.EnvironmentPlugin({ NODE_ENV: env.NODE_ENV }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "src/manifest.json",
                    transform: (content /*path*/) =>
                        // generates the manifest file using the package.json informations
                        Buffer.from(
                            JSON.stringify({
                                description:
                                    process.env.npm_package_description,
                                version: process.env.npm_package_version,
                                ...JSON.parse(content.toString()),
                            })
                        ),
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "popup.html"),
            filename: "popup.html",
            chunks: ["popup"],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "options.html"),
            filename: "options.html",
            chunks: ["options"],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "index.html"),
            filename: "index.html",
            chunks: ["index"],
        }),
    ],
    // optimization: {
    // TODO: get closure compiler working
    // minimizer: [
    //     new ClosurePlugin({
    //         mode: "STANDARD",
    //         childCompilations: true
    //     }, {
    //         languageOut: "ECMASCRIPT5",
    //         compilation_level: "ADVANCED"
    //     })
    // ],
    // },
    devServer: {
        port: env.PORT || 3000,
    },
};

if (env.NODE_ENV === "development") {
    // This doesn't work in chrome.
    // options.devtool = "eval-cheap-module-source-map";
    options.devtool = "inline-cheap-module-source-map";
}

module.exports = options;
