import gulp from 'gulp';

let $ = require('gulp-load-plugins')();

import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import {assign} from 'lodash';

export function scriptBuildTask(jsIn, dirOut) {
  return () => browserify({
    entries: jsIn,
    paths: ['.'],
    transform: [babelify]
  })
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest(dirOut));
}

export function uglifyTask(dirJs) {
  gulp.src(dirJs + '/index.js')
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe(gulp.dest(dirJs));
}
