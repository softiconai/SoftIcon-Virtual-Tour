import { SVG, Path } from '@wordpress/primitives';

// a sphere with a ring and an arrow around it
export const blockIcon = <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	<Path fillRule="evenodd" d="M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16m0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 1 1 0-13" />
	<Path fillRule="evenodd" d="M1.5 12a10.5 3.5 0 1 0 21 0 10.5 3.5 0 1 0-21 0M3 12a9 2.2 0 1 1 18 0 9 2.2 0 1 1-18 0" />
	<Path d="M11 13.3 15 15.5 11 17.7z" />
</SVG>;

// small icons for the scene list
export const path = ( d ) => <SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><Path d={ d } /></SVG>;

export const icons = {
	add: path( 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z' ),
	upload: path( 'M12 3.5 7 8.5l1.4 1.4L11 7.3V16h2V7.3l2.6 2.6L17 8.5zM5 18h14v2H5z' ),
};
