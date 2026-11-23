import { __ } from '@wordpress/i18n';
import { RangeControl } from '@wordpress/components';
import { ColorRow, FieldHead, Panel, Reset, Tiles } from '../../../vendor/softicon-tools/components/Panels';
import { path } from '../../../utils/icons';

const lists = [
	{ value: 'names', label: __( 'Names', 'softicon-virtual-tour' ), icon: path( 'M3 9h8v6H3zm10 0h8v6h-8zM4.5 10.5v3h5v-3zm10 0v3h5v-3z' ) },
	{ value: 'thumbnails', label: __( 'Pictures', 'softicon-virtual-tour' ), icon: path( 'M2 6h9v7H2zm11 0h9v7h-9zM3 15h7v1.5H3zm11 0h7v1.5h-7z' ) },
	{ value: 'none', label: __( 'Hidden', 'softicon-virtual-tour' ), icon: path( 'M12 5c4.5 0 8.3 2.9 10 7a11 11 0 0 1-3 4.2l-1.4-1.4A9 9 0 0 0 19.8 12 9 9 0 0 0 12 7c-.8 0-1.6.1-2.3.3L8.1 5.7C9.3 5.2 10.6 5 12 5M3.4 2 2 3.4l2.8 2.8A11 11 0 0 0 2 12c1.7 4.1 5.5 7 10 7 1.6 0 3.1-.4 4.5-1L20.6 22l1.4-1.4zm3 4.4 2.3 2.3a5 5 0 0 0 6.6 6.6l1 1c-1 .4-2.1.7-3.3.7A9 9 0 0 1 4.2 12a9 9 0 0 1 2.2-5.6m3.8 3.8 3.6 3.6a2.5 2.5 0 0 1-3.6-3.6' ) },
];

// the scene list under the viewer, and the colors and size of what is drawn on the panorama
const StylePanel = ( { setAttributes, options } ) => <Panel id="style" title={ __( 'Style', 'softicon-virtual-tour' ) }>
	<Tiles
		label={ __( 'Scene list', 'softicon-virtual-tour' ) }
		tip={ __( 'Under the panorama, when the tour has two or more scenes. Pictures use each image\'s medium size from the Media Library. Hidden: visitors move between scenes with the hotspots only.', 'softicon-virtual-tour' ) }
		value={ options.sceneList }
		options={ lists }
		onChange={ ( sceneList ) => setAttributes( { sceneList } ) }
	/>
	<div>
		<FieldHead label={ __( 'Hotspot size', 'softicon-virtual-tour' ) } action={ <Reset onClick={ () => setAttributes( { spotSize: 36 } ) } disabled={ 36 === options.spotSize } /> } />
		<RangeControl label={ __( 'Hotspot size', 'softicon-virtual-tour' ) } hideLabelFromVision value={ options.spotSize } min={ 24 } max={ 64 } onChange={ ( value ) => setAttributes( { spotSize: Number( value ) || 36 } ) } __nextHasNoMarginBottom __next40pxDefaultSize />
	</div>
	<div>
		<FieldHead label={ __( 'Colors', 'softicon-virtual-tour' ) } />
		<ColorRow label={ __( 'Hotspots', 'softicon-virtual-tour' ) } value={ options.spotColor } onChange={ ( spotColor ) => setAttributes( { spotColor } ) } />
		<p className="alvtHelp">{ __( 'The text on the current scene and the "View in 360°" button is white, so pick a darker color there.', 'softicon-virtual-tour' ) }</p>
		<ColorRow label={ __( 'Current scene and button', 'softicon-virtual-tour' ) } value={ options.accentColor } onChange={ ( accentColor ) => setAttributes( { accentColor } ) } />
	</div>
</Panel>;

export default StylePanel;
