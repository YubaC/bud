const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        index: "./src/js/index.js",
        home: "./src/js/home.js",
        archive: "./src/js/archive.js",
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.s?css$|\.sass$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/html/index.html",
            filename: "index.html",
            chunks: ["index"],
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/home.html",
            filename: "home.html",
            chunks: ["home"],
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/archive.html",
            filename: "archive.html",
            chunks: ["archive"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "./src/images", to: "images" },
                { from: "./src/lib", to: "lib" },
                { from: "./src/resources", to: "resources" },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
    ],
};
