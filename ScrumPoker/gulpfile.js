var gulp = require("gulp");
var concat = require("gulp-concat");
var templateCache = require("gulp-angular-templatecache");
var minHtml = require("gulp-minify-html");
var sourcemap = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");

gulp.task("script", function() {
    gulp.src([
            "App/AppModule.js",
            "App/ControllerModule.js",
            "App/ConnectionController.js",
            "App/LobbyController.js",
            "App/PokerServer.js",
            "App/RoomController.js"
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
