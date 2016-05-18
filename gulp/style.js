'use strict';

var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    path        = require('path'),
    _           = require('lodash'),
    autoprefixer        = require('gulp-autoprefixer'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    sourcemaps  = require('gulp-sourcemaps');

/////////////////////////////////////////////////////////////////////////////////////
//
// runs sass, creates css source maps
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build:scss', function() {
    return gulp.src( path.join( 'scss' , '/**/*.scss') )
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(cssmin())
        .pipe(sourcemaps.write( '../maps/'))
        .pipe(gulp.dest('./dest/style/'));
});
