import gulp from 'gulp';

import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import size from 'gulp-size';
import autoprefixer from 'gulp-autoprefixer'

import { DIR_NODE, DIR_WEB_FRONT } from './constants'

export default function sassTask(dirIn, dirOut) {
  return () => {
    return gulp.src(dirIn + '/app.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'compressed',
        includePaths: [
          DIR_WEB_FRONT,
          DIR_NODE
        ]
      }).on('error', sass.logError))
      .pipe(autoprefixer({browsers: ['last 1 version']}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dirOut))
      .pipe(size());
  }
}
