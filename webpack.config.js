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
        'list/mhwp-ipso-list-frontend': './mhwp-ipso/blocks/list/mhwp-ipso-list-frontend.ts',
        'button/mhwp-ipso-button': './mhwp-ipso/blocks/button/',
        'button/mhwp-ipso-button-frontend': './mhwp-ipso/blocks/button/mhwp-ipso-button-frontend.ts',
    },

    output: {
        path: path.resolve( __dirname ) + '/mhwp-ipso/blocks/dist',
        filename: '[name].js'
    },

    module: {
        ...defaultConfig.module,
        rules: [
            ...defaultConfig.module.rules,
            {
                test: /\.tsx?/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.json',
                            transpileOnly: false
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', ...(defaultConfig.resolve ? defaultConfig.resolve.extensions || ['.js', '.jsx'] : [])]
    }

};
