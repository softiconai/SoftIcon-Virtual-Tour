import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useDispatch, useRegistry } from '@wordpress/data';
import { isPanorama, maxScenes, newId, sceneFromMedia } from '../../../utils/scene';

// valid ids are what sanitize_key() keeps, and each one once
export const fixIds = ( scenes ) => {
	const seen = new Set();
	let changed = false;
	const fixed = scenes.map( ( scene ) => {
		if ( ! scene || 'object' !== typeof scene ) {
			return scene;
		}
		let id = 'string' === typeof scene.id ? scene.id : '';
		if ( ! /^[a-z0-9_-]{1,40}$/.test( id ) || seen.has( id ) ) {
			do {
				id = newId( 's' );
			} while ( seen.has( id ) );
			changed = true;
		}
		seen.add( id );
		return id === scene.id ? scene : { ...scene, id };
	} );
	return changed ? fixed : scenes;
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
		};
	}, [ registry, clientId, updateBlockAttributes, createWarningNotice ] );
};

export default useScenes;
