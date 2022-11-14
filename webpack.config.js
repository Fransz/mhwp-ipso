const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );


module.exports = {
    ...defaultConfig,

    entry: {
        'mhwp-ipso-list': './mhwp-ipso/blocks/list/',
        'mhwp-ipso-list-frontend': './mhwp-ipso/blocks/list/mhwp-ipso-list-frontend.js',
    },

    output: {
        path: path.resolve( __dirname ) + '/mhwp-ipso/blocks/dist',
        filename: '[name].js'
    },

    module: {
        ...defaultConfig.module,
    },

};
