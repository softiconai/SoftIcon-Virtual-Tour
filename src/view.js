import './public-path';

const SELECTOR = '.alvt_tour';

const configOf = ( el ) => {
	try {
		const config = JSON.parse( el.dataset.alvt || '{}' );
		return config && 'object' === typeof config && Array.isArray( config.scenes ) ? config : null;
	} catch ( e ) {
		return null;
	}
};

const close = ( el ) => {
	el.alvt?.destroy();
	el.alvt = null;
};

// opens, updates or closes the viewer to match the block; the editor calls it again after every change.
// The viewer chunk (step 4a) loads here; until then the first scene's picture from render.php stays.
const sync = ( el ) => {
	const config = configOf( el );
	if ( ! config || ! config.scenes.length ) {
		close( el );
		return;
	}
	el.alvt?.update( config );
};

const whenNear = ( elements, callback ) => {
	if ( ! ( 'IntersectionObserver' in window ) ) {
		elements.forEach( callback );
		return;
	}
	const observer = new IntersectionObserver( ( entries ) => entries.forEach( ( entry ) => {
		if ( entry.isIntersecting ) {
			observer.unobserve( entry.target );
			callback( entry.target );
		}
	} ), { rootMargin: '300px 0px' } );
	elements.forEach( ( el ) => observer.observe( el ) );
};

// each element once, a later boot only picks up the new ones
const boot = () => {
	const all = [ ...document.querySelectorAll( SELECTOR ) ].filter( ( el ) => ! el.alvtSeen );
	all.forEach( ( el ) => {
		el.alvtSeen = true;
		// sent by the block editor's preview
		el.addEventListener( 'alvt:update', () => sync( el ) );
		el.addEventListener( 'alvt:destroy', () => close( el ) );
	} );
	whenNear( all, sync );
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}

// for tours added to the page later, e.g. in a popup, and for the block editor
document.addEventListener( 'alvt:boot', boot );
