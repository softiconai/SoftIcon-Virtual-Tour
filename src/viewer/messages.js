import { __, sprintf } from '@wordpress/i18n';

// the viewer's text: WordPress translates view.js, not the lazy chunks, so view.js passes this to them
export const text = {
	close: __( 'Close', 'softicon-virtual-tour' ),
	hotspot: __( 'Hotspot', 'softicon-virtual-tour' ),
	load: __( 'View in 360°', 'softicon-virtual-tour' ),
	noWebgl: __( 'This browser cannot show the 360° view.', 'softicon-virtual-tour' ),
	// translators: %s: the scene's name
	view: ( scene ) => sprintf( __( '360° view: %s. Use the arrow keys to look around and + or - to zoom.', 'softicon-virtual-tour' ), scene ),
	// translators: %s: the scene's name
	goTo: ( scene ) => sprintf( __( 'Go to %s', 'softicon-virtual-tour' ), scene ),
	// translators: %d: the scene's number in the tour
	scene: ( n ) => sprintf( __( 'Scene %d', 'softicon-virtual-tour' ), n ),
	// Pannellum's own text; %s stands for its values
	pannellum: {
		loadButtonLabel: __( 'Click to load panorama', 'softicon-virtual-tour' ),
		loadingLabel: __( 'Loading…', 'softicon-virtual-tour' ),
		bylineLabel: '%s',
		noPanoramaError: __( 'No panorama image was given.', 'softicon-virtual-tour' ),
		fileAccessError: __( 'The panorama image could not be loaded.', 'softicon-virtual-tour' ),
		malformedURLError: __( 'The address of the panorama image is not right.', 'softicon-virtual-tour' ),
		iOS8WebGLError: __( 'This browser cannot show the 360° view.', 'softicon-virtual-tour' ),
		genericWebGLError: __( 'This browser cannot show the 360° view.', 'softicon-virtual-tour' ),
		textureSizeError: __( 'This panorama is too big for this device.', 'softicon-virtual-tour' ),
		unknownError: __( 'The panorama could not be shown.', 'softicon-virtual-tour' ),
	},
};
