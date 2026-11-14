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
	up: path( 'M12 7.5 5.5 14l1.4 1.4 5.1-5.1 5.1 5.1 1.4-1.4z' ),
	down: path( 'M12 16.5 5.5 10l1.4-1.4 5.1 5.1 5.1-5.1 1.4 1.4z' ),
	trash: path( 'M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zm3 2 .5 8h1.5l-.5-8zm4.5 0-.5 8h1.5l.5-8z' ),
	back: path( 'M10.6 6 4.6 12l6 6 1.4-1.4L8.4 13H20v-2H8.4L12 7.4z' ),
	drag: path( 'M8 6h2v2H8zm6 0h2v2h-2zm-6 5h2v2H8zm6 0h2v2h-2zm-6 5h2v2H8zm6 0h2v2h-2z' ),
	view: path( 'M12 5c4.5 0 8.3 2.9 10 7-1.7 4.1-5.5 7-10 7S3.7 16.1 2 12c1.7-4.1 5.5-7 10-7m0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5' ),
	start: path( 'M7 4h2v16H7zm4 1 9 7-9 7z' ),
};

// the hotspot types, as the viewer draws them (src/viewer/Tour.js)
export const spotIcons = {
	scene: path( 'M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8z' ),
	info: path( 'M12 2.75a9.25 9.25 0 1 1 0 18.5 9.25 9.25 0 0 1 0-18.5m0 1.5a7.75 7.75 0 1 0 0 15.5 7.75 7.75 0 0 0 0-15.5M11.2 10.6h1.6V17h-1.6zm0-3.4h1.6v1.7h-1.6z' ),
	link: path( 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0M7 11l-1.5 1.5a3.5 3.5 0 0 0 5 5L12 16l1.4 1.4-1.5 1.5a5.5 5.5 0 0 1-7.8-7.8l1.5-1.5zm10 2 1.5-1.5a3.5 3.5 0 0 0-5-5L12 8l-1.4-1.4 1.5-1.5a5.5 5.5 0 0 1 7.8 7.8L18.4 14.4z' ),
	center: path( 'M11 2h2v4h-2zm0 16h2v4h-2zM2 11h4v2H2zm16 0h4v2h-4zm-6-3a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4' ),
};
