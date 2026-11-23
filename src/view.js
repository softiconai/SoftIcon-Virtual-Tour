import './public-path';
import { text } from './viewer/messages';
import { cleanScenes, cleanView, link, viewStyle } from './utils/scene';

const SELECTOR = '.alvt_tour';

// Pannellum and the tour code: their own chunks, loaded only for a tour near the screen
const loadTour = () => import( /* webpackChunkName: "tour" */ './viewer/Tour' );

// The scenes are cleaned again here, as Block::scenes() does: post content can also hold a hand-written
// .alvt_tour element (a Custom HTML block) that render.php never saw, with a javascript: link in it.
const configOf = ( el ) => {
	try {
		const config = JSON.parse( el.dataset.alvt || '{}' );
		if ( ! config || 'object' !== typeof config || ! Array.isArray( config.scenes ) ) {
			return null;
		}
		const sizes = new Map( config.scenes.map( ( scene ) => [ scene?.id, scene ] ) );
		const scenes = cleanScenes( config.scenes, !! config.editor ).map( ( scene ) => {
			const raw = sizes.get( scene.id ) || {};
			return { ...scene, small: link( raw.small ), thumb: link( raw.thumb ), width: Math.max( 0, Number( raw.width ) || 0 ) };
		} );
		return { ...config, ...cleanView( config ), scenes };
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
			// the load button had the focus: the viewer takes it
			if ( el.alvtFocus ) {
				el.querySelector( '.alvt_viewer' )?.focus();
			}
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

// "Load the tour on click": the first scene's picture with a button; the viewer loads when it is pressed
const start = ( el ) => {
	el.alvtClicked = true;
	const button = el.querySelector( '.alvt_load' );
	if ( button ) {
		el.alvtFocus = el.ownerDocument.activeElement === button;
		button.remove();
	}
	// eslint-disable-next-line no-use-before-define
	sync( el );
};

const loadButton = ( el ) => {
	const stage = el.querySelector( '.alvt_stage' );
	if ( stage && ! stage.querySelector( '.alvt_load' ) ) {
		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'alvt_load';
		button.textContent = text.load;
		button.addEventListener( 'click', () => start( el ) );
		stage.append( button );
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
	if ( config.loadOnClick && ! config.editor && ! el.alvtClicked ) {
		loadButton( el );
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

// the current scene in the list
const mark = ( el, id ) => el.querySelectorAll( '.alvt_scenes .alvt_scene[data-id]' ).forEach( ( item ) => {
	const on = item.dataset.id === id;
	item.classList.toggle( 'is-current', on );
	item.firstChild?.setAttribute?.( 'aria-current', on ? 'true' : 'false' );
} );

// The page's colors, and the scene names under the viewer (render.php) as buttons, with a small picture
// for "thumbnails". A button opens its scene, and starts the viewer when it is not running yet.
// The editor's block draws its own list (Edit.js).
const page = ( el ) => {
	const config = configOf( el );
	if ( ! config || config.editor ) {
		return;
	}
	Object.entries( viewStyle( config ) ).forEach( ( [ name, value ] ) => value && el.style.setProperty( name, value ) );
	const list = el.querySelector( '.alvt_scenes' );
	// without WebGL the names stay plain text
	if ( ! list || list.hidden || ! measure() ) {
		return;
	}
	const thumbs = 'thumbnails' === config.sceneList;
	list.classList.toggle( 'alvt_thumbs', thumbs );
	list.querySelectorAll( '.alvt_scene[data-id]' ).forEach( ( item ) => {
		const scene = config.scenes.find( ( one ) => one.id === item.dataset.id );
		if ( ! scene ) {
			return;
		}
		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'alvt_pick';
		if ( thumbs && scene.thumb ) {
			const image = document.createElement( 'img' );
			image.src = scene.thumb;
			image.alt = '';
			image.loading = 'lazy';
			image.decoding = 'async';
			button.append( image );
		} else if ( thumbs ) {
			const box = document.createElement( 'span' );
			box.className = 'alvt_nopic';
			button.append( box );
		}
		const name = document.createElement( 'span' );
		name.textContent = item.textContent.trim();
		button.append( name );
		button.addEventListener( 'click', () => {
			el.alvtShow = scene.id;
			mark( el, scene.id );
			if ( el.alvt ) {
				el.alvt.show( scene.id );
			} else {
				start( el );
			}
		} );
		item.replaceChildren( button );
	} );
	mark( el, config.scenes[ 0 ]?.id );
	el.addEventListener( 'alvt:scene', ( event ) => mark( el, event.detail?.id ) );
};

// each element once, a later boot only picks up the new ones
const boot = () => {
	const all = [ ...document.querySelectorAll( SELECTOR ) ].filter( ( el ) => ! el.alvtSeen );
	all.forEach( ( el ) => {
		el.alvtSeen = true;
		page( el );
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
