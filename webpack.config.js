const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );


module.exports = {
    ...defaultConfig,

    entry: {
        'mhwp-ipso-list': './ipso-api/blocks/list/'
    },

    output: {
        path: path.resolve( __dirname ) + '/ipso-api/blocks/dist',
        filename: '[name].js'
    },

    module: {
        ...defaultConfig.module,
    },

};
