/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	autoprefixer = require('gulp-autoprefixer'),// auto-prefix css properties
	cssnano = require('gulp-cssnano'),
	notify = require('gulp-notify'),
	gulpprint = require('gulp-print'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps');

var autoprefixerOptions = {
	browsers: ['last 2 versions'],
	cascade: false
};

var sassOptions = {
	errLogToConsole: true
};

var sassDescription = 'compile scss files into css and minify';
gulp.task('build-sass', sassDescription, function() {
	return gulp.src(config.project.src.scssFiles)
		.pipe(gulpprint())// can come in handy while debugging: prints all processed filenames to terminal
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(autoprefixer(autoprefixerOptions))
		.pipe(rename(config.project.dest.cssFilename))
		.pipe(gulp.dest(config.project.dest.cssDir))
		.pipe(cssnano())
		.pipe(rename(config.project.dest.cssMinFilename))
		.pipe(sourcemaps.write(config.project.dest.sourcemapDir))//needs to be used after minify
		.pipe(gulp.dest(config.project.dest.cssDir))
		.pipe(notify({title: 'Sass built', message:config.getCompliment()}));
});