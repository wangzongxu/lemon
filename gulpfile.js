var path = require('path')
var fs = require('fs')
var rm = require('rimraf')
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('cleanAndInsertSync',function(){

  rm.sync('./dist');

  var css = fs.readFileSync('./src/style.css', {encoding:'utf8'})
              .replace(/\n|\r/g,"")
              .replace(/"/g,"'");

  var js = fs.readFileSync('./src/lemon.js', {encoding:'utf8'})
             .replace('css will be injected', css);

  fs.mkdirSync('./dist');
  fs.writeFileSync('./dist/lemon.js', js);

})

gulp.task('build', function(){
    gulp.src('./dist/lemon.js')
      .pipe(rename('lemon.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['cleanAndInsertSync', 'build'])
