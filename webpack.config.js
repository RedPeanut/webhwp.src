const path = require('path');
const child_process = require('child_process');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env = {}) => {
	const pkg = require('./package.json');

	return {
		mode: env.production ? 'production' : 'development',
		entry: {
			'webhwp': './workspace/src/bundle/index.js'
		},
		output: {
			filename: 'js/[name].js',
			path: path.resolve(__dirname, 'dist')
		},
		module: {
			rules: [
				{
					test: /bundle\/.*\.js$/,
					exclude: /node_modules/,
					loader: "babel-loader"
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new CopyWebpackPlugin([
				'workspace/static'
			]),
		],
		optimization: {
			minimizer: [new UglifyJsPlugin({})]
		},
		devServer: {
			port: 8000,
			contentBase: path.join(__dirname, 'dist'),
			openPage: 'index.html',
		},
		node: {
			fs: 'empty',
		}
	};
};