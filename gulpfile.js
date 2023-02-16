"use strict"

const {src, dest} = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer'); //выставляет webkit префиксы
const cssBeautify = require('gulp-cssbeautify');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano'); //собирает css в 1 файл
const uglify = require('gulp-uglify'); //минимизирует js в min.js
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const del = require('del');
const rigger = require("gulp-rigger");  //собирает js в 1 файл
const browserSync = require('browser-sync').create();


/* Paths*/
const srcPath = "src/";
const distPath = "dist/";

const path = {
    build: {
        html:   distPath,
        css:    distPath + "assets/css/",
        js:     distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath+ "*.html",
        css:    srcPath + "assets/scss/*.scss",
        js:     srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpeg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },
    watch: {
        html:   srcPath + "**/*.html",
        css:    srcPath + "assets/scss/**/*.scss",
        js:     srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.{jpeg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },
    clean: "./" + distPath
}

function html(){
    return src(path.src.html, {base: srcPath})
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}))
}

function css(){
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(sass())
        .pipe(cssBeautify())
        .pipe(dest(path.build.css))
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zIndex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}))
}

function js(){
    return src(path.src.js, {base: srcPath + "assets/js/"})
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(concat('javascript.min.js'))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}))
}

function images(){
    return src(path.src.images, {base: srcPath + "assets/images/"})
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 80, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}))
}

function fonts(){
    return src(path.src.fonts, {base: srcPath + "assets/fonts/"})
        .pipe(browserSync.reload({stream: true}))
}

function clean(){
    return del(path.clean)
}

function watchFiles(){
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

function lifeServer(){
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
}


const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watchFiles, lifeServer)

// exports.html = html;
// exports.css = css;
// exports.js = js;
// exports.images = images;
// exports.fonts = fonts;
// exports.clean = clean;
//
// exports.watch = watch;
// exports.build = build;
exports.default = watch;

