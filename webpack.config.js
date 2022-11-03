const path              =   require( 'path' );
const webpack           =   require( 'webpack' );
const MiniCssExtractPlugin  =   require( 'mini-css-extract-plugin' );

// Extract CSS for Gutenberg Editor
const editor_css_plugin =   new MiniCssExtractPlugin({
    filename:               'mhwp-ipso-list.css'
});

module.exports          =   {
    entry: './mhwp-ipso/blocks/app/index.js',
    output: {
        path:               path.resolve( __dirname, 'mhwp-ipso/blocks/dist' ),
        filename:           'bundle.js',
    },
    mode:                   'development',
    devtool:                'eval-cheap-source-map',
    module: {
        rules: [
            {
                test:       /\.js$/,
                exclude:    /(node_modules)/,
                use:        'babel-loader',
            },
            {
                test:           /\.(sa|sc|c)ss$/,
                use:            [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        editor_css_plugin
    ]
};
