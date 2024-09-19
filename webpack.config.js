const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/renderer.ts',
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, 'dist'),
        sourceMapFilename: '[file].map'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ],
    }
};
