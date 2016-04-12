var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require("vinyl-source-stream");


gulp.task('default', ['bundleClient']);

gulp.task('compileTS', function() {
	var tsResult = gulp
				.src('src/**/*.ts')
				.pipe(ts({
					noEmitOnError : true,
					module: 'commonjs',
					outDir: 'bin'
				}));


	return tsResult.js.pipe(gulp.dest('./bin'));
});


gulp.task('bundleClient', ['compileTS', 'move'], function() {
	var b = browserify();

	// Grab the file to build the dependency graph from
	b.add('./bin/client/main.js');

	b.bundle()
	 .pipe(source('main.js'))
	 .pipe(gulp.dest('./bin/client/static/js'));
});

gulp.task('move', ['move-component', 'move-statics']);

gulp.task('move-component', function(cb) {
    // move components
    var jsx = gulp.src('src/client/component/*.jsx')
                  .pipe(gulp.dest('./bin/client/component'));

    jsx.on('end', function() {
        cb();
    });
});

gulp.task('move-statics', function() {
	var vendors = gulp
				.src('src/client/static/**/*');

	return vendors.pipe(gulp.dest('./bin/client/static'));
});