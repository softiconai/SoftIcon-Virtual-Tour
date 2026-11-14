import { __, _n, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import SceneForm from './SceneForm';
import useImage from './useImage';
import { icons } from '../../../utils/icons';
import { maxScenes } from '../../../utils/scene';

const Thumb = ( { scene } ) => {
	const { thumb } = useImage( scene.imageId );
	return thumb
		? <img className="alvtThumb" src={ thumb } alt="" />
		: <span className="alvtThumb" aria-hidden="true" />;
};

export const sceneName = ( scene, index ) => ( 'string' === typeof scene.title && scene.title.trim() ) ||
	// translators: %d: the scene's number in the tour
	sprintf( __( 'Scene %d', 'softicon-virtual-tour' ), index + 1 );

// the block's scenes: open one to edit it (the block shows it too), drag or move them; the first one starts the tour
const SceneList = ( props ) => {
	const { attributes, actions, editing, setEditing } = props;
	const [ dragged, setDragged ] = useState( null );
	const [ over, setOver ] = useState( null );
	const raw = ( Array.isArray( attributes.scenes ) ? attributes.scenes : [] ).filter( ( scene ) => scene && 'object' === typeof scene );
	const scene = editing && raw.find( ( item ) => item.id === editing );

	if ( scene ) {
		return <SceneForm key={ scene.id } { ...props } scene={ scene } index={ raw.indexOf( scene ) } scenes={ raw } onClose={ () => setEditing( '' ) } />;
	}

	const full = raw.length >= maxScenes;
	const drop = ( index ) => {
		if ( null !== dragged ) {
			actions.moveTo( dragged, index );
		}
		setDragged( null );
		setOver( null );
	};

	return <div className="alvtScenesPanel">
		<MediaUploadCheck>
			<MediaUpload
				allowedTypes={ [ 'image' ] }
				multiple
				onSelect={ actions.addMedia }
				render={ ( { open } ) => <Button variant="primary" icon={ icons.add } onClick={ open } disabled={ full } __next40pxDefaultSize>
					{ __( 'Add scenes', 'softicon-virtual-tour' ) }
				</Button> }
			/>
		</MediaUploadCheck>

		{ full && <p className="alvtHelp">
			{
				// translators: %d: the most scenes a tour can have
				sprintf( __( 'A tour can have up to %d scenes.', 'softicon-virtual-tour' ), maxScenes )
			}
		</p> }

		{ raw.length > 0 && <>
			<ul className="alvtRows">
				{ raw.map( ( item, index ) => {
					const spots = Array.isArray( item.hotspots ) ? item.hotspots.length : 0;
					return <li
						key={ item.id || index }
						className={ 'alvtRow' + ( item.id === dragged ? ' is-dragged' : '' ) + ( index === over && item.id !== dragged ? ' is-over' : '' ) }
						draggable
						onDragStart={ ( event ) => {
							event.dataTransfer.effectAllowed = 'move';
							event.dataTransfer.setData( 'text/plain', item.id );
							setDragged( item.id );
						} }
						onDragOver={ ( event ) => {
							if ( null !== dragged ) {
								event.preventDefault();
								setOver( index );
							}
						} }
						onDrop={ ( event ) => {
							event.preventDefault();
							drop( index );
						} }
						onDragEnd={ () => {
							setDragged( null );
							setOver( null );
						} }
					>
						<span className="alvtGrip" aria-hidden="true">{ icons.drag }</span>
						<button type="button" className="alvtRowMain" onClick={ () => setEditing( item.id ) }>
							<Thumb scene={ item } />
							<span className="alvtRowText">
								<span className="alvtRowName">{ sceneName( item, index ) }</span>
								<span className="alvtRowMeta">
									{ 0 === index && <span className="alvtBadge">{ __( 'Start', 'softicon-virtual-tour' ) }</span> }
									{
										// translators: %d: number of hotspots in the scene
										sprintf( _n( '%d hotspot', '%d hotspots', spots, 'softicon-virtual-tour' ), spots )
									}
								</span>
							</span>
						</button>
						<Button icon={ icons.up } label={ __( 'Move up', 'softicon-virtual-tour' ) } size="small" disabled={ 0 === index } onClick={ () => actions.moveTo( item.id, index - 1 ) } />
						<Button icon={ icons.down } label={ __( 'Move down', 'softicon-virtual-tour' ) } size="small" disabled={ index === raw.length - 1 } onClick={ () => actions.moveTo( item.id, index + 1 ) } />
					</li>;
				} ) }
			</ul>
			<p className="alvtHelp">{ __( 'Drag the scenes, or use the arrows, to change their order. The tour starts with the first one.', 'softicon-virtual-tour' ) }</p>
		</> }
	</div>;
};

export default SceneList;
