// Pannellum's build sets window.pannellum and window.libpannellum, and finds libpannellum through the global.
// Other plugins (WPVR) load their own copy, so here both become variables of this module instead: nothing is
// read from or written to window, and the module exports the viewer.
module.exports = function ( source ) {
	let found = 0;
	const local = source.replace( /window\.(lib)?pannellum\s*=/g, ( match, lib ) => {
		found++;
		return `var ${ lib || '' }pannellum=`;
	} );
	if ( 2 !== found ) {
		throw new Error( 'loaders/pannellum.js: Pannellum changed, window.pannellum and window.libpannellum were not found once each' );
	}
	return `${ local }\nmodule.exports = pannellum;\n`;
};
