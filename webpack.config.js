var path = require('path')
var webpack = require('webpack')
module.exports = {
    entry: [
        './src/lemon.js',
        './src/style.css'
    ],
    output: {
        path: path.resolve('./dist'),
        filename: 'lemon.min.js',
        sourceMapFilename: '[file].map'
    },
    devtool: 'eval',
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins:[
        new webpack.optimize.UglifyJsPlugin()
    ]
}