import gulp from 'gulp';

const $ = require('gulp-load-plugins')();
import size from 'gulp-size';
import webserver from 'gulp-webserver';

import del from 'del';

import {
  DIR_NODE, DIR_WEB_FRONT, DIR_WEB_APP,
  DIR_DEST, DIR_DEST_APP_JS, API_HOST
} from './gulp/constants'


// Styles
import sassTask from './gulp/sass'
gulp.task('styles', ['sass-app']);
gulp.task('sass-app', sassTask(DIR_WEB_APP + '/css', DIR_DEST + '/css/app'));

// Scripts
import {scriptWatchTask, scriptBuildTask} from './gulp/script'
gulp.task('scripts', ['scripts-app']);
gulp.task('buildScripts', ['buildScripts-app']);

gulp.task('scripts-app', scriptWatchTask(DIR_WEB_APP + '/js/app.js', DIR_DEST_APP_JS));
gulp.task('buildScripts-app', scriptBuildTask(DIR_WEB_APP + '/js/app.js', DIR_DEST_APP_JS));

// Clean
gulp.task('clean', cb => {
  del.sync([DIR_DEST]);
  cb();
});

// Bundle
gulp.task('bundle', ['styles', 'scripts']);
gulp.task('buildBundle', ['styles', 'buildScripts']);

// Assets
gulp.task('assets'/* , ['assets:font-awesome', 'assets:bootstrap'] */, () => {
  return gulp.src([DIR_WEB_FRONT + '/assets/**/*'])
    .pipe(gulp.dest(DIR_DEST))
    .pipe(size());
});

gulp.task('assets:font-awesome', () => {
  gulp.src([DIR_NODE + '/font-awesome/fonts/**/*'], {base: DIR_NODE + '/font-awesome/'})
    .pipe(size({title: 'font-awesome'}))
    .pipe(gulp.dest(DIR_DEST + '/css'));
});

gulp.task('assets:bootstrap', () => {
  gulp.src([DIR_NODE + '/bootstrap-sass/assets/fonts/**/*'], {base: DIR_NODE + '/bootstrap-sass/assets/'})
    .pipe(size({title: 'bootstrap'}))
    .pipe(gulp.dest(DIR_DEST + '/css'));
});

gulp.task('dev-assets', () => {
  return gulp.src([DIR_WEB_FRONT + '/dev/**/*'])
    .pipe(gulp.dest(DIR_DEST))
    .pipe(size());
});

gulp.task('server', ["dev-assets"], () => {


  return gulp.src(DIR_DEST)
    .pipe(webserver({
      host: 'localhost',
      port: 8888,
      livereload: true,
      open: true,
      fallback: "index.html",
      proxies: [
        {
          source: '/api',
          target: API_HOST + '/api'
        }
      ]
    }));
});

gulp.task('watch', ['bundle', 'assets', 'server'], () => {
  gulp.watch([DIR_WEB_FRONT + '/**/*.scss', DIR_WEB_FRONT + '/**/*.css'], ['styles']);
  gulp.watch(DIR_WEB_FRONT + '/assets/**/*', ['assets']);
  gulp.watch(DIR_WEB_FRONT + '/dev/**/*', ['dev-assets']);
});


import {uglifyTask} from './gulp/script'
gulp.task('build', ['buildBundle', 'assets'], () => {
  uglifyTask(DIR_DEST_APP_JS);
});

// Default task
gulp.task('default', ['clean', 'build']);
