import { useSelect } from '@wordpress/data';

// a scene's image from the Media Library: a small copy for the sidebar, and its size for the 2:1 check
const useImage = ( imageId, size = 'thumbnail' ) => useSelect( ( select ) => {
	const media = imageId ? select( 'core' ).getEntityRecord( 'postType', 'attachment', imageId, { context: 'view' } ) : null;
	if ( ! media ) {
		return {};
	}
	const details = media.media_details || {};
	return {
		thumb: details.sizes?.[ size ]?.source_url || details.sizes?.thumbnail?.source_url || '',
		width: details.width || 0,
		height: details.height || 0,
	};
}, [ imageId, size ] );

export default useImage;
