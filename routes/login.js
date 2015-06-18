var express = require('express');

var User = require('../models/user.js');
var auth = require('./lib/auth');

var router = express.Router();

router.get('/', auth.alreadyLogin);
router.get('/', function(req, res){
    if(!req.session.username){
        res.render('login',{error : req.flash('error').toString()});
    }
    else{
        res.redirect('/' + req.session.username +'/index');
    }

});


router.post('/', function(req, res) {
    User.login(req.body.username, req.body.password,
        function(){
                req.flash('error', '用户名和密码错误, 请重新输入');
            res.redirect('/login');
        },
        function(){
            req.session.username = req.body.username;
        res.redirect('/' + req.session.username +'/index');
    });
});

module.exports = router;
