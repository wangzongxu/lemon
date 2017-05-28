var path = require('path')
var fs = require('fs')
var rm = require('rimraf')
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');
var prevJs;

gulp.task('build',function(){
  rm('./dist', function(){
    var css = fs.readFileSync('./src/style.css', {encoding:'utf8'})
                .replace(/\n|\r/g,"")
                .replace(/"/g,"'");
    prevJs = fs.readFileSync('./src/index.js', {encoding:'utf8'});
    var curJs = prevJs.replace('css will be injected', css)
    fs.writeFileSync('./src/index.js', curJs);

    gulp.src('./src/index.js')
        .pipe(rename('lemon.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('lemon.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
  })
})

gulp.task('reset', function(){
  fs.writeFileSync('./src/index.js', prevJs);
})

gulp.task('default', ['build', 'reset'])
