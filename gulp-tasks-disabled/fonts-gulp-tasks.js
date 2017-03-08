/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');


// define gulp and its modules
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	del = require('del'),
	flatten = require('gulp-flatten'),//reduce src directory trees to single directory
	runSequence = require('run-sequence');// allows tasks to be run sequentially instead of concurrently


// clean all fonts folders
gulp.task('clean-fonts', false, function() {
	return del([
		config.project.dest.fontsDir
		],
		{
			force: true
		});
});


// set up config for copying melkweb fonts
gulp.task('copy-fonts', false, function() {
	return gulp.src(config.project.src.fontFiles)
		.pipe(flatten())
		.pipe(gulp.dest(config.project.dest.fontsDir));
});

// update all fonts
gulp.task('update-fonts', 'clean fonts folders and copy fonts', function() {
	runSequence('clean-fonts', ['copy-fonts']);
});