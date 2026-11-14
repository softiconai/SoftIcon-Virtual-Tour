import { __ } from '@wordpress/i18n';
import { icons as shared } from '../vendor/softicon-tools/components/icons';

// the cards in the Help panel
export const helpCards = [
	{ href: 'https://wordpress.org/support/plugin/softicon-virtual-tour/', label: __( 'Get support', 'softicon-virtual-tour' ), icon: shared.support },
	{ href: 'https://wordpress.org/support/plugin/softicon-virtual-tour/reviews/#new-post', label: __( 'Rate Virtual Tour', 'softicon-virtual-tour' ), icon: shared.star },
	{ href: 'https://wordpress.org/plugins/author/softiconai/', label: __( 'More plugins', 'softicon-virtual-tour' ), icon: shared.plugins },
];
