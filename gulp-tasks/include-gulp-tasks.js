/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	include = require('gulp-include'),// include partials
	notify = require('gulp-notify'),
	gulpprint = require('gulp-print');

var includeDescription = 'include html partials';
gulp.task('build-html-includes', includeDescription, function() {
	return gulp.src(config.project.src.htmlFiles)
		.pipe(gulpprint())// can come in handy while debugging: prints all processed filenames to terminal
		.pipe(include())
			.on('error', console.log)
		.pipe(gulp.dest(config.project.dest.htmlDir))
		.pipe(notify({title: 'html includes built', message:config.getCompliment(), onLast: true}));
});