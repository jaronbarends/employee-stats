/**
 * gulpfile.js
 *
 * Gulp sub-tasks are defined in separate modules
 * to list the most important tasks, type gulp help in the console
 * to list all tasks, type gulp help --all
 *
 */

/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

//include modularized tasks
	var requireDir = require('require-dir');
		requireDir('./gulp-tasks');

// define gulp and its modules we need for the (sub)tasks in this file
	var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
		runSequence = require('run-sequence');// allows tasks to be run sequentially instead of concurrently


// main gulp tasks

	// initialization task - initialize dependencies, merge 3rd party scripts etc
	gulp.task('init', 'Initialize dependencies', ['bower']);

	// combined watch task for javascript and sass
	// gulp.task('watch', 'Watch js, sass and html files', ['watch-sass', 'watch-javascript', 'watch-html']);
	gulp.task('watch', 'Watch sass and html files', ['watch-sass', 'watch-html']);
	// gulp.task('watch', 'sass files', ['watch-sass']);

	// all-compassing build task - running this task should give you all necessary frontend files
	gulp.task('default', 'Do all necessary stuff for deployment', function() {
		//we're using runSequence because init has to be finished before building js and sass
		// runSequence('clean-libs', 'init', ['build-js', 'build-sass', 'build-html-includes', 'optimize-images', 'update-fonts']);
		runSequence('clean-libs', 'init', ['build-sass', 'build-html-includes']);
		//runSequence('clean-libs', 'init', ['build-sass']);
	});
	// also make "build" available as command for building
	gulp.task('build', 'Do all necessary stuff for deployment', ['default']);
