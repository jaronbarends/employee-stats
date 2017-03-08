// define constants for folders etc
// locations are relative to the location of this gulpfile.js
// be aware of the difference between dest (destination) and dist (distribution) ;)
'use strict';

module.exports = {
	project: {
		name: 'project',// just so we have a name to show when we want to log stuff 
		src: {
			jsFiles:[
				'./js/*.js',
				'./Frontend/components/**/*.js',
				'!./Frontend/components/**/demo.js'
			],
			scssFiles: [
				'./*.scss',
				'./scss/**/*.scss',
				// '!./Frontend/scss/libs/*/**/*.scss',//exclude subfolders of libs
				// './Frontend/components/**/*.scss'
			],
			imgFiles: [
				'./dist/assets/img/'
			],
			fontFiles: [
				'./Frontend/assets/fonts/**/*.{eot,woff,ttf,svg}',
				'./Frontend/scss/6-components/**/fonts/**/*.{eot,woff,ttf,svg}'
			],
			htmlFiles: [
				'./Frontend/*.html',
				'./Frontend/**/html-includes/**/*.html'
			]
		},
		dest: {
			jsFilename: 	'app.js',
			jsMinFilename: 	'app.min.js',
			cssFilename: 	'app.css',
			cssMinFilename: 'app.min.css',
			jsDir: 			'./dist/js/',
			cssDir: 		'./css/',
			fontsDir: 		'./dist/assets/fonts/',
			htmlDir:       './dist/',
			imgDir: 		'./dist/assets/img/',
			sourcemapDir: 	'maps/'// this is relative to the dest folder in the stream
		}
	},
	libs: {
		name: 'project libs',
		src: {
			dir: 'bower_components/'
		},
		dest: {
			jsFilename: 	'libs.js',
			jsMinFilename: 	'libs.min.js',
			cssFilename:  	'_libs-css.scss',// bower components can consist of css or scss files. We give them all .scss extension
			scssFilename: 	'_libs-scss.scss',
			jsDir: 			'./dist/libs/',
			cssDir: 		'./Frontend/scss/libs/',// we want to include the css from libs into our main scss file, so the destination is inside the Frontend folder
			scssDir: 		'./Frontend/scss/libs/'// we want to include the css from libs into our main scss file, so the destination is inside the Frontend folder
		}
	},
	getCompliment: function() {
		//compliments to show upon succes - feel free to add your own!
		var compliments = ['Great work!', 'Awesome coding!', 'Well done!', 'I love it when a plan comes together.', ':)', 'Your mom will be proud of you.', 'Yay!', 'Let\'s get the champagne!'];
		return compliments[Math.floor(compliments.length*Math.random())];
	}
};