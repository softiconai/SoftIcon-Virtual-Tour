import { __, _n, sprintf } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { HelpCards, Panel, PanelGroup } from '../../../vendor/softicon-tools/components/Panels';
import { helpCards } from '../../../utils/options';
import { icons } from '../../../utils/icons';
import { maxScenes } from '../../../utils/scene';

// the help cards, last in the sidebar
const Help = () => <Panel id="help" title={ __( 'Help', 'softicon-virtual-tour' ) }>
	<HelpCards cards={ helpCards } />
	<p className="alvtHelp">{ __( 'Email:', 'softicon-virtual-tour' ) } <a href="mailto:softiconai@gmail.com">softiconai@gmail.com</a></p>
</Panel>;

const ScenesPanel = ( { scenes, actions } ) => <Panel id="scenes" title={ __( 'Scenes', 'softicon-virtual-tour' ) }>
	{ scenes.length > 0 && <>
		<p className="alvtHelp">
			{
				// translators: %d: number of scenes
				sprintf( _n( '%d scene.', '%d scenes.', scenes.length, 'softicon-virtual-tour' ), scenes.length )
			}
		</p>
		<ol className="alvtScenes">
			{ scenes.map( ( scene, index ) => <li key={ scene.id } className="alvtSceneRow">
				{
					// translators: %d: the scene's number in the tour
					scene.title || sprintf( __( 'Scene %d', 'softicon-virtual-tour' ), index + 1 )
				}
			</li> ) }
		</ol>
	</> }
	<MediaUploadCheck>
		<MediaUpload
			allowedTypes={ [ 'image' ] }
			multiple
			onSelect={ actions.addMedia }
			render={ ( { open } ) => <Button variant="secondary" icon={ icons.add } onClick={ open } disabled={ scenes.length >= maxScenes }>
				{ __( 'Add scenes', 'softicon-virtual-tour' ) }
			</Button> }
		/>
	</MediaUploadCheck>
</Panel>;

const Settings = ( props ) => {
	const { attributes, setAttributes, scenes } = props;
	return <InspectorControls>
		<div className="siSettings">
			<PanelGroup initial="scenes">
				<ScenesPanel { ...props } />

				{ /* Add-ons append their own panels. */ }
				{ applyFilters( 'alvt.block.inspector', null, { tab: 'general', attributes, setAttributes, scenes } ) }
				<Help />
			</PanelGroup>
		</div>
	</InspectorControls>;
};

export default Settings;
