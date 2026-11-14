const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const CopyPlugin = require('copy-webpack-plugin');

// drop the RTL stylesheet copies wp-scripts emits, the styles use logical properties instead
const plugins = defaultConfig.plugins.filter(p => !(Object.values(p).length === 2 && Object.values(p)?.[1]?.filename === '[name]-rtl.css'));

// css-loader leaves url(./alvt) alone: a marker for the build folder (--alvt-build in style.scss), not a file
const MARKER = /^(\.\/)?alvt$/;
const rules = defaultConfig.module.rules.map(rule => (Array.isArray(rule.use) ? {
	...rule,
	use: rule.use.map(use => (use && use.options && 'importLoaders' in use.options
		? { ...use, options: { ...use.options, url: { filter: url => !MARKER.test(url) } } }
		: use))
} : rule));

// the viewer libraries (chosen in step 4a): each one its own lazy chunk under its own name, with its license
// { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/, license: 'node_modules/three/LICENSE' }
const LIBRARIES = [];

const patterns = LIBRARIES.filter(lib => lib.license).map(lib => ({ from: lib.license, to: `${lib.name}-LICENSE.txt` }));

module.exports = {
	...defaultConfig,
	module: { ...defaultConfig.module, rules },
	// the lazy chunks get a version, so a browser never mixes a cached old chunk with a new view.js
	output: { ...defaultConfig.output, chunkFilename: '[name].js?ver=[contenthash:8]' },
	optimization: {
		...defaultConfig.optimization,
		splitChunks: {
			...defaultConfig.optimization.splitChunks,
			cacheGroups: {
				...defaultConfig.optimization.splitChunks.cacheGroups,
				...Object.fromEntries(LIBRARIES.map(lib => [lib.name, { test: lib.test, name: lib.name, chunks: 'async', enforce: true }]))
			}
		}
	},
	plugins: [
		...plugins,
		...(patterns.length ? [new CopyPlugin({ patterns })] : [])
	]
};
