<?php
/**
 * Plugin Name: SoftIcon Virtual Tour – 360° Panorama Viewer Block
 * Description: A 360° panorama and virtual tour block. Add scenes and hotspots right in the block editor. No external services.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Author: softiconai
 * Author URI: https://profiles.wordpress.org/softiconai/
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: softicon-virtual-tour
 * Domain Path: /languages
 *
 * @package SoftIcon_Virtual_Tour
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ALVT_PLUGIN_VERSION', '1.0.0' );
define( 'ALVT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

require_once ALVT_PLUGIN_PATH . 'includes/class-block.php';
new ALVT_Virtual_Tour\Block();

// add-ons hook in here
do_action( 'alvt_loaded' );
