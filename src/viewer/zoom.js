// a scene's zoom (0..100, 50 by default) as Pannellum's horizontal field of view in degrees, and back:
// 0 is the widest view (120°), 50 Pannellum's usual 100°, 100 the closest (30°)
export const minHfov = 30;
export const maxHfov = 120;

export const hfovOf = ( zoom ) => ( zoom <= 50 ? maxHfov - ( zoom * 0.4 ) : 100 - ( ( zoom - 50 ) * 1.4 ) );

export const zoomOf = ( hfov ) => Math.round( hfov >= 100 ? ( maxHfov - hfov ) / 0.4 : 50 + ( ( 100 - hfov ) / 1.4 ) );
