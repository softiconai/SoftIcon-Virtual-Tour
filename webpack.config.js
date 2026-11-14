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

// the viewer libraries: each one its own lazy chunk under its own name (readme.txt names them), with its license
const LIBRARIES = [
	{ name: 'pannellum', test: /[\\/]node_modules[\\/]pannellum[\\/]build[\\/]pannellum\.js$/, license: 'node_modules/pannellum/COPYING' }
];

const patterns = LIBRARIES.filter(lib => lib.license).map(lib => ({ from: lib.license, to: `${lib.name}-LICENSE.txt` }));

module.exports = {
	...defaultConfig,
	module: {
		...defaultConfig.module,
		rules: [
			...rules,
			// Pannellum without its two globals, so it never meets another plugin's copy (loaders/pannellum.js)
			{ test: LIBRARIES[0].test, use: [{ loader: require.resolve('./loaders/pannellum.js') }] }
		]
	},
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
