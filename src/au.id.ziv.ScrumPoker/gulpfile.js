/// <binding AfterBuild='build' />
var gulp = require("gulp");
var concat = require("gulp-concat");
var templateCache = require("gulp-angular-templatecache");
var minHtml = require("gulp-minify-html");
var sourcemap = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var del = require("del");

gulp.task("build", ["scripts", "templates", "static-files"]);

gulp.task("clean", function () {
    del("wwwroot/**/*");
});

gulp.task("scripts", function () {
    gulp.src([
            "js/app.module.js",
            "js/**/*.module.js",
            "js/**/*.js"
    ])
        .pipe(sourcemap.init())
            .pipe(concat("app.js"))
            .pipe(uglify())
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("wwwroot"));
});

gulp.task("static-files", function () {
    gulp.src([
        "node_modules/angular/angular{.js,.min.js,.min.js.map}",
        "node_modules/angular-route/angular-route{.js,.min.js,.min.js.map}",
        "node_modules/angular-ui-bootstrap/ui-bootstrap-tpls{.js,.min.js}",
        "node_modules/bootstrap/dist/**/*",
        "node_modules/jquery/dist/jquery.*",
        "node_modules/ms-signalr-client/jquery.signalr-*"
    ])
    .pipe(gulp.dest("wwwroot/vendor"));
    gulp.src("static/**")
    .pipe(gulp.dest("wwwroot"));
});

gulp.task("templates", function () {
    gulp.src("partials/*.html")
        .pipe(minHtml())
        .pipe(templateCache("templates.js", { standalone: true, root: "partials" }))
        .pipe(gulp.dest("wwwroot"));
});
