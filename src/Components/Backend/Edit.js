import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { BlockIcon, MediaPlaceholder, useBlockProps } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
// copied from the shared softicon-tools folder by `npm run tools` (prebuild), edit it there
import useIframeAssets from '../../vendor/softicon-tools/hooks/useIframeAssets';
import Settings from './Settings/Settings';
import useScenes, { fixIds } from './Scenes/useScenes';
import { blockIcon } from '../../utils/icons';
import { cleanScenes } from '../../utils/scene';

const EMPTY = [];

// The live viewer: view.js runs inside the editor's iframe (Block::editor_viewer()) and opens the same viewer as
// the page. The block tells it when to start, update (after every change) and stop; React never touches its DOM.
// The viewer answers with alvt:view (where it looks, after each move), alvt:click (a point on the panorama),
// alvt:hotspot (a hotspot was clicked) and alvt:moved (a hotspot was dragged).
const EVENTS = [ 'view', 'click', 'hotspot', 'moved' ];
const useViewer = ( ref, key, on ) => {
	const handlers = useRef( on );
	handlers.current = on;

	useEffect( () => {
		const el = ref.current;
		const listeners = EVENTS.map( ( name ) => [ 'alvt:' + name, ( event ) => handlers.current[ name ]?.( event.detail || {} ) ] );
		listeners.forEach( ( [ type, listener ] ) => el?.addEventListener( type, listener ) );
		return () => {
			listeners.forEach( ( [ type, listener ] ) => el?.removeEventListener( type, listener ) );
			el?.dispatchEvent( new window.Event( 'alvt:destroy' ) );
		};
	}, [ ref ] );

	// boot first: the block may have only now become a tour (its first scene)
	useEffect( () => {
		const el = ref.current;
		el?.ownerDocument.dispatchEvent( new window.Event( 'alvt:boot' ) );
		el?.dispatchEvent( new window.Event( 'alvt:update' ) );
	}, [ ref, key ] );
};

const Edit = ( { attributes, setAttributes, clientId } ) => {
	const actions = useScenes( clientId );
	// the scene open in the sidebar, and where the block's viewer looks
	const [ editing, setScene ] = useState( '' );
	const [ spot, setSpot ] = useState( '' );
	const [ view, setView ] = useState( null );
	const setEditing = ( id ) => {
		setScene( id );
		setSpot( '' );
	};
	const open = ( scene, id ) => {
		setScene( scene );
		setSpot( id );
	};
	// a block installed from the inserter's search gets these only in the top window
	const assetsRef = useIframeAssets( [ 'softicon-virtual-tour-style-css', 'softicon-virtual-tour-editor-style-css' ] );
	const ref = useRef();
	// the site's viewer config (the alvt_config filter); the inserter's previews show the picture only
	const { site, isPreview } = useSelect( ( select ) => {
		const settings = select( 'core/block-editor' ).getSettings();
		return { site: settings.alvt || {}, isPreview: settings.isPreviewMode };
	}, [] );

	// scenes need an id each for the list and the hotspots; only hand-made or broken content lacks one
	const raw = Array.isArray( attributes.scenes ) ? attributes.scenes : EMPTY;
	useEffect( () => {
		if ( ! isPreview && fixIds( raw ) !== raw ) {
			setAttributes( { scenes: fixIds( raw ) } );
		}
	}, [ raw, isPreview, setAttributes ] );

	// as render.php prints it; the editor's viewer also shows the hotspots the page leaves out until they are filled in
	const scenes = cleanScenes( raw );
	const first = scenes[ 0 ];
	const config = JSON.stringify( { ...site, scenes: cleanScenes( raw, true ), editor: true, selected: spot } );
	useViewer( ref, config, {
		view: setView,
		// a click on the panorama adds a hotspot there
		click: ( { scene, yaw, pitch } ) => {
			const id = Number.isFinite( yaw ) && Number.isFinite( pitch ) && actions.addHotspot( scene, { yaw, pitch } );
			if ( id ) {
				open( scene, id );
			}
		},
		hotspot: ( { scene, id } ) => open( scene, id ),
		moved: ( { scene, id, yaw, pitch } ) => Number.isFinite( yaw ) && Number.isFinite( pitch ) && actions.updateHotspot( scene, id, { yaw, pitch } ),
	} );
	// where the viewer looks at this moment
	const askView = () => {
		const detail = {};
		ref.current?.dispatchEvent( new window.CustomEvent( 'alvt:ask', { detail } ) );
		return detail.view || null;
	};

	// the scene open in the sidebar is the one the viewer shows
	const edited = editing && scenes.some( ( scene ) => scene.id === editing ) ? editing : '';
	useEffect( () => {
		if ( edited ) {
			ref.current?.dispatchEvent( new window.CustomEvent( 'alvt:show', { detail: { id: edited } } ) );
		}
	}, [ edited, config ] );
	// a hotspot picked in the sidebar: the view turns to it
	const pickSpot = ( id ) => {
		setSpot( id );
		if ( id && edited ) {
			ref.current?.dispatchEvent( new window.CustomEvent( 'alvt:show', { detail: { id: edited, spot: id } } ) );
		}
	};

	const blockProps = useBlockProps( {
		ref: useMergeRefs( [ assetsRef, ref ] ),
		className: first ? 'alvt_tour' : undefined,
		'data-alvt': first && ! isPreview ? config : undefined,
	} );

	// no scenes yet: pick images from the Media Library; the inserter's preview only shows the name
	const empty = isPreview
		? <Placeholder icon={ <BlockIcon icon={ blockIcon } /> } label={ __( 'Virtual Tour', 'softicon-virtual-tour' ) } />
		: <MediaPlaceholder
			icon={ <BlockIcon icon={ blockIcon } /> }
			labels={ {
				title: __( 'Virtual Tour', 'softicon-virtual-tour' ),
				instructions: __( 'Choose or upload your 360° panorama images (2:1, for example 6000 × 3000). Each image becomes a scene of the tour.', 'softicon-virtual-tour' ),
			} }
			accept="image/*"
			allowedTypes={ [ 'image' ] }
			multiple
			onSelect={ actions.addMedia }
		/>;

	return <>
		<Settings { ...{ attributes, setAttributes, scenes, actions, editing: edited, setEditing, spot, setSpot: pickSpot, view, askView } } />

		<div { ...blockProps }>
			{ first
				? <>
					<div className="alvt_stage">
						<img className="alvt_image" src={ first.imageUrl } alt={ first.alt } />
						{ /* Pannellum fills this, React leaves its content alone */ }
						{ ! isPreview && <div className="alvt_viewer" /> }
					</div>
					{ scenes.length > 1 && <ul className="alvt_scenes">
						{ scenes.map( ( scene, index ) => <li key={ scene.id } className="alvt_scene" data-id={ scene.id }>
							{
								// translators: %d: the scene's number in the tour
								scene.title || sprintf( __( 'Scene %d', 'softicon-virtual-tour' ), index + 1 )
							}
						</li> ) }
					</ul> }
				</>
				: empty }
		</div>
	</>;
};

export default Edit;
