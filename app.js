var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var connection = require('./models/db');
var multer  = require('multer');

var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var register = require('./routes/register');
var edit = require('./routes/edit');
var profile = require('./routes/profile');
var blog = require('./routes/blog');
var blog_list = require('./routes/blog_list');
var deletepost = require('./routes/deletepost');
var deletecategory = require('./routes/deletecategory');
var editcategory = require('./routes/editcategory');
var search = require('./routes/search');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//app.use(multer({ dest: './public/images/avatars/'}));
/*
app.use(multer({ dest: './public/images/avatars/',
    onFileUploadStart:function(file){

        console.log("upload start");
    },
    //上传结束时触发
    onFileUploadComplete:function(req, res){
        console.log("upload complete");
        //console.log(req.session.username);
    },

    rename : function(fieldname ,filename, req, res){

        console.log('这里是params: '+req.body);
        return fieldname+'testname';
    }

}));
*/

app.use(cookieParser());


var sessionStore = new SessionStore({}, connection);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/:username/index', index);
app.use('/:username/edit/:action', edit);
app.use('/:username/edit/:date/:title', edit);
app.use('/:username/profile', profile);
app.use('/:username/:date/:title', blog);
//app.use('/:username/:date/:title/like', blog);
app.use('/:username/blog_list/:category', blog_list);
app.use('/:username/deletepost/:date/:title', deletepost);
app.use('/:username/deletecategory/:category', deletecategory);
app.use('/:username/editcategory/:category', editcategory);
app.use('/search', search);
app.use('/login', login);
app.use('/register', register);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('你要的东西不在这儿, 到别处看看吧。');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;



var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('app listening at localhost:%s', port);

});