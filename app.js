var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var blogRouter = require('./routes/blog');
var userRouter = require('./routes/user');

const session = require('express-session')
const redisStore = require('connect-redis')(session)

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev',{
//   steam: process.stdout // morgan的默认值，加不加的效果都是一样的
// })); 

// 另外一个morgan打印日志的格式 
// app.use(logger('combined', {
//   steam: process.stdout // morgan的默认值，加不加的效果都是一样的
// })); 

/**
 * 通过判断当前模式来选择morgan的方式
 * 目前有两种模式：dev和production
 */

const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  // 开发环境 / 测试环境
  app.use(logger('dev'));
} else {
  // 线上环境
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: writeStream
  }));
}


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// redis 的设置处理应该放在session之前
const redisClient = require('./db/redis')
const sessionStore = new redisStore({
  client: redisClient
})

// session 的应用应该在路由之前
app.use(session({
  secret: 'xInGz#11HoU>>', // 秘钥
  cookie: {
    // path: '/',  // cookie 生效范围  默认配置
    // httpOnly: true, // 客户端不能进行更改  默认配置
    maxAge: 24 * 60 * 60 * 1000 // 生效时间
  },
  store: sessionStore // 将session放到redis中
}))


// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handlers
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
