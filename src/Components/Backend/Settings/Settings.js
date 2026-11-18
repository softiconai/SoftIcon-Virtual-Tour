import { __, _n, sprintf } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { applyFilters } from '@wordpress/hooks';
import { HelpCards, Panel, PanelGroup } from '../../../vendor/softicon-tools/components/Panels';
import { helpCards } from '../../../utils/options';
import SceneList from '../Scenes/SceneList';
import SizePanel from './Size';

// the help cards, last in the sidebar
const Help = () => <Panel id="help" title={ __( 'Help', 'softicon-virtual-tour' ) }>
	<HelpCards cards={ helpCards } />
	<p className="alvtHelp">{ __( 'Email:', 'softicon-virtual-tour' ) } <a href="mailto:softiconai@gmail.com">softiconai@gmail.com</a></p>
</Panel>;

const ScenesPanel = ( props ) => <Panel id="scenes" title={ __( 'Scenes', 'softicon-virtual-tour' ) }>
	{ props.scenes.length > 0 && <p className="alvtHelp">
		{
			// translators: %d: number of scenes
			sprintf( _n( '%d scene.', '%d scenes.', props.scenes.length, 'softicon-virtual-tour' ), props.scenes.length )
		}
	</p> }
	<SceneList { ...props } />
</Panel>;

const Settings = ( props ) => {
	const { attributes, setAttributes, scenes } = props;
	return <InspectorControls>
		<div className="siSettings">
			<PanelGroup initial="scenes">
				<ScenesPanel { ...props } />
				<SizePanel { ...{ attributes, setAttributes } } />

				{ /* Add-ons append their own panels. */ }
				{ applyFilters( 'alvt.block.inspector', null, { tab: 'general', attributes, setAttributes, scenes } ) }
				<Help />
			</PanelGroup>
		</div>
	</InspectorControls>;
};

export default Settings;
