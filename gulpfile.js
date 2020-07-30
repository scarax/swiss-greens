const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const webp = require('imagemin-webp');
const newer = require('gulp-newer');
const del = require('del');
const browserSync = require('browser-sync').create();

// HTML
const html = () => {
  return gulp
    .src('src/*.html')
    .pipe(newer('build/'))
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
};

exports.html = html;

// Styles
const style = () => {
  return gulp
    .src('src/sass/style.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.stream());
};

exports.style = style;

const styleBuild = () => {
  return gulp
    .src('src/sass/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(minify({ comments: 'false' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build/css/'));
};

exports.styleBuild = styleBuild;

// Scripts
const js = () => {
  return gulp
    .src('src/js/**/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js/'))
    .pipe(browserSync.stream());
};

exports.js = js;

// Images
const image = () => {
  return gulp
    .src('src/img/**/*.{png,jpg}')
    .pipe(newer('build/img/'))
    .pipe(gulp.dest('build/img/'))
    .pipe(browserSync.stream());
};

exports.image = image;

const imageBuild = () => {
  return gulp
    .src('src/img/**/*.{png,jpg}')
    .pipe(newer('build/img/'))
    .pipe(
      imagemin(
        [
          imagemin.optipng({ optimizationLevel: 3 }),
          imagemin.jpegtran({ progressive: true }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest('build/img/'))
    .pipe(
      imagemin([webp({ quality: 80 })], {
        verbose: true,
      })
    )
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest('build/img/'));
};

exports.imageBuild = imageBuild;

const svg = () => {
  return gulp
    .src('src/img/**/*.svg')
    .pipe(newer('build/img/'))
    .pipe(gulp.dest('build/img/'))
    .pipe(browserSync.stream());
};

exports.svg = svg;

const svgBuild = () => {
  return gulp
    .src('src/img/**/*.svg')
    .pipe(newer('build/img/'))
    .pipe(
      imagemin([imagemin.svgo()], {
        verbose: true,
      })
    )
    .pipe(gulp.dest('build/img/'));
};

exports.svgBuild = svgBuild;

// Fonts
const fonts = () => {
  return gulp
    .src('src/fonts/**/*.{woff,woff2}')
    .pipe(newer('build/fonts/'))
    .pipe(gulp.dest('build/fonts/'));
};

exports.fonts = fonts;

// Clean
const clean = () => {
  return del('./build');
};

exports.clean = clean;

// Server
const server = () => {
  browserSync.init({
    server: 'build',
    notify: false,
    open: false,
  });
};

exports.server = server;

// Watch
const watch = () => {
  gulp.watch('src/*.html', gulp.series(html));
  gulp.watch('src/sass/**/*.scss', gulp.series(style));
  gulp.watch('src/js/**/*.js', gulp.series(js));
  gulp.watch('src/img/**/*.{png,jpg}', gulp.series(image));
  gulp.watch('src/img/**/*.svg', gulp.series(svg));
  gulp.watch('src/fonts/**/*.{woff,woff2}', gulp.series(fonts));
};

exports.watch = watch;

// Default
const dev = gulp.series(
  clean,
  gulp.parallel(html, style, js, image, svg, fonts)
);

const build = gulp.series(
  clean,
  gulp.parallel(html, styleBuild, js, imageBuild, svgBuild, fonts)
);

exports.build = build;

exports.default = gulp.series(dev, gulp.parallel(server, watch));
