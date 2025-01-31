const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const argv = require('yargs').argv;
const { merge } = require('webpack-merge');

const isDev = !fs.existsSync(path.join(__dirname, '../../@canvest'));
let canvestTSFolderPath = '';

if (isDev) {
	canvestTSFolderPath = path.join(__dirname, '../canvest-ts');
}

let canvestTS = null;

try {
	let canvestTSPath = '';

	if (isDev) {
		canvestTSPath = canvestTSFolderPath;
	} else {
		canvestTSPath = path.join(process.cwd(), 'node_modules', '@canvest/canvest-ts');
	}

	if (argv.ts) {
		canvestTS = fs.existsSync(canvestTSPath);
	}
} catch (e) {
	canvestTS = null;
}

const rules = [];
const extensions = ['*', '.js', '.jsx'];
const plugins = [];

if (canvestTS) {
	console.log(chalk.yellow('loading ts-loader for Canvest'));

	extensions.push('.tsx', '.ts');

	let tsLoaderRule = {
		test: /\.tsx?$/,
		use: [
			{
				loader: `${isDev ? path.join(canvestTSFolderPath, '/node_modules/') : ''}ts-loader`,
				options: {
					transpileOnly: true,
				},
			},
		],
	};

	rules.push(tsLoaderRule);

	let tsPluginPath = '';

	if (isDev) {
		tsPluginPath = path.join(canvestTSFolderPath, 'node_modules/tsconfig-paths-webpack-plugin');
	} else {
		tsPluginPath = 'tsconfig-paths-webpack-plugin';
	}

	const TsconfigPathsPlugin = require(tsPluginPath);

	plugins.push(new TsconfigPathsPlugin({ configFile: path.join(process.cwd(), argv.ts) }));
}

const contentBase = [__dirname];

if (__dirname !== process.cwd()) {
	contentBase.push(process.cwd());
}

const baseConfig = {
	devServer: {
		open: true,
		static: contentBase,
	},
	devtool: 'inline-source-map',
	entry: [path.join(__dirname, './canvestInitScript/init.js'), path.join(__dirname, './canvestInitScript/run.js')],
	mode: 'development',
	module: {
		rules,
	},
	output: {
		filename: 'bundle.js',
		path: __dirname,
	},
	resolve: {
		extensions,
		plugins,
	},
};

// added support for webpack config customization
const customConfigFilename = 'canvest.webpack.cjs';
const customConfigPath = path.join(process.cwd(), customConfigFilename);

console.log('custom webpack config path: ' + customConfigPath);

let config;

if (fs.existsSync(customConfigPath)) {
    const customConfig = require(customConfigPath);

    config = merge(baseConfig, customConfig);
} else {
	config = baseConfig;
}

console.log('webpack config:', JSON.stringify(config));

module.exports = config;
