import { __ } from '@wordpress/i18n';
import { RangeControl } from '@wordpress/components';
import { FieldHead, Panel, ToggleRow } from '../../../vendor/softicon-tools/components/Panels';

// what visitors get: autorotate, loading on click and Pannellum's buttons
const ViewerPanel = ( { setAttributes, options } ) => <Panel id="viewer" title={ __( 'Viewer', 'softicon-virtual-tour' ) }>
	<ToggleRow
		label={ __( 'Rotate on its own', 'softicon-virtual-tour' ) }
		tip={ __( 'The panorama turns slowly until the visitor drags it, clicks or uses a key. Off for visitors who ask their device for less motion.', 'softicon-virtual-tour' ) }
		checked={ options.autoRotate > 0 }
		onChange={ ( on ) => setAttributes( { autoRotate: on ? 2 : 0 } ) }
	/>
	{ options.autoRotate > 0 && <div>
		<FieldHead label={ __( 'Rotation speed', 'softicon-virtual-tour' ) } tip={ __( 'Degrees per second.', 'softicon-virtual-tour' ) } />
		<RangeControl label={ __( 'Rotation speed', 'softicon-virtual-tour' ) } hideLabelFromVision value={ options.autoRotate } min={ 1 } max={ 10 } onChange={ ( value ) => setAttributes( { autoRotate: Number( value ) || 2 } ) } __nextHasNoMarginBottom __next40pxDefaultSize />
	</div> }
	<ToggleRow
		label={ __( 'Load the tour on click', 'softicon-virtual-tour' ) }
		tip={ __( 'The page shows the first picture with a "View in 360°" button, and the viewer and panoramas load only when it is pressed. Saves data on phones. The block in the editor always shows the viewer.', 'softicon-virtual-tour' ) }
		checked={ options.loadOnClick }
		onChange={ ( loadOnClick ) => setAttributes( { loadOnClick } ) }
	/>
	<ToggleRow label={ __( 'Zoom buttons', 'softicon-virtual-tour' ) } checked={ options.zoomButtons } onChange={ ( zoomButtons ) => setAttributes( { zoomButtons } ) } />
	<ToggleRow
		label={ __( 'Fullscreen button', 'softicon-virtual-tour' ) }
		tip={ __( 'Shown only where the browser allows fullscreen.', 'softicon-virtual-tour' ) }
		checked={ options.fullscreenButton }
		onChange={ ( fullscreenButton ) => setAttributes( { fullscreenButton } ) }
	/>
</Panel>;

export default ViewerPanel;
