var gulp = require("gulp");
var concat = require("gulp-concat");

gulp.task("script", function() {
    gulp.src([
            "App/AppModule.js",
            "App/ControllerModule.js",
            "App/ConnectionController.js",
            "App/LobbyController.js",
            "App/PokerServer.js",
            "App/RoomController.js"
        ])
        .pipe(concat("app.js"))
        .pipe(gulp.dest("."));
});
