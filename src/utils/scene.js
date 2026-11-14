// the editor's copy of Block::scenes() in includes/class-block.php: what the page will show. Change both together.

// scenes per block and hotspots per scene; the same numbers are in includes/class-block.php (SCENES, HOTSPOTS)
export const maxScenes = 50;
export const maxHotspots = 50;
export const hotspotTypes = [ 'scene', 'info', 'link' ];

// like wp_strip_all_tags(): tags go, and so does what is inside script and style
const strip = ( value ) => value.replace( /<(script|style)[^>]*?>[\s\S]*?<\/\1>/gi, '' ).replace( /<[^>]*>/g, '' );

export const text = ( value ) => ( 'string' === typeof value || 'number' === typeof value ? strip( String( value ) ).trim() : '' );

// as sanitize_text_field() leaves it (no %xx codes, single spaces), at most max characters
const line = ( value, max ) => [ ...text( value ).replace( /%[a-f0-9]{2}/gi, '' ).replace( /\s+/g, ' ' ).trim() ].slice( 0, max ).join( '' );

// as sanitize_key() keeps it
export const idOf = ( value ) => text( value ).toLowerCase().replace( /[^a-z0-9_-]/g, '' ).slice( 0, 40 );

const round = ( value ) => Math.round( value * 1000 ) / 1000;

// a number in min..max, or null; strings as PHP's is_numeric() takes them
export const num = ( value, min, max ) => {
	const number = 'string' === typeof value && /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*$/i.test( value ) ? Number( value ) : value;
	return 'number' === typeof number && Number.isFinite( number ) && number >= min && number <= max ? round( number ) : null;
};

// a http(s) address, or ''; like esc_url(), an address without a scheme gets http://
export const link = ( value ) => {
	const raw = text( value );
	if ( ! raw ) {
		return '';
	}
	if ( /^[/#?]/.test( raw ) ) {
		return raw;
	}
	try {
		const url = new URL( /^[a-z][a-z0-9+.-]*:/i.test( raw ) ? raw : 'http://' + raw );
		return [ 'http:', 'https:' ].includes( url.protocol ) ? url.href : '';
	} catch ( e ) {
		return '';
	}
};

const absint = ( value ) => Math.abs( parseInt( value, 10 ) ) || 0;

// null when the hotspot has no place or no type
export const cleanHotspot = ( raw, index ) => {
	if ( ! raw || 'object' !== typeof raw ) {
		return null;
	}
	const type = text( raw.type );
	const yaw = num( raw.yaw, -180, 180 );
	const pitch = num( raw.pitch, -90, 90 );
	if ( ! hotspotTypes.includes( type ) || null === yaw || null === pitch ) {
		return null;
	}
	return {
		id: idOf( raw.id ) || 'h' + index,
		type,
		yaw,
		pitch,
		title: line( raw.title, 200 ),
		// as sanitize_textarea_field() leaves it: line breaks stay
		text: [ ...text( raw.text ).replace( /%[a-f0-9]{2}/gi, '' ) ].slice( 0, 500 ).join( '' ),
		imageId: absint( raw.imageId ),
		imageUrl: link( raw.imageUrl ),
		target: idOf( raw.target ),
		url: link( raw.url ),
	};
};

// null when the scene has no image
export const cleanScene = ( raw, index ) => {
	if ( ! raw || 'object' !== typeof raw ) {
		return null;
	}
	const zoom = num( raw.zoom, 0, 100 );
	const scene = {
		id: idOf( raw.id ) || 's' + index,
		title: line( raw.title, 200 ),
		imageId: absint( raw.imageId ),
		imageUrl: link( raw.imageUrl ),
		alt: line( raw.alt, 300 ),
		yaw: num( raw.yaw, -180, 180 ) ?? 0,
		pitch: num( raw.pitch, -90, 90 ) ?? 0,
		zoom: zoom ?? 50,
		hotspots: ( Array.isArray( raw.hotspots ) ? raw.hotspots.slice( 0, maxHotspots ) : [] ).map( cleanHotspot ).filter( Boolean ),
	};
	return scene.imageUrl ? scene : null;
};

// each id once, hotspots that lead somewhere
export const cleanScenes = ( list ) => {
	const scenes = new Map();
	( Array.isArray( list ) ? list.slice( 0, maxScenes ) : [] ).map( cleanScene ).filter( Boolean ).forEach( ( scene ) => {
		if ( ! scenes.has( scene.id ) ) {
			scenes.set( scene.id, scene );
		}
	} );
	return [ ...scenes.values() ].map( ( scene ) => ( {
		...scene,
		hotspots: scene.hotspots.filter( ( spot ) => {
			if ( 'scene' === spot.type ) {
				return spot.target !== scene.id && scenes.has( spot.target );
			}
			return 'link' === spot.type ? !! spot.url : !! ( spot.title + spot.text + spot.imageUrl );
		} ),
	} ) );
};

// a new id, as sanitize_key() keeps it
export const newId = ( prefix ) => prefix + Math.random().toString( 36 ).slice( 2, 10 );

// a scene from a Media Library image: the original upload, not the -scaled copy WordPress makes of a big image
export const sceneFromMedia = ( media ) => {
	const original = media.media_details?.original_image;
	const url = media.originalImageURL || ( original && media.url ? media.url.replace( /[^/]+$/, original ) : media.url );
	return {
		id: newId( 's' ),
		title: line( media.title?.raw ?? media.title, 200 ),
		imageId: absint( media.id ),
		imageUrl: url || '',
		alt: line( media.alt ?? media.alt_text, 300 ),
		yaw: 0,
		pitch: 0,
		zoom: 50,
		hotspots: [],
	};
};

// equirectangular panoramas are twice as wide as high
export const isPanorama = ( media ) => {
	const width = media.width || media.media_details?.width;
	const height = media.height || media.media_details?.height;
	return ! width || ! height || Math.abs( ( width / height ) - 2 ) < 0.02;
};
