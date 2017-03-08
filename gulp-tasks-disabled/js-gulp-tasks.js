/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	babel = require('gulp-babel'),// compile es2015 code into js
	concat = require('gulp-concat'),// concatenate files
	jshint = require('gulp-jshint'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	stylish = require('jshint-stylish'),
	uglify = require('gulp-uglify');// for minifying js files


// TODO: jshint doesn't report undeclared variables yet?
// does it abort on fail?
// define a named function, so we can assign it to a task, but also pass it into pipe
// jshintDescription = 'Check js-files with jshint';
gulp.task('jshint', false, function() {
	return gulp.src(config.project.src.jsFiles)
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});


// build-js: jshint, uglify, concatenate.
var buildJsDescription = 'Run jshint, uglify and concat js files';
gulp.task('build-js', buildJsDescription, function() {
	return gulp.src(config.project.src.jsFiles)
		// .pipe(gulpprint())// prints all processed filenames to terminal
		.pipe(jshint())
		.pipe(sourcemaps.init()) // SOURCEMAPS NOT WORKING YET?!
		.pipe(concat(config.project.dest.jsFilename))// concat has to be done *before* uglify, otherwise app.js gets included twice - no idea why?!
		.pipe(babel({presets: ['es2015']})) 
		.pipe(gulp.dest(config.project.dest.jsDir))
		.pipe(uglify())
		.pipe(rename(config.project.dest.jsMinFilename))
		.pipe(sourcemaps.write(config.project.dest.sourcemapDir))//needs to be used after minify
		.pipe(gulp.dest(config.project.dest.jsDir))
		.pipe(notify('javascript built'));
});