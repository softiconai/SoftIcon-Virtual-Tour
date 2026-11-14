// Pannellum without its globals (loaders/pannellum.js), in its own chunk
import pannellum from 'pannellum/build/pannellum.js';
import { hfovOf, maxHfov, minHfov, zoomOf } from './zoom';

const SVG = 'http://www.w3.org/2000/svg';
const ICONS = {
	scene: 'M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8z',
	info: 'M11 7h2v2h-2zm0 4h2v6h-2z',
	link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0M7 11l-1.5 1.5a3.5 3.5 0 0 0 5 5L12 16l1.4 1.4-1.5 1.5a5.5 5.5 0 0 1-7.8-7.8l1.5-1.5zm10 2 1.5-1.5a3.5 3.5 0 0 0-5-5L12 8l-1.4-1.4 1.5-1.5a5.5 5.5 0 0 1 7.8 7.8L18.4 14.4z',
};

const icon = ( d ) => {
	const svg = document.createElementNS( SVG, 'svg' );
	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'aria-hidden', 'true' );
	svg.setAttribute( 'focusable', 'false' );
	const path = document.createElementNS( SVG, 'path' );
	path.setAttribute( 'd', d );
	svg.append( path );
	return svg;
};

const element = ( tag, className, content ) => {
	const el = document.createElement( tag );
	el.className = className;
	if ( content ) {
		el.textContent = content;
	}
	return el;
};

const round = ( value ) => Math.round( value * 100 ) / 100;

const reducedMotion = () => !! window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;

// one tour: the scenes of a block in Pannellum, its hotspots and the info popup
export default class Tour {
	constructor( el, config, text, maxTexture ) {
		this.el = el;
		this.box = el.querySelector( '.alvt_viewer' );
		this.config = config;
		this.text = text;
		this.maxTexture = maxTexture;
		// scenes whose original failed (too big, or blocked), shown from WordPress's smaller copy instead
		this.small = new Set();
	}

	init() {
		this.box.setAttribute( 'role', 'application' );
		this.onKey = ( event ) => {
			if ( 'Escape' === event.key && this.popup ) {
				this.closePopup();
			}
			// the block editor's own keys (arrows between blocks, Delete) stay out of the viewer
			if ( this.config.editor ) {
				event.stopPropagation();
			}
		};
		this.box.addEventListener( 'keydown', this.onKey );
		// the editor may have asked for a scene before the viewer was loaded
		const asked = this.byId( this.el.alvtShow );
		this.open( this.config, ( asked || this.config.scenes[ 0 ] )?.id );
	}

	// The editor sends the block's newest config after every change. The viewer stays on its scene and view,
	// and the panorama is loaded again only when the shown scene's image changed: typing a title costs nothing.
	update( config ) {
		const key = JSON.stringify( config );
		const id = this.viewer?.getScene();
		if ( key === this.key || ! this.viewer ) {
			return;
		}
		const before = this.byId( id );
		const now = this.byId( id, config );
		// Pannellum's hotspots can be changed in place only on a loaded scene
		if ( ! now || ! before || this.pictureOf( before ) !== this.pictureOf( now ) || ! this.viewer.isLoaded() ) {
			this.open( config, now ? id : config.scenes[ 0 ]?.id, now ? this.view() : null );
			return;
		}
		const next = this.scenesOf( config );
		const scenes = this.pnlm.scenes;
		this.config = config;
		this.key = key;
		// the other scenes are read again when they are opened
		Object.keys( scenes ).filter( ( other ) => other !== id && ! next[ other ] ).forEach( ( other ) => delete scenes[ other ] );
		Object.keys( next ).filter( ( other ) => other !== id ).forEach( ( other ) => {
			scenes[ other ] = next[ other ];
		} );
		// the shown scene: its hotspots in place, and a new start view is shown at once
		const shown = scenes[ id ];
		if ( JSON.stringify( before.hotspots ) !== JSON.stringify( now.hotspots ) ) {
			while ( shown.hotSpots.length ) {
				this.viewer.removeHotSpot( shown.hotSpots[ 0 ].id );
			}
			next[ id ].hotSpots.forEach( ( spot ) => this.viewer.addHotSpot( spot ) );
		}
		if ( before.yaw !== now.yaw || before.pitch !== now.pitch || before.zoom !== now.zoom ) {
			Object.assign( shown, { yaw: now.yaw, pitch: now.pitch, hfov: next[ id ].hfov } );
			this.viewer.lookAt( now.pitch, now.yaw, next[ id ].hfov, reducedMotion() ? false : 600 );
		}
		this.relabel();
	}

	// the editor's scene list opens a scene in the viewer
	// the editor's scene list opens a scene; with a hotspot, the view turns to it
	show( id, spotId ) {
		const scene = this.viewer && this.byId( id );
		const spot = scene?.hotspots.find( ( item ) => item.id === spotId );
		if ( ! scene ) {
			return;
		}
		if ( id !== this.viewer.getScene() ) {
			this.viewer.loadScene( id, spot ? spot.pitch : undefined, spot ? spot.yaw : undefined );
		} else if ( spot ) {
			this.viewer.lookAt( spot.pitch, spot.yaw, undefined, reducedMotion() ? false : 600 );
		}
	}

	view() {
		return { yaw: this.viewer.getYaw(), pitch: this.viewer.getPitch(), hfov: this.viewer.getHfov() };
	}

	// the scene and view as the block saves them
	current() {
		const at = this.view();
		return { scene: this.viewer.getScene(), yaw: round( at.yaw ), pitch: round( at.pitch ), zoom: Math.min( 100, Math.max( 0, zoomOf( at.hfov ) ) ) };
	}

	destroy() {
		this.closePopup();
		this.viewer?.destroy();
		this.viewer = null;
		this.box.removeEventListener( 'keydown', this.onKey );
		[ 'role', 'aria-label', 'tabindex' ].forEach( ( name ) => this.box.removeAttribute( name ) );
	}

	byId( id, config = this.config ) {
		return config.scenes.find( ( scene ) => scene.id === id );
	}

	titleOf( scene ) {
		return scene.title || this.text.scene( this.config.scenes.indexOf( scene ) + 1 );
	}

	// the original, or WordPress's smaller copy where the device cannot take the original as a texture
	// (Pannellum splits an equirectangular image in two, so up to twice MAX_TEXTURE_SIZE fits)
	pictureOf( scene ) {
		const tooBig = scene.width > 2 * this.maxTexture;
		return scene.small && ( tooBig || this.small.has( scene.id ) ) ? scene.small : scene.imageUrl;
	}

	open( config, first, view ) {
		this.closePopup();
		this.viewer?.destroy();
		this.config = config;
		this.key = JSON.stringify( config );
		if ( ! first ) {
			return;
		}
		const scenes = this.scenesOf( config );
		Object.assign( scenes[ first ], view || {} );
		this.controls = [];

		this.pnlm = {
			default: {
				firstScene: first,
				autoLoad: true,
				compass: false,
				// the page scrolls with the wheel; the wheel zooms only in fullscreen
				mouseZoom: 'fullscreenonly',
				minHfov,
				maxHfov,
				sceneFadeDuration: reducedMotion() ? 0 : 600,
				crossOrigin: 'anonymous',
				strings: this.text.pannellum,
			},
			scenes,
		};
		this.viewer = pannellum.viewer( this.box, this.pnlm );
		this.label();

		this.viewer.on( 'scenechange', ( id ) => {
			this.closePopup();
			this.label( id );
			this.emit( 'alvt:scene', { id } );
		} );
		// the original could not be shown (too big for the device, or blocked): once more with the smaller copy
		this.viewer.on( 'error', () => {
			const id = this.viewer.getScene();
			const scene = this.byId( id );
			if ( scene?.small && ! this.small.has( id ) ) {
				this.small.add( id );
				const kept = this.view();
				// after Pannellum has finished with its error
				window.setTimeout( () => this.viewer && this.open( this.config, id, kept ) );
			}
		} );
		// a click without a drag on the panorama: where it points, for a new hotspot in the editor;
		// and where the editor looks, for "Use the current view"
		if ( config.editor ) {
			const report = () => this.emit( 'alvt:view', this.current() );
			this.viewer.on( 'load', report );
			this.viewer.on( 'animatefinished', report );
			this.viewer.on( 'mousedown', ( event ) => {
				this.down = [ event.clientX, event.clientY ];
			} );
			this.viewer.on( 'mouseup', ( event ) => {
				const [ x, y ] = this.down || [];
				this.down = null;
				const [ pitch, yaw ] = undefined !== x && Math.hypot( event.clientX - x, event.clientY - y ) < 5 ? this.viewer.mouseEventToCoords( event ) : [];
				if ( Number.isFinite( yaw ) && Number.isFinite( pitch ) ) {
					this.emit( 'alvt:click', { scene: this.viewer.getScene(), yaw: round( yaw ), pitch: round( pitch ) } );
				}
			} );
		}
	}

	// the scenes as Pannellum takes them, by id
	scenesOf( config ) {
		const scenes = {};
		config.scenes.forEach( ( scene ) => {
			scenes[ scene.id ] = {
				type: 'equirectangular',
				panorama: this.pictureOf( scene ),
				yaw: scene.yaw,
				pitch: scene.pitch,
				hfov: hfovOf( scene.zoom ),
				hotSpots: scene.hotspots.map( ( spot ) => ( {
					id: spot.id,
					yaw: spot.yaw,
					pitch: spot.pitch,
					// "info" is Pannellum's plain hotspot; what it does is ours (activate)
					type: 'info',
					cssClass: 'alvt_spot alvt_spot_' + spot.type,
					createTooltipFunc: ( div ) => this.spot( div, spot ),
				} ) ),
			};
		} );
		return scenes;
	}

	// a scene's new title reaches the hotspots that lead to it
	relabel() {
		this.label();
		this.controls = this.controls.filter( ( { control } ) => control.isConnected );
		this.controls.forEach( ( { control, spot } ) => {
			control.classList.toggle( 'is-selected', spot.id === this.config.selected );
			const label = this.labelOf( spot );
			control.setAttribute( 'aria-label', label );
			const tip = control.querySelector( '.alvt_tip' );
			if ( tip ) {
				tip.textContent = label;
			}
		} );
	}

	labelOf( spot ) {
		const target = 'scene' === spot.type ? this.byId( spot.target ) : null;
		return spot.title || ( target ? this.text.goTo( this.titleOf( target ) ) : '' ) || spot.url || this.text.hotspot;
	}

	label( id = this.viewer?.getScene() ) {
		const scene = this.byId( id );
		if ( scene ) {
			this.box.setAttribute( 'aria-label', this.text.view( scene.alt || this.titleOf( scene ) ) );
		}
	}

	emit( type, detail ) {
		this.el.dispatchEvent( new window.CustomEvent( type, { detail } ) );
	}

	// a hotspot as a real button (a link for "link"), so it takes keyboard focus
	spot( div, spot ) {
		const label = this.labelOf( spot );
		const link = 'link' === spot.type && ! this.config.editor;
		const control = element( link ? 'a' : 'button', 'alvt_spot_button' );
		if ( link ) {
			control.href = spot.url;
			control.rel = 'noopener';
		} else {
			control.type = 'button';
		}
		control.setAttribute( 'aria-label', label );
		control.append( icon( ICONS[ spot.type ] ) );
		// the editor: the hotspot being edited, and one the page leaves out until it is filled in
		control.classList.toggle( 'is-selected', spot.id === this.config.selected );
		control.classList.toggle( 'is-empty', !! spot.empty );
		if ( label ) {
			const tip = element( 'span', 'alvt_tip', label );
			tip.setAttribute( 'aria-hidden', 'true' );
			control.append( tip );
		}
		// a press on a hotspot is not the start of a drag
		[ 'mousedown', 'touchstart', 'pointerdown' ].forEach( ( type ) => control.addEventListener( type, ( event ) => event.stopPropagation() ) );
		control.addEventListener( 'click', ( event ) => this.activate( event, spot, control ) );
		if ( this.config.editor ) {
			this.draggable( control, spot );
		}
		div.append( control );
		this.controls.push( { control, spot } );
	}

	// the editor moves a hotspot by dragging it; the block saves where it was let go (alvt:moved)
	draggable( control, spot ) {
		control.addEventListener( 'pointerdown', ( down ) => {
			const scene = this.viewer.getScene();
			const hotspot = this.pnlm.scenes[ scene ]?.hotSpots.find( ( item ) => item.id === spot.id );
			if ( 0 !== down.button || ! hotspot ) {
				return;
			}
			let moved = false;
			control.setPointerCapture?.( down.pointerId );
			const move = ( event ) => {
				if ( ! moved && Math.hypot( event.clientX - down.clientX, event.clientY - down.clientY ) < 4 ) {
					return;
				}
				moved = true;
				control.classList.add( 'is-dragging' );
				const [ pitch, yaw ] = this.viewer.mouseEventToCoords( event );
				if ( Number.isFinite( pitch ) && Number.isFinite( yaw ) ) {
					Object.assign( hotspot, { pitch, yaw } );
					// draws the hotspot at its new place
					this.viewer.setYaw( this.viewer.getYaw(), false );
				}
			};
			const up = () => {
				control.removeEventListener( 'pointermove', move );
				control.removeEventListener( 'pointerup', up );
				control.removeEventListener( 'pointercancel', up );
				if ( moved ) {
					control.classList.remove( 'is-dragging' );
					// the click that ends a drag (same task) does not pick the hotspot
					this.dragged = true;
					window.setTimeout( () => {
						this.dragged = false;
					} );
					this.emit( 'alvt:moved', { scene, id: spot.id, yaw: round( hotspot.yaw ), pitch: round( hotspot.pitch ) } );
				}
			};
			control.addEventListener( 'pointermove', move );
			control.addEventListener( 'pointerup', up );
			control.addEventListener( 'pointercancel', up );
		} );
	}

	activate( event, spot, control ) {
		// in the editor a hotspot is picked for editing, never followed
		if ( this.config.editor ) {
			event.preventDefault();
			if ( ! this.dragged ) {
				this.emit( 'alvt:hotspot', { scene: this.viewer.getScene(), id: spot.id } );
			}
			return;
		}
		if ( 'scene' === spot.type ) {
			this.viewer.loadScene( spot.target );
		} else if ( 'info' === spot.type ) {
			this.openPopup( spot, control );
		}
	}

	openPopup( spot, opener ) {
		this.closePopup();
		const popup = element( 'div', 'alvt_popup' );
		popup.setAttribute( 'role', 'dialog' );
		popup.setAttribute( 'aria-label', spot.title || this.text.close );
		if ( spot.imageUrl ) {
			const image = element( 'img', 'alvt_popup_image' );
			image.src = spot.imageUrl;
			image.alt = '';
			popup.append( image );
		}
		if ( spot.title ) {
			popup.append( element( 'strong', 'alvt_popup_title', spot.title ) );
		}
		if ( spot.text ) {
			popup.append( element( 'p', 'alvt_popup_text', spot.text ) );
		}
		const close = element( 'button', 'alvt_popup_close' );
		close.type = 'button';
		close.setAttribute( 'aria-label', this.text.close );
		close.textContent = '×';
		close.addEventListener( 'click', () => this.closePopup() );
		// the popup is not part of the panorama: no drag starts in it
		[ 'mousedown', 'touchstart', 'pointerdown', 'wheel' ].forEach( ( type ) => popup.addEventListener( type, ( event ) => event.stopPropagation() ) );
		popup.prepend( close );
		this.box.append( popup );
		this.popup = { popup, opener };
		close.focus();
	}

	closePopup() {
		if ( ! this.popup ) {
			return;
		}
		const { popup, opener } = this.popup;
		const focused = popup.contains( popup.ownerDocument.activeElement );
		popup.remove();
		this.popup = null;
		if ( focused && opener.isConnected ) {
			opener.focus();
		}
	}
}
