import gulp from 'gulp';
import getServer from './src';

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 5000, cb);
});
