/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	concat = require('gulp-concat'),// concatenate files
	cssnano = require('gulp-cssnano'),
	del = require('del'),
	filter = require('gulp-filter'),// filter gulp src
	mainBowerFiles = require('main-bower-files'),
	gulpprint = require('gulp-print'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify');// for minifying js files


// clean up libs files and folders
gulp.task('clean-libs', 'clean libs files and folders', function() {
	return del([
		config.libs.dest.jsDir,
		config.libs.dest.cssDir,
		config.libs.dest.scssDir
	]);
});


// main bower task
gulp.task('bower', 'Create merged js and css files for bower components', function() {

	// create filters to handle different kinds of bower-component-files
	var jsFilter = filter('**/*.js', {restore: true}),
		cssFilter = filter('**/*.css', {restore: true}),
		scssFilter = filter('**/*.scss', {restore: true});

	// TODO moeten we nog een lege libs.css en _libs.scss aanmaken voor het geval die niet
	// in een van de bower packages zitten? (dan zouden ze een error kunnen geven in app.scss),
	// of worden ze sowieso aangemaakt?

	return gulp.src(mainBowerFiles({base: config.libs.src.dir}))
		.pipe(jsFilter)
			.pipe(gulpprint(function(filepath) {return 'build js: '+filepath;}))
			.pipe(concat(config.libs.dest.jsFilename))
			.pipe(gulp.dest(config.libs.dest.jsDir))
			.pipe(uglify())
			.pipe(rename(config.libs.dest.jsMinFilename))
			.pipe(gulp.dest(config.libs.dest.jsDir))
		.pipe(jsFilter.restore)
		.pipe(cssFilter)
			.pipe(gulpprint(function(filepath) {return 'build css:'+filepath;}))
			.pipe(concat(config.libs.dest.cssFilename))
			.pipe(cssnano())
			.pipe(gulp.dest(config.libs.dest.cssDir))
		.pipe(cssFilter.restore)
		.pipe(scssFilter)
			.pipe(gulpprint(function(filepath) {return 'build scss: '+filepath;}))
			.pipe(concat(config.libs.dest.scssFilename))
			.pipe(gulp.dest(config.libs.dest.scssDir));
});