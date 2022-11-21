const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

// 'list/mhwp-ipso-list-frontend': './mhwp-ipso/blocks/list/mhwp-ipso-list-frontend.js',
// 'button/mhwp-ipso-button-frontend': './mhwp-ipso/blocks/button/mhwp-ipso-button-frontend.js',
// 'list/mhwp-ipso-list': './mhwp-ipso/blocks/list/',
// 'button/mhwp-ipso-button': './mhwp-ipso/blocks/button/',


module.exports = {
    ...defaultConfig,

    entry: {
        'list/mhwp-ipso-list': './mhwp-ipso/blocks/list/',
        'list/mhwp-ipso-list-frontend': './mhwp-ipso/blocks/list/mhwp-ipso-list-frontend.js',
        'button/mhwp-ipso-button': './mhwp-ipso/blocks/button/',
        'button/mhwp-ipso-button-frontend': './mhwp-ipso/blocks/button/mhwp-ipso-button-frontend.js'
    },

    output: {
        path: path.resolve( __dirname ) + '/mhwp-ipso/blocks/dist',
        filename: '[name].js'
    },

    module: {
        ...defaultConfig.module,
    },

};
