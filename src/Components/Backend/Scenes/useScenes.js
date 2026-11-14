import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useDispatch, useRegistry } from '@wordpress/data';
import { isPanorama, maxHotspots, maxScenes, newId, sceneFromMedia } from '../../../utils/scene';

// valid ids are what sanitize_key() keeps, and each one once: scenes in the block, hotspots in their scene
const uniqueIds = ( list, prefix ) => {
	const seen = new Set();
	let changed = false;
	const fixed = list.map( ( item ) => {
		if ( ! item || 'object' !== typeof item ) {
			return item;
		}
		let id = 'string' === typeof item.id ? item.id : '';
		if ( ! /^[a-z0-9_-]{1,40}$/.test( id ) || seen.has( id ) ) {
			do {
				id = newId( prefix );
			} while ( seen.has( id ) );
			changed = true;
		}
		seen.add( id );
		return id === item.id ? item : { ...item, id };
	} );
	return changed ? fixed : list;
};

export const fixIds = ( scenes ) => {
	const fixed = uniqueIds( scenes, 's' ).map( ( scene ) => {
		if ( ! scene || 'object' !== typeof scene || ! Array.isArray( scene.hotspots ) ) {
			return scene;
		}
		const hotspots = uniqueIds( scene.hotspots, 'h' );
		return hotspots === scene.hotspots ? scene : { ...scene, hotspots };
	} );
	return fixed.some( ( scene, index ) => scene !== scenes[ index ] ) ? fixed : scenes;
};

// changes to the block's scenes, always made on the newest list (an upload sends its images one by one)
const useScenes = ( clientId ) => {
	const registry = useRegistry();
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	const { createWarningNotice } = useDispatch( 'core/notices' );

	return useMemo( () => {
		const get = () => {
			const scenes = registry.select( 'core/block-editor' ).getBlockAttributes( clientId )?.scenes;
			return Array.isArray( scenes ) ? scenes : [];
		};
		const set = ( scenes ) => updateBlockAttributes( clientId, { scenes: scenes.slice( 0, maxScenes ) } );
		const warn = ( message ) => createWarningNotice( message, { type: 'snackbar' } );

		return {
			get,
			set,
			// images from the Media Library or an upload; an image still uploading has no id yet and comes again
			addMedia: ( media ) => {
				const scenes = get();
				const known = new Set( scenes.map( ( scene ) => scene?.imageId ).filter( Boolean ) );
				const fresh = ( Array.isArray( media ) ? media : [ media ] ).filter( ( item ) => item?.id && item.url && ! known.has( item.id ) );
				const room = Math.max( 0, maxScenes - scenes.length );
				if ( fresh.length > room ) {
					// translators: %d: the most scenes a tour can have
					warn( sprintf( __( 'A tour can have up to %d scenes.', 'softicon-virtual-tour' ), maxScenes ) );
				}
				const added = fresh.slice( 0, room );
				added.filter( ( item ) => ! isPanorama( item ) ).forEach( ( item ) => warn(
					// translators: %s: the image's title or file name
					sprintf( __( '“%s” is not a 360° panorama: its width should be twice its height (2:1). It may look stretched.', 'softicon-virtual-tour' ), sceneFromMedia( item ).title || item.url.split( '/' ).pop() )
				) );
				if ( added.length ) {
					set( [ ...scenes, ...added.map( sceneFromMedia ) ] );
				}
			},
			update: ( id, patch ) => set( get().map( ( scene ) => ( scene?.id === id ? { ...scene, ...patch } : scene ) ) ),
			// a new image for a scene: its title, alt text, start view and hotspots stay
			replaceImage: ( id, media ) => {
				if ( ! isPanorama( media ) ) {
					// translators: %s: the image's title or file name
					warn( sprintf( __( '“%s” is not a 360° panorama: its width should be twice its height (2:1). It may look stretched.', 'softicon-virtual-tour' ), sceneFromMedia( media ).title || media.url.split( '/' ).pop() ) );
				}
				const { imageId, imageUrl } = sceneFromMedia( media );
				set( get().map( ( scene ) => ( scene?.id === id ? { ...scene, imageId, imageUrl } : scene ) ) );
			},
			// hotspots that led to the scene go with it
			remove: ( id ) => set( get().filter( ( scene ) => scene?.id !== id ).map( ( scene ) => (
				Array.isArray( scene?.hotspots ) && scene.hotspots.some( ( spot ) => 'scene' === spot?.type && spot.target === id )
					? { ...scene, hotspots: scene.hotspots.filter( ( spot ) => ! ( 'scene' === spot?.type && spot.target === id ) ) }
					: scene
			) ) ),
			// a new hotspot where the panorama was clicked: to the next scene when there is one, else an info
			addHotspot: ( sceneId, { yaw, pitch } ) => {
				const scenes = get();
				const scene = scenes.find( ( item ) => item?.id === sceneId );
				const spots = Array.isArray( scene?.hotspots ) ? scene.hotspots : [];
				if ( ! scene ) {
					return '';
				}
				if ( spots.length >= maxHotspots ) {
					// translators: %d: the most hotspots a scene can have
					warn( sprintf( __( 'A scene can have up to %d hotspots.', 'softicon-virtual-tour' ), maxHotspots ) );
					return '';
				}
				const others = scenes.filter( ( item ) => item?.id && item.id !== sceneId );
				const next = others.find( ( item ) => scenes.indexOf( item ) > scenes.indexOf( scene ) ) || others[ 0 ];
				const spot = { id: newId( 'h' ), type: next ? 'scene' : 'info', yaw, pitch, title: '', text: '', imageId: 0, imageUrl: '', target: next ? next.id : '', url: '' };
				set( scenes.map( ( item ) => ( item === scene ? { ...item, hotspots: [ ...spots, spot ] } : item ) ) );
				return spot.id;
			},
			updateHotspot: ( sceneId, id, patch ) => set( get().map( ( scene ) => ( scene?.id === sceneId && Array.isArray( scene.hotspots )
				? { ...scene, hotspots: scene.hotspots.map( ( spot ) => ( spot?.id === id ? { ...spot, ...patch } : spot ) ) }
				: scene ) ) ),
			removeHotspot: ( sceneId, id ) => set( get().map( ( scene ) => ( scene?.id === sceneId && Array.isArray( scene.hotspots )
				? { ...scene, hotspots: scene.hotspots.filter( ( spot ) => spot?.id !== id ) }
				: scene ) ) ),
			// to a place in the list; the first scene is where the tour starts
			moveTo: ( id, to ) => {
				const list = [ ...get() ];
				const from = list.findIndex( ( scene ) => scene?.id === id );
				if ( from < 0 || to < 0 || to >= list.length || from === to ) {
					return;
				}
				list.splice( to, 0, ...list.splice( from, 1 ) );
				set( list );
			},
		};
	}, [ registry, clientId, updateBlockAttributes, createWarningNotice ] );
};

export default useScenes;
