import gulp from 'gulp';

let $ = require('gulp-load-plugins')();
import sourcemaps from 'gulp-sourcemaps';

import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import {assign} from 'lodash';

export function scriptWatchTask(jsIn, dirOut) {
  const customOpts = {
    entries: [jsIn],
    paths: ['.'],
    debug: true,
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: true,
    transform: [babelify]
  };
  const opts = assign({}, watchify.args, customOpts);

  const bundler = watchify(browserify(opts));

  const build = () => {
    return bundler.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dirOut));
  };

  bundler.on('update', build);
  bundler.on('log', $.util.log);

  return build;
}

export function scriptBuildTask(jsIn, dirOut) {
  return () => browserify({
    entries: jsIn,
    paths: ['.'],
    transform: [babelify]
  })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(dirOut));
}

export function uglifyTask(dirJs) {
  gulp.src(dirJs + '/app.js')
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe(gulp.dest(dirJs));
}
