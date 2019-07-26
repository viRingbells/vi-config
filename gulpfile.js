const gulp = require('gulp');
const ts = require('gulp-typescript');
const src = 'src/**/*.ts';

const tsConfig = {
    module: 'commonjs',
    noImplicitAny: true,
    removeComments: true,
    preserveConstEnums: true,
    esModuleInterop: true,
    sourceMap: true,
    target: 'es5'
}

gulp.task('build', function () {
    console.log('Building files in ' + src);
    return gulp.src(src)
        .pipe(ts(tsConfig))
        .pipe(gulp.dest('dist'))
        .on('end', () => console.log('Done!'));
});

gulp.task('watch', () => {
    const watcher = gulp.watch(src);
    watcher.on('add', buildCertainFile);
    watcher.on('change', buildCertainFile);
});

function buildCertainFile(filePath) {
    console.log('Building file ' + filePath);
    gulp.src(filePath)
        .pipe(ts(tsConfig).on('error', function (error) {
            this.emit('end');
        }))
        .pipe(gulp.dest('dist'))
        .on('end', () => console.log('Done!'));
}

gulp.task('dev', gulp.series(['build', 'watch']));
gulp.task('default', gulp.series(['build']));
