const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const fileinclude = require('gulp-file-include');
const scss = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const browseSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const notify = require("gulp-notify");
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const webpack = require('webpack');
const webpackStream = require('webpack-stream');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        },
        notify: false,
        open: false
    });
}


function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*.{png,jpg,svg}')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function webpC() {
    return src('app/images/**/*.{png,jpg,jpeg}')
        .pipe(webp({
            quality: 50
        }))
        .pipe(dest('dist/images'))

};


function htmlInclude() {
    return src(['app/html/source.html'])
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename({
            basename: 'index',
            extname: '.html'
        }))
        .pipe(plumber.stop())
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function htmlCatalogInclude() {
    return src(['app/html/catalog.html'])
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename({
            basename: 'catalog',
            extname: '.html'
        }))
        .pipe(plumber.stop())
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function htmlProductInclude() {
    return src(['app/html/product.html'])
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename({
            basename: 'product',
            extname: '.html'
        }))
        .pipe(plumber.stop())
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
            // 'node_modules/jquery/dist/jquery.js',
            // 'node_modules/materialize/dist/js/materialize.min.js',
            'app/js/main.js'
        ])
        .pipe(plumber())
        .pipe(webpackStream({
            output: {
                filename: 'main.js'
            },
            mode: 'development',
            module: {
                rules: [{
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: "defaults"
                                }]
                            ]
                        }
                    }
                }]
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error', notify.onError()))
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function stylesMedia() {

    return src('app/scss/media.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(scss({
            outputStyle: 'compressed'
        }).on('error', notify.onError()))
        .pipe(concat('media.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function styles() {

    return src('app/scss/style.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(scss({
            outputStyle: 'compressed'
        }).on('error', notify.onError()))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/main.min.js',
            'app/js/materialize.min.js',
            'app/*.html'
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}



function watching() {
    watch(['app/scss/*.scss'], styles);
    watch(['app/scss/media.scss'], stylesMedia);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch('app/*.html').on('change', browserSync.reload);
    watch('app/html/source.html').on('change', htmlInclude);
    watch('app/html/*.html').on('change', htmlInclude);
    watch('app/html/product.html').on('change', htmlProductInclude);
    watch('app/html/catalog.html').on('change', htmlCatalogInclude);
}

exports.htmlInclude = htmlInclude;
exports.htmlCatalogInclude = htmlCatalogInclude;
exports.htmlProductInclude = htmlProductInclude;
exports.styles = styles;
exports.stylesMedia = stylesMedia;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.webpC = webpC;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, webpC, build);
exports.default = parallel(htmlProductInclude, htmlCatalogInclude, htmlInclude, styles, stylesMedia, browsersync, watching, scripts);