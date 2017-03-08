/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');


// define gulp and its modules
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	autoprefixer = require('gulp-autoprefixer'),// auto-prefix css properties
	concat = require('gulp-concat'),// concatenate files
	cssnano = require('gulp-cssnano'),
	del = require('del'),
	filter = require('gulp-filter'),// filter gulp src
	flatten = require('gulp-flatten'),//reduce src directory trees to single directory
	gulpif = require('gulp-if'),// conditional piping
	ignore = require('gulp-ignore'),// ignore files in src
	imagemin = require('gulp-imagemin'),// optimize images
	imageminPngquant  = require('imagemin-pngquant'),// algorithm for imagemin
	jshint = require('gulp-jshint'),
	mainBowerFiles = require('main-bower-files'),
	notify = require('gulp-notify'),
	gulpprint = require('gulp-print'),
	rename = require('gulp-rename'),
	runSequence = require('run-sequence'),// allows tasks to be run sequentially instead of concurrently
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	stylish = require('jshint-stylish'),
	uglify = require('gulp-uglify'),// for minifying js files
	watch = require('gulp-watch');// gulp has its own built in watch function, but that doesn't watch for new or deleted file. The gulp-watch module is more powerful.
