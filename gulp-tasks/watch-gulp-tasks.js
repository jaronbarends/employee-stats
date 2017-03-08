/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	watch = require('gulp-watch');// gulp has its own built in watch function, but that doesn't watch for new or deleted file. The gulp-watch module is more powerful.


// set up gulp-watch

var watchSassDescription = false;// don't show this with gulp-help
gulp.task('watch-sass', watchSassDescription, function() {
	watch(config.project.src.scssFiles, function() {
		gulp.start('build-sass');
	});
});

// var watchJsDescription = false;// don't show this with gulp-help
// gulp.task('watch-javascript', watchJsDescription, function() {
// 	watch(config.project.src.jsFiles, function() {
// 		gulp.start('build-js');
// 	});
// });

// var watchHtmlDescription = false;// don't show this with gulp-help
// gulp.task('watch-html', watchHtmlDescription, function() {
// 	watch(config.project.src.htmlFiles, function() {
// 		gulp.start('build-html-includes');
// 	});
// });