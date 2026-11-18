import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- the same control as SoftIcon Model Viewer's height
import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { FieldHead, Panel, Reset } from '../../../vendor/softicon-tools/components/Panels';

const units = [ { value: 'px', label: 'px', default: 480 }, { value: 'vh', label: 'vh', default: 70 } ];

// a number and a unit, or nothing (a unit picked in an empty field is not a height)
const valueOf = ( value ) => ( /\d/.test( value || '' ) ? value : '' );

// the block's height, and a height for phones (empty: the same)
const SizePanel = ( { attributes, setAttributes } ) => {
	const { height, heightMobile } = attributes;
	return <Panel id="size" title={ __( 'Size', 'softicon-virtual-tour' ) }>
		<div>
			<FieldHead label={ __( 'Height', 'softicon-virtual-tour' ) } tip={ __( 'vh is a share of the screen height: 100vh fills the screen.', 'softicon-virtual-tour' ) } action={ <Reset onClick={ () => setAttributes( { height: '480px' } ) } disabled={ '480px' === height } /> } />
			<UnitControl label={ __( 'Height', 'softicon-virtual-tour' ) } hideLabelFromVision value={ height } units={ units } min={ 1 } max={ 9999 } isResetValueOnUnitChange onChange={ ( value ) => setAttributes( { height: valueOf( value ) || '480px' } ) } __next40pxDefaultSize />
		</div>
		<div>
			<FieldHead label={ __( 'Height on phones', 'softicon-virtual-tour' ) } tip={ __( 'For screens up to 600px wide. Empty: the same as above.', 'softicon-virtual-tour' ) } action={ <Reset onClick={ () => setAttributes( { heightMobile: '' } ) } disabled={ ! heightMobile } /> } />
			<UnitControl label={ __( 'Height on phones', 'softicon-virtual-tour' ) } hideLabelFromVision value={ heightMobile } units={ units } min={ 1 } max={ 9999 } isResetValueOnUnitChange onChange={ ( value ) => setAttributes( { heightMobile: valueOf( value ) } ) } __next40pxDefaultSize />
		</div>
	</Panel>;
};

export default SizePanel;
