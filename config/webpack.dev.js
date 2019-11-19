const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, '../src/index.js')
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(scss|sass)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' })
    ],
    devServer: {
        contentBase: path.join(__dirname, './dist'),
        publicPath: '/',
        port: 8080,
        host: '0.0.0.0',
        proxy: {},
        compress: true,
        historyApiFallback: true,
    }
};
module.exports = config;