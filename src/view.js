import './public-path';
import { text } from './viewer/messages';

const SELECTOR = '.alvt_tour';

// Pannellum and the tour code: their own chunks, loaded only for a tour near the screen
const loadTour = () => import( /* webpackChunkName: "tour" */ './viewer/Tour' );

const configOf = ( el ) => {
	try {
		const config = JSON.parse( el.dataset.alvt || '{}' );
		return config && 'object' === typeof config && Array.isArray( config.scenes ) ? config : null;
	} catch ( e ) {
		return null;
	}
};

// the largest texture side WebGL takes on this device, 0 without WebGL; measured once per window
let maxTexture = null;
const measure = () => {
	if ( null === maxTexture ) {
		try {
			const gl = document.createElement( 'canvas' ).getContext( 'webgl' ) || document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
			maxTexture = gl ? gl.getParameter( gl.MAX_TEXTURE_SIZE ) || 0 : 0;
			gl?.getExtension( 'WEBGL_lose_context' )?.loseContext();
		} catch ( e ) {
			maxTexture = 0;
		}
	}
	return maxTexture;
};

const close = ( el ) => {
	el.alvt?.destroy();
	el.alvt = null;
};

const open = async ( el, config ) => {
	el.alvtLoading = true;
	try {
		const { default: Tour } = await loadTour();
		if ( el.isConnected && ! el.alvt && el.querySelector( '.alvt_viewer' ) ) {
			el.alvt = new Tour( el, configOf( el ) || config, text, measure() );
			el.alvt.init();
		}
	} catch ( error ) {
		// the first scene's picture stays
		close( el );
		// eslint-disable-next-line no-console
		console.error( 'SoftIcon Virtual Tour:', error );
	}
	el.alvtLoading = false;
};

// without WebGL the first scene's picture stays, with a short note
const noWebgl = ( el ) => {
	const stage = el.querySelector( '.alvt_stage' );
	if ( stage && ! stage.querySelector( '.alvt_note' ) ) {
		const note = document.createElement( 'p' );
		note.className = 'alvt_note';
		note.textContent = text.noWebgl;
		stage.append( note );
	}
};

// opens, updates or closes the viewer to match the block; the editor calls it again after every change
const sync = ( el ) => {
	const config = configOf( el );
	if ( ! config || ! config.scenes.length || ! el.querySelector( '.alvt_viewer' ) ) {
		close( el );
		return;
	}
	if ( el.alvt ) {
		el.alvt.update( config );
		return;
	}
	if ( el.alvtLoading ) {
		return;
	}
	if ( ! measure() ) {
		noWebgl( el );
		return;
	}
	open( el, config );
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
		// the editor asks where the viewer looks right now (Pannellum reports it only once a move has slowed down)
		el.addEventListener( 'alvt:ask', ( event ) => {
			if ( el.alvt?.viewer && event.detail ) {
				event.detail.view = el.alvt.current();
			}
		} );
		el.addEventListener( 'alvt:show', ( event ) => {
			el.alvtShow = event.detail?.id;
			el.alvt?.show( el.alvtShow, event.detail?.spot );
		} );
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
