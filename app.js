var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
const override=require('method-override')
var session=require('express-session')
var bodyParser = require('body-parser');


const Joi = require('joi');
const mongoose = require('mongoose');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var RegisterRouter = require('./routes/registration')
var adminRouter = require('./routes/admin')



var app = express();
var method = hbs.create({});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialDir:__dirname+'/views/partials/'}))
method.handlebars.registerHelper('unlessEquals', function(arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

method.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use(override('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));



Joi.objectId = require('joi-objectid')(Joi);
mongoose.connect('mongodb://localhost:27017/Store')
.then(() => console.log('Now connected to MongoDB!'))
.catch(err => console.error('Something went wrong', err));

app.use(express.json());
app.use(session({
  resave:false,
  name :'vembanattu_store',
  secret: 'keyboard cat',
  saveUninitialized:true
}))

app.use('/', indexRouter);
app.use('/registration', RegisterRouter);
app.use('/',adminRouter)
app.use('/',usersRouter)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
