import 'babel-polyfill';
import path from 'path';
import _ from 'lodash';
import rollbar from 'rollbar';
import Koa from 'koa';
import Router from 'koa-router';
import Pug from 'koa-pug';
import serve from 'koa-static';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import bodyParser from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import methodOverride from 'koa-methodoverride';
import middleware from 'koa-webpack';
import dotenv from 'dotenv';
import getWebpackConfig from '../webpack.config.babel';
import addRoutes from './controllers';
import container from './container';

export default () => {
  const app = new Koa();

  app.use(bodyParser());
  app.use(koaLogger());
  app.use(serve(path.join(__dirname, '..', 'public')));

  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      /* eslint-disable no-alert, no-underscore-dangle*/
      return req.body._method;
      /* eslint-enable no-alert, no-underscore-dangle*/
    }
    return '';
  }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(middleware({
      config: getWebpackConfig(),
    }));
  }

  app.keys = ['some secret hurr'];
  app.use(session(app));
  app.use(flash());

  app.use(async (ctx, next) => {
    /* eslint-disable no-alert, no-param-reassign */
    ctx.state = {
      /* eslint-enable no-alert, no-param-reassign */
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      signedId: () => ctx.session.userId,
    };
    await next();
  });

  const router = new Router();
  const isLogined = async (ctx, next) => {
    if (ctx.session.userId) {
      await next();
      return;
    }
    ctx.flash.set('Please register or log in your account!');
    ctx.redirect(router.url('newSession'));
  };
  router.use('/tasks', isLogined);
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  app.use(async (ctx) => {
    if (ctx.status !== 404) {
      return;
    }
    ctx.redirect('/404');
  });

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    basedir: path.join(__dirname, 'views'),
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
      { changeFormat: (date, format) => formatDate(date, format) },
    ],
  });

  pug.use(app);
  dotenv.config();

  return app;
};
