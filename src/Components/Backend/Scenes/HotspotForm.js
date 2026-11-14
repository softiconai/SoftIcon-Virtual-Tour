import { __, sprintf } from '@wordpress/i18n';
import { Button, Notice, SelectControl, TextControl, TextareaControl } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Tiles } from '../../../vendor/softicon-tools/components/Panels';
import { sceneName } from './SceneList';
import { icons, spotIcons } from '../../../utils/icons';
import { cleanHotspot, link } from '../../../utils/scene';

// a picture for an info hotspot: a size that fits the popup, not the original
const pictureOf = ( media ) => media.sizes?.large?.url || media.media_details?.sizes?.large?.source_url || media.url || '';

// one hotspot: what it does, its text, and where it is (dragged in the panorama, or set to the view's center)
const HotspotForm = ( { scene, scenes, spot, actions, askView, onClose } ) => {
	const set = ( patch ) => actions.updateHotspot( scene.id, spot.id, patch );
	const field = ( key ) => ( value ) => set( { [ key ]: value } );
	const shown = cleanHotspot( spot, 0 );
	const others = scenes.filter( ( item ) => item.id && item.id !== scene.id );
	const type = shown?.type || 'info';

	// what the page would leave out, and why
	let missing = '';
	if ( 'scene' === type && ! others.some( ( item ) => item.id === shown?.target ) ) {
		missing = __( 'Choose the scene this hotspot leads to.', 'softicon-virtual-tour' );
	} else if ( 'link' === type && ! shown?.url ) {
		missing = __( 'Add the address the hotspot opens.', 'softicon-virtual-tour' );
	} else if ( 'info' === type && ! ( shown?.title || shown?.text || shown?.imageUrl ) ) {
		missing = __( 'Add a title, text or image.', 'softicon-virtual-tour' );
	}

	// where a "Go to scene" hotspot leads
	let target = <p className="alvtHelp">{ __( 'Add another scene first: this hotspot takes visitors there.', 'softicon-virtual-tour' ) }</p>;
	if ( others.length ) {
		target = <SelectControl
			label={ __( 'Leads to', 'softicon-virtual-tour' ) }
			value={ shown?.target || '' }
			options={ [
				{ value: '', label: __( 'Choose a scene', 'softicon-virtual-tour' ), disabled: true },
				...others.map( ( item ) => ( { value: item.id, label: sceneName( item, scenes.indexOf( item ) ) } ) ),
			] }
			onChange={ field( 'target' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>;
	}

	return <div className="alvtForm">
		<Button className="alvtBack" icon={ icons.back } onClick={ onClose } variant="tertiary" size="compact">
			{
				// translators: %s: the scene's name
				sprintf( __( 'Back to %s', 'softicon-virtual-tour' ), sceneName( scene, scenes.indexOf( scene ) ) )
			}
		</Button>

		<Tiles
			label={ __( 'Hotspot', 'softicon-virtual-tour' ) }
			value={ type }
			onChange={ ( value ) => set( { type: value, target: 'scene' === value && ! spot.target ? others[ 0 ]?.id || '' : spot.target } ) }
			options={ [
				{ value: 'scene', label: __( 'Go to scene', 'softicon-virtual-tour' ), icon: spotIcons.scene },
				{ value: 'info', label: __( 'Info', 'softicon-virtual-tour' ), icon: spotIcons.info },
				{ value: 'link', label: __( 'Link', 'softicon-virtual-tour' ), icon: spotIcons.link },
			] }
		/>

		{ missing && <Notice status="warning" isDismissible={ false }>
			{ __( 'Not shown on the page yet.', 'softicon-virtual-tour' ) } { missing }
		</Notice> }

		{ 'scene' === type && target }

		<TextControl
			label={ __( 'Title', 'softicon-virtual-tour' ) }
			help={ 'scene' === type ? __( 'Shown when the hotspot is pointed at. Empty: "Go to" and the scene\'s name.', 'softicon-virtual-tour' ) : __( 'Shown when the hotspot is pointed at.', 'softicon-virtual-tour' ) }
			value={ spot.title ?? '' }
			onChange={ field( 'title' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>

		{ 'info' === type && <>
			<TextareaControl
				label={ __( 'Text', 'softicon-virtual-tour' ) }
				help={ __( 'Opens in a small box. Plain text, up to 500 characters.', 'softicon-virtual-tour' ) }
				value={ spot.text ?? '' }
				onChange={ field( 'text' ) }
				rows={ 4 }
				__nextHasNoMarginBottom
			/>
			<div className="alvtImage">
				<p className="alvtLabel">{ __( 'Image', 'softicon-virtual-tour' ) }</p>
				{ shown?.imageUrl && <img src={ shown.imageUrl } alt="" /> }
				<div className="alvtActions">
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ spot.imageId }
							onSelect={ ( media ) => set( { imageId: media.id || 0, imageUrl: pictureOf( media ) } ) }
							render={ ( { open } ) => <Button variant="secondary" onClick={ open } __next40pxDefaultSize>
								{ shown?.imageUrl ? __( 'Replace image', 'softicon-virtual-tour' ) : __( 'Choose image', 'softicon-virtual-tour' ) }
							</Button> }
						/>
					</MediaUploadCheck>
					{ shown?.imageUrl && <Button variant="tertiary" isDestructive onClick={ () => set( { imageId: 0, imageUrl: '' } ) } __next40pxDefaultSize>
						{ __( 'Remove image', 'softicon-virtual-tour' ) }
					</Button> }
				</div>
			</div>
		</> }

		{ 'link' === type && <TextControl
			label={ __( 'Address', 'softicon-virtual-tour' ) }
			type="url"
			placeholder="https://"
			help={ spot.url && ! link( spot.url ) ? __( 'This is not a web address (http or https).', 'softicon-virtual-tour' ) : __( 'Opens in the same tab.', 'softicon-virtual-tour' ) }
			value={ spot.url ?? '' }
			onChange={ field( 'url' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/> }

		<div className="alvtStart">
			<p className="alvtLabel">{ __( 'Place', 'softicon-virtual-tour' ) }</p>
			{ shown && <p className="alvtHelp">
				{
					// translators: 1: the direction in degrees, 2: up or down in degrees
					sprintf( __( 'Direction %1$s°, up/down %2$s°', 'softicon-virtual-tour' ), Math.round( shown.yaw ), Math.round( shown.pitch ) )
				}
			</p> }
			<Button variant="secondary" icon={ spotIcons.center } onClick={ () => {
				const now = askView();
				if ( now?.scene === scene.id ) {
					set( { yaw: now.yaw, pitch: now.pitch } );
				}
			} } __next40pxDefaultSize>
				{ __( 'Move to the center of the view', 'softicon-virtual-tour' ) }
			</Button>
			<p className="alvtHelp">{ __( 'Or drag the hotspot in the panorama.', 'softicon-virtual-tour' ) }</p>
		</div>

		<Button className="alvtLeft" variant="secondary" isDestructive icon={ icons.trash } onClick={ () => {
			actions.removeHotspot( scene.id, spot.id );
			onClose();
		} } __next40pxDefaultSize>
			{ __( 'Delete hotspot', 'softicon-virtual-tour' ) }
		</Button>
	</div>;
};

export default HotspotForm;
