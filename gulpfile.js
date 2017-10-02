var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    concatcss = require("gulp-concat-css"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    stripDebug = require("gulp-strip-debug"),
    rename = require("gulp-rename"),
    multiDest = require("gulp-multi-dest"),
    jasmineBrowser = require("gulp-jasmine-browser");

var path = {
    dist: "./dist/",
    docs: "./docs/",
    src: "./src/*.*",
    css: "./src/*.css",
    js: "./src/*.js",
};

/* clean */
gulp.task("clean", function (cb) {
    rimraf(path.dist, cb);
});

gulp.task("min:css", function () {
    return gulp.src(path.css)
        .pipe(concatcss("punchcard.min.css"))
        .pipe(cssmin())
        .pipe(multiDest([path.dist, path.docs]));
});
gulp.task("min:js", function () {
    return gulp.src(path.js)
        .pipe(concat("punchcard.min.js"))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(multiDest([path.dist, path.docs]));
});
gulp.task("copy", function () {
    return gulp.src(path.src)
        .pipe(multiDest([path.dist, path.docs]));

});

/*jasmine server to run specs*/
gulp.task('jasmine'), function() {
  return gulp.src(['src/ .js', 'spec/**/*_spec.js'])
  .pipe(jasmineBrowser.specRunner())

}


/* build */
gulp.task("build", ["clean", "min:css", "min:js", "copy"]);
