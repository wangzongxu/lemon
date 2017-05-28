var path = require('path')
var fs = require('fs')
var rm = require('rimraf')
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');
var prevJs;

gulp.task('build',function(){

  rm.sync('./dist');

  var css = fs.readFileSync('./src/style.css', {encoding:'utf8'})
              .replace(/\n|\r/g,"")
              .replace(/"/g,"'");

  prevJs = fs.readFileSync('./src/lemon.js', {encoding:'utf8'});

  var curJs = prevJs.replace('css will be injected', css)

  fs.writeFileSync('./src/lemon.js', curJs);

  gulp.src('./src/lemon.js')
      .pipe(gulp.dest('./dist'))
      .pipe(rename('lemon.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'))
})

gulp.task('reset', function(){
  fs.writeFileSync('./src/lemon.js', prevJs);
})

gulp.task('default', ['build', 'reset'])
