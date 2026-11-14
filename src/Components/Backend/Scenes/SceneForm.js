import { __, sprintf } from '@wordpress/i18n';
import { Button, Notice, TextControl, TextareaControl } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import useImage from './useImage';
import HotspotForm from './HotspotForm';
import { sceneName } from './SceneList';
import { icons, spotIcons } from '../../../utils/icons';
import { cleanScene, cleanScenes, isPanorama, maxHotspots } from '../../../utils/scene';

const START = { yaw: 0, pitch: 0, zoom: 50 };

// one scene: its name, image, alt text and where the view starts; the block's viewer shows it meanwhile
const SceneForm = ( props ) => {
	const { scene, index, scenes, actions, view, askView, spot: spotId, setSpot, onClose } = props;
	const spot = spotId && Array.isArray( scene.hotspots ) && scene.hotspots.find( ( item ) => item?.id === spotId );
	if ( spot ) {
		return <HotspotForm key={ spot.id } { ...props } spot={ spot } onClose={ () => setSpot( '' ) } />;
	}
	return <SceneFields { ...{ scene, index, scenes, actions, view, askView, setSpot, onClose } } />;
};

// the hotspots of a scene, as the editor's viewer shows them (unfinished ones are marked)
const Hotspots = ( { scene, scenes, setSpot } ) => {
	const shown = cleanScenes( scenes, true ).find( ( item ) => item.id === scene.id )?.hotspots || [];
	const titleOf = ( spot ) => {
		const target = 'scene' === spot.type && scenes.find( ( item ) => item.id === spot.target );
		// translators: %s: a scene's name
		const goTo = target ? sprintf( __( 'Go to %s', 'softicon-virtual-tour' ), sceneName( target, scenes.indexOf( target ) ) ) : '';
		return spot.title || goTo || spot.url || ( 'info' === spot.type ? __( 'Info', 'softicon-virtual-tour' ) : __( 'Hotspot', 'softicon-virtual-tour' ) );
	};

	// translators: %d: the most hotspots a scene can have
	const full = sprintf( __( 'A scene can have up to %d hotspots.', 'softicon-virtual-tour' ), maxHotspots );

	return <div className="alvtStart">
		<p className="alvtLabel">{ __( 'Hotspots', 'softicon-virtual-tour' ) }</p>
		{ shown.length > 0 && <ul className="alvtRows">
			{ shown.map( ( spot ) => <li key={ spot.id } className="alvtRow">
				<button type="button" className="alvtRowMain" onClick={ () => setSpot( spot.id ) }>
					<span className="alvtSpotIcon" aria-hidden="true">{ spotIcons[ spot.type ] }</span>
					<span className="alvtRowText">
						<span className="alvtRowName">{ titleOf( spot ) }</span>
						{ spot.empty && <span className="alvtRowMeta is-warning">{ __( 'Not shown on the page yet', 'softicon-virtual-tour' ) }</span> }
					</span>
				</button>
			</li> ) }
		</ul> }
		<p className="alvtHelp">{ shown.length < maxHotspots ? __( 'Click the panorama in the block to add a hotspot there. Drag a hotspot to move it.', 'softicon-virtual-tour' ) : full }</p>
	</div>;
};

const SceneFields = ( { scene, index, scenes, actions, view, askView, setSpot, onClose } ) => {
	const shown = cleanScene( scene, index ) || { ...START, hotspots: [] };
	const image = useImage( scene.imageId, 'medium' );
	const set = ( key ) => ( value ) => actions.update( scene.id, { [ key ]: value } );
	// the viewer's view, when it is on this scene
	const here = view?.scene === scene.id ? view : null;
	const atStart = shown.yaw === START.yaw && shown.pitch === START.pitch && shown.zoom === START.zoom;

	return <div className="alvtForm">
		<Button className="alvtBack" icon={ icons.back } onClick={ onClose } variant="tertiary" size="compact">
			{ __( 'All scenes', 'softicon-virtual-tour' ) }
		</Button>

		<TextControl
			label={ __( 'Name', 'softicon-virtual-tour' ) }
			help={ __( 'Shown in the scene list and on the hotspots that lead here.', 'softicon-virtual-tour' ) }
			placeholder={ sceneName( {}, index ) }
			value={ scene.title ?? '' }
			onChange={ set( 'title' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>

		<Hotspots { ...{ scene, scenes, setSpot } } />

		<div className="alvtImage">
			<p className="alvtLabel">{ __( '360° image', 'softicon-virtual-tour' ) }</p>
			{ ( image.thumb || shown.imageUrl ) && <img src={ image.thumb || shown.imageUrl } alt="" /> }
			{ ! shown.imageUrl && <Notice status="error" isDismissible={ false }>{ __( 'This scene has no image, so the page leaves it out.', 'softicon-virtual-tour' ) }</Notice> }
			{ image.width > 0 && ! isPanorama( image ) && <Notice status="warning" isDismissible={ false }>
				{
					// translators: 1: the image's width in pixels, 2: its height
					sprintf( __( 'This image is %1$d × %2$d. A 360° panorama is twice as wide as it is high (2:1), so it may look stretched.', 'softicon-virtual-tour' ), image.width, image.height )
				}
			</Notice> }
			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={ [ 'image' ] }
					value={ scene.imageId }
					onSelect={ ( media ) => actions.replaceImage( scene.id, media ) }
					render={ ( { open } ) => <Button variant="secondary" onClick={ open } __next40pxDefaultSize>
						{ __( 'Replace image', 'softicon-virtual-tour' ) }
					</Button> }
				/>
			</MediaUploadCheck>
		</div>

		<TextareaControl
			label={ __( 'Alternative text', 'softicon-virtual-tour' ) }
			help={ __( 'Describe the place for people who cannot see the image. Search engines read it too, and it is shown when the 360° view cannot load.', 'softicon-virtual-tour' ) }
			value={ scene.alt ?? '' }
			onChange={ set( 'alt' ) }
			rows={ 2 }
			__nextHasNoMarginBottom
		/>

		<div className="alvtStart">
			<p className="alvtLabel">{ __( 'Starting view', 'softicon-virtual-tour' ) }</p>
			<p className="alvtHelp">
				{
					// translators: 1: the direction in degrees, 2: up or down in degrees, 3: the zoom, 0 to 100
					sprintf( __( 'Direction %1$s°, up/down %2$s°, zoom %3$s', 'softicon-virtual-tour' ), Math.round( shown.yaw ), Math.round( shown.pitch ), Math.round( shown.zoom ) )
				}
			</p>
			<div className="alvtActions">
				<Button variant="secondary" icon={ icons.view } disabled={ ! here } onClick={ () => {
					const now = askView() || here;
					if ( now.scene === scene.id ) {
						actions.update( scene.id, { yaw: now.yaw, pitch: now.pitch, zoom: now.zoom } );
					}
				} } __next40pxDefaultSize>
					{ __( 'Use the current view', 'softicon-virtual-tour' ) }
				</Button>
				<Button variant="tertiary" disabled={ atStart } onClick={ () => actions.update( scene.id, START ) } __next40pxDefaultSize>
					{ __( 'Reset', 'softicon-virtual-tour' ) }
				</Button>
			</div>
			<p className="alvtHelp">{ __( 'Turn and zoom the panorama in the block, then press "Use the current view". Visitors start there.', 'softicon-virtual-tour' ) }</p>
		</div>

		{ 0 === index
			? <p className="alvtHelp">{ __( 'The tour starts with this scene.', 'softicon-virtual-tour' ) }</p>
			: <Button className="alvtLeft" variant="secondary" icon={ icons.start } onClick={ () => actions.moveTo( scene.id, 0 ) } __next40pxDefaultSize>
				{ __( 'Start the tour here', 'softicon-virtual-tour' ) }
			</Button> }

		<Button className="alvtLeft" variant="secondary" isDestructive icon={ icons.trash } onClick={ () => {
			actions.remove( scene.id );
			onClose();
		} } __next40pxDefaultSize>
			{ __( 'Delete scene', 'softicon-virtual-tour' ) }
		</Button>
	</div>;
};

export default SceneForm;
