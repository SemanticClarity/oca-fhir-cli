var gulp = require('gulp')
, jshint = require("gulp-jshint");


// Run lint
gulp.task('jsLint', function () {
	return gulp.src(['./lib/*.js', './test/test.js']) 
	.pipe(jshint({esversion:9}))
	.pipe(jshint.reporter()); 
});

