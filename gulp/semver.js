var gulp = require('gulp');
var bump = require('gulp-bump');
var semver = require('semver');
var fs = require('fs');


/*

major: 1.0.0
minor: 0.1.0
patch: 0.0.2
prerelease: 0.0.1-2

*/


var getPackageJson = function () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

gulp.task('semver:patch', ['patch:package', 'patch:bower']);


gulp.task('patch:package', function(){
	var pkg = getPackageJson();
  	var newVer = semver.inc(pkg.version, 'patch');	

 	return gulp.src(['./package.json'])
    .pipe(bump({
      version: newVer
    }))
    .pipe(gulp.dest(__dirname + '/..'));
})

gulp.task('patch:bower', function(){
	var pkg = getPackageJson();
  	// increment version
  	var newVer = semver.inc(pkg.version, 'patch');	
 return gulp.src(['./.bower.json'])
    .pipe(bump({
      version: newVer
    }))
    .pipe(gulp.dest(__dirname + '/..'));
})

gulp.task('semver:major', function(){
	var pkg = getPackageJson();
	var newVer = semver.inc(pkg.version, 'major');	
  return gulp.src(['./bower.json', './package.json'])
  .pipe(bump({
      version: newVer
    }))
  .pipe(gulp.dest('../'));
});


gulp.task('semver:minor', function(){
	var pkg = getPackageJson();
	var newVer = semver.inc(pkg.version, 'minor');	
  return gulp.src(['./bower.json', './package.json'])
  .pipe(bump({
      version: newVer
    }))
  .pipe(gulp.dest('./'));
});


gulp.task('semver:patch', function(){
	var pkg = getPackageJson();
  	// increment version
  	var newVer = semver.inc(pkg.version, 'patch');	
 return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({
      version: newVer
    }))
    .pipe(gulp.dest(__dirname + '/..'));
});

gulp.task('semver:prerelease', function(){
  return gulp.src(['./bower.json', './package.json'])
  .pipe(bump())
  .pipe(gulp.dest('./'));
});
