var express = require('express');
var path = require('path');
var session = require('express-session')
var timestring = require('timestring')
var config = require('./config')
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
const log = require('barelog')
var hbs = require('hbs');


// Register Handlebars utility functions
hbs.registerHelper('incr', function(value, options){
  return parseInt(value) + 1;
});

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  store: require('./lib/session-store'),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // Length of workshop in milliseconds
    maxAge: timestring(config.eventHours, 'ms')
  }
}));
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('sorry', {
    message: '404 - Looks like you followed a bad link.'
  })
});

// error handler
app.use(function(err, req, res, next) {
  log('ERROR PASSED TO EXPRESS ERROR HANDLER:')
  log(err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
