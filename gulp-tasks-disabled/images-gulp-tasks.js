/*jslint node: true */ // this instructs linter in text-editor to assume node is present

'use strict';

var config = require('../gulp-config.js');

// define gulp and its modules we need for the (sub)tasks in this file
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	imagemin = require('gulp-imagemin'),// optimize images
	imageminPngquant  = require('imagemin-pngquant');// algorithm for imagemin


var optimizeImagesDescription = 'Optimize/compress images';
gulp.task('optimize-images', optimizeImagesDescription, function() {
	return gulp.src(config.project.src.imgFiles)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [imageminPngquant()]
		}))
		.pipe(gulp.dest(config.project.dest.imgDir));
});
