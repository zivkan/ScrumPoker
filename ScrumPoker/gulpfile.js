/// <vs BeforeBuild='build' />
var gulp = require("gulp");
var concat = require("gulp-concat");
var templateCache = require("gulp-angular-templatecache");
var minHtml = require("gulp-minify-html");
var sourcemap = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");

gulp.task("scripts", function() {
    gulp.src([
            "App/app.module.js",
            "App/**/*.module.js",
            "App/**/*.js"
    ])
        .pipe(sourcemap.init())
            .pipe(concat("app.js"))
            .pipe(uglify())
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("templates", function() {
    gulp.src("partials/*.html")
        .pipe(minHtml())
        .pipe(templateCache("templates.js", { standalone: true, root:"partials" }))
        .pipe(gulp.dest("."));
});

gulp.task("build", ["scripts", "templates"]);