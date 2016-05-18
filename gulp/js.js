'use strict';


var gulp        = require('gulp'),
    _           = require('lodash'),
    path        = require('path'),
    rename      = require('gulp-rename'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    bytediff    = require('gulp-bytediff'),
    sourcemaps  = require('gulp-sourcemaps');

gulp.task('build:js', function(callback){
    gulp.src(path.join( 'js' , '/**/*.js'))
    .pipe(uglify({
        mangle: false
    }))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./dest/js/'))
    .on('end', function () {
        if(_.isFunction(callback)){
            callback();
        }
    });
});