'use strict';

var gulp = require('gulp');
var path        = require('path');

gulp.task('watch', function() {
    /* js */
    gulp.watch([ path.join( 'scss' , '/**/*.scss')], ['build:scss'] );
    /* scss */
    gulp.watch([ path.join( 'js' , '/**/*.js')], ['build:js'] );


});


