/* eslint-env node */
module.exports = {
    plugins: [
        require('autoprefixer'),
        ...(process.env.NODE_ENV === 'production'
            ? [
                require('@fullhuman/postcss-purgecss').purgeCSSPlugin({
                    content: ['./index.html', './js/**/*.js'],
                    defaultExtractor: content => content.match(/[^<>'"\s]*[^<>'"\s:]/g) || [],
                }),
            ]
            : []),
    ],
}; 