<?php
namespace ALVT_Virtual_Tour;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// the same rules are in src/utils/scene.js
class Block {

	const NAME     = 'softicon/virtual-tour';
	const SCENES   = 50;
	const HOTSPOTS = 50;
	const TYPES    = array( 'scene', 'info', 'link' );
	const VIEW     = array( 'autoRotate', 'loadOnClick', 'zoomButtons', 'fullscreenButton', 'sceneList', 'spotColor', 'spotSize', 'accentColor' );

	public function __construct() {
		add_action( 'init', array( $this, 'register' ) );
		add_filter( 'block_editor_settings_all', array( $this, 'editor_settings' ) );
		add_action( 'enqueue_block_assets', array( $this, 'editor_viewer' ) );
	}

	public function register() {
		register_block_type( ALVT_PLUGIN_PATH . 'build' );
	}

	// editor settings
	public function editor_settings( $settings ) {
		$tabs                           = isset( $settings['blockInspectorTabs'] ) && is_array( $settings['blockInspectorTabs'] ) ? $settings['blockInspectorTabs'] : array();
		$tabs[ self::NAME ]             = false;
		$settings['blockInspectorTabs'] = $tabs;
		$settings['alvt']               = self::config( array() );
		return $settings;
	}

	// view.js in the editor iframe
	public function editor_viewer() {
		if ( is_admin() ) {
			wp_enqueue_script( 'softicon-virtual-tour-view-script' );
		}
	}

	public static function text( $data, $key ) {
		return isset( $data[ $key ] ) && is_scalar( $data[ $key ] ) ? trim( (string) $data[ $key ] ) : '';
	}

	// sanitize_text_field() turns a lone < into &lt;
	public static function plain( $value, $max ) {
		return mb_substr( str_replace( '&lt;', '<', $value ), 0, $max );
	}

	public static function line( $data, $key, $max ) {
		return self::plain( sanitize_text_field( self::text( $data, $key ) ), $max );
	}

	public static function id( $data, $key ) {
		return substr( sanitize_key( self::text( $data, $key ) ), 0, 40 );
	}

	public static function num( $data, $key, $min, $max ) {
		$value = isset( $data[ $key ] ) && is_numeric( $data[ $key ] ) && ! is_bool( $data[ $key ] ) ? (float) $data[ $key ] : INF;
		return $value >= $min && $value <= $max ? round( $value, 3 ) : null;
	}

	// an address with a host, or one on this site
	public static function link( $value ) {
		$url = esc_url_raw( $value, array( 'http', 'https' ) );
		return preg_match( '#^([/?\#]|https?://[^/?\#]+)#', $url ) ? $url : '';
	}

	public static function hotspot( $raw, $index ) {
		if ( ! is_array( $raw ) ) {
			return null;
		}
		$type  = self::text( $raw, 'type' );
		$yaw   = self::num( $raw, 'yaw', -180, 180 );
		$pitch = self::num( $raw, 'pitch', -90, 90 );
		if ( ! in_array( $type, self::TYPES, true ) || null === $yaw || null === $pitch ) {
			return null;
		}
		$id = self::id( $raw, 'id' );
		return array(
			'id'       => '' !== $id ? $id : 'h' . $index,
			'type'     => $type,
			'yaw'      => $yaw,
			'pitch'    => $pitch,
			'title'    => self::line( $raw, 'title', 200 ),
			'text'     => self::plain( sanitize_textarea_field( self::text( $raw, 'text' ) ), 500 ),
			'imageId'  => isset( $raw['imageId'] ) ? absint( $raw['imageId'] ) : 0,
			'imageUrl' => self::link( self::text( $raw, 'imageUrl' ) ),
			'target'   => self::id( $raw, 'target' ),
			'url'      => self::link( self::text( $raw, 'url' ) ),
		);
	}

	public static function scene( $raw, $index ) {
		if ( ! is_array( $raw ) ) {
			return null;
		}
		$id    = self::id( $raw, 'id' );
		$zoom  = self::num( $raw, 'zoom', 0, 100 );
		$spots = isset( $raw['hotspots'] ) && is_array( $raw['hotspots'] ) ? array_slice( array_values( $raw['hotspots'] ), 0, self::HOTSPOTS ) : array();
		$scene = array(
			'id'       => '' !== $id ? $id : 's' . $index,
			'title'    => self::line( $raw, 'title', 200 ),
			'imageId'  => isset( $raw['imageId'] ) ? absint( $raw['imageId'] ) : 0,
			'imageUrl' => self::link( self::text( $raw, 'imageUrl' ) ),
			'alt'      => self::line( $raw, 'alt', 300 ),
			'yaw'      => (float) self::num( $raw, 'yaw', -180, 180 ),
			'pitch'    => (float) self::num( $raw, 'pitch', -90, 90 ),
			'zoom'     => null === $zoom ? 50.0 : $zoom,
			'hotspots' => array_values( array_filter( array_map( array( __CLASS__, 'hotspot' ), $spots, array_keys( $spots ) ) ) ),
		);
		return '' === $scene['imageUrl'] ? null : $scene;
	}

	// each id once, hotspots that lead somewhere
	public static function scenes( $attributes ) {
		$list   = isset( $attributes['scenes'] ) && is_array( $attributes['scenes'] ) ? array_slice( array_values( $attributes['scenes'] ), 0, self::SCENES ) : array();
		$scenes = array();
		foreach ( array_filter( array_map( array( __CLASS__, 'scene' ), $list, array_keys( $list ) ) ) as $scene ) {
			if ( ! isset( $scenes[ $scene['id'] ] ) ) {
				$scenes[ $scene['id'] ] = $scene;
			}
		}
		foreach ( $scenes as $id => $scene ) {
			$scenes[ $id ]['hotspots'] = array_values(
				array_filter(
					$scene['hotspots'],
					function ( $spot ) use ( $scenes, $id ) {
						if ( 'scene' === $spot['type'] ) {
							return $spot['target'] !== $id && isset( $scenes[ $spot['target'] ] );
						}
						return 'link' === $spot['type'] ? '' !== $spot['url'] : '' !== $spot['title'] . $spot['text'] . $spot['imageUrl'];
					}
				)
			);
		}
		return array_values( $scenes );
	}

	// same check in scene.js cssHeight()
	public static function height( $attributes ) {
		$style = '';
		foreach ( array( 'height' => '', 'heightMobile' => '-mobile' ) as $key => $name ) {
			$value  = self::text( $attributes, $key );
			$style .= preg_match( '/^[1-9]\d{0,3}(\.\d{1,2})?(px|vh)$/', $value ) ? "--alvt-height$name:$value;" : '';
		}
		return $style;
	}

	// width, smaller copy, thumbnail
	public static function sizes( $scene ) {
		$meta = $scene['imageId'] ? wp_get_attachment_metadata( $scene['imageId'] ) : false;
		$file = wp_basename( (string) wp_parse_url( $scene['imageUrl'], PHP_URL_PATH ) );
		if ( ! is_array( $meta ) || empty( $meta['file'] ) ) {
			return $scene;
		}
		$thumb = image_get_intermediate_size( $scene['imageId'], 'medium' );
		if ( $thumb && '' !== $file && in_array( $file, array( wp_basename( $meta['file'] ), $meta['original_image'] ?? '' ), true ) ) {
			$scene['thumb'] = $thumb['url'];
		}
		if ( empty( $meta['original_image'] ) ) {
			$scene['width'] = wp_basename( $meta['file'] ) === $file && isset( $meta['width'] ) ? absint( $meta['width'] ) : 0;
		} elseif ( $meta['original_image'] === $file ) {
			$path           = (string) wp_get_original_image_path( $scene['imageId'] );
			$size           = $path && file_exists( $path ) ? wp_getimagesize( $path ) : false;
			$scene['width'] = $size ? absint( $size[0] ) : 0;
			$scene['small'] = (string) wp_get_attachment_url( $scene['imageId'] );
		}
		return $scene;
	}

	// VIEW is checked in scene.js cleanView()
	public static function config( $attributes, $scenes = array() ) {
		return apply_filters( 'alvt_config', array( 'scenes' => array_map( array( __CLASS__, 'sizes' ), $scenes ) ) + array_intersect_key( $attributes, array_flip( self::VIEW ) ), $attributes );
	}
}
