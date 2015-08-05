var express = require('express');
User = require('../models/user');

var router = express.Router();

router.get('/', function(req, res){
    if(typeof(req.session.username) != 'undefined'){
        res.redirect('/'+req.session.username+'/index');
    }else{
    res.render('register',{error : req.flash('error').toString()});}
    //res.send('This is a test');
});


router.post('/', function(req, res) {
    var userData = {
        username : req.body.username,
        password : req.body.password,
        name : req.body.name
    };
    var user = new User(userData);
    user.register(function(status){
        if(status == false){
        req.flash('error', '已存在相同帐号, 请重新输入');
        res.redirect('/register');
        }else{
            req.session.username = req.body.username;
            res.redirect('/'+userData.username+'/index');
        }
    });
});

module.exports = router;
