var db = require('../../models/db');
var User = require('../../models/user');

function pleaseLogin(req, res, next) {
    if ((!req.session.username)) {
        res.redirect('/login');
        console.log("尚未登录，验证拒绝");
    } else {
        next();
    }
}

function alreadyLogin(req, res, next){
    if(req.session.username){
        var backURL = req.header('Referer') || '/'+req.session.username+'/index';
        res.redirect(backURL);
    }else{
        next();
    }
}

function noUser(req, res, next){
   User.get(req.params.username, function(err, results){
      if(err == true){

          console.log(err);
      }
       else(res.redirect('/404'));
   });
}

module.exports.pleaseLogin = pleaseLogin;
module.exports.alreadyLogin = alreadyLogin;
module.exports.noUser = noUser;

