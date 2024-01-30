const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/js/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.s?css$|\.sass$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            // {
            //     test: /\.(png|svg|jpg|jpeg|gif)$/i,
            //     loader: "file-loader",
            //     options: {
            //         name: "[path][name].[ext]",
            //     },
            // },
            // {
            //     test: /\.(png|svg|jpg|jpeg|gif)$/i,
            //     type: "asset/resource",
            // },
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
            // 使用index.css
        }),
        new HtmlWebpackPlugin({
            template: "./src/html/relative-test.html",
            filename: "relative-test/index.html",
        }),
        new CopyWebpackPlugin({
            patterns: [
                // { from: "./src/fonts", to: "fonts" },
                { from: "./src/images", to: "images" },
                { from: "./src/lib", to: "lib" },
                { from: "./src/resources", to: "resources" },
                // 添加其他需要复制的文件或文件夹
            ],
        }),
    ],
};
