var gulp = require("gulp");
var concat = require("gulp-concat");
var templateCache = require("gulp-angular-templatecache");

gulp.task("script", function() {
    gulp.src([
            "App/AppModule.js",
            "App/ControllerModule.js",
            "App/templates.js",
            "App/ConnectionController.js",
            "App/LobbyController.js",
            "App/PokerServer.js",
            "App/RoomController.js"
        ])
        .pipe(concat("app.js"))
        .pipe(gulp.dest("."));
});

gulp.task("templates", function() {
    gulp.src("partials/*.html")
        .pipe(templateCache("templates.js", { standalone: true, root:"partials/" }))
        .pipe(gulp.dest("."));
});
