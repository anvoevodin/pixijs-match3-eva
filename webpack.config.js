var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: path.resolve("src/index.js"),
	output: {
		path: path.resolve("build"),
		filename: "static/js/app.js"
	},
	resolve: {
		modules: [path.resolve("src"), path.resolve("node_modules")],
		extensions: [".js", ".json"]
	},
	devServer: {
		contentBase: path.resolve("build"),
		port: 3002
	},
	module: {
		loaders: [
			{
				test: /\.(js)?$/,
				loader: 'babel-loader',
				exclude: path.resolve(__dirname, "node_modules"),
				query: {
					presets: ['es2015']
				}
			}, {
				test: /\.(svg|ttf|woff2|woff|eot)$/,
				loader: "file-loader"
			}
		]
	}
};