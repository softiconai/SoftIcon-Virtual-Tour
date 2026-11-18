<?php
use ALVT_Virtual_Tour\Block;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$alvt_scenes = Block::scenes( $attributes );
if ( ! $alvt_scenes ) {
	return;
}

$alvt_first   = $alvt_scenes[0];
$alvt_wrapper = get_block_wrapper_attributes(
	array(
		'class'     => 'alvt_tour',
		'style'     => Block::height( $attributes ),
		'data-alvt' => wp_json_encode( Block::config( $attributes, $alvt_scenes ), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ),
	)
);
$alvt_image   = array(
	'class'    => 'alvt_image',
	'alt'      => $alvt_first['alt'],
	'loading'  => 'lazy',
	'decoding' => 'async',
);
// first scene for no-JS visitors and search engines
$alvt_img = $alvt_first['imageId'] ? wp_get_attachment_image( $alvt_first['imageId'], 'full', false, $alvt_image ) : '';
?>
<div <?php echo $alvt_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="alvt_stage">
		<?php if ( $alvt_img ) : ?>
			<?php echo $alvt_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php else : ?>
			<img class="alvt_image" src="<?php echo esc_url( $alvt_first['imageUrl'] ); ?>" alt="<?php echo esc_attr( $alvt_first['alt'] ); ?>" loading="lazy" decoding="async">
		<?php endif; ?>
		<div class="alvt_viewer"></div>
	</div>
	<?php if ( count( $alvt_scenes ) > 1 ) : ?>
		<ul class="alvt_scenes">
			<?php foreach ( $alvt_scenes as $alvt_index => $alvt_scene ) : ?>
				<?php // translators: %d: the scene's number in the tour ?>
				<li class="alvt_scene" data-id="<?php echo esc_attr( $alvt_scene['id'] ); ?>"><?php echo esc_html( '' !== $alvt_scene['title'] ? $alvt_scene['title'] : sprintf( __( 'Scene %d', 'softicon-virtual-tour' ), $alvt_index + 1 ) ); ?></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
</div>
