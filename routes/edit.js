var express = require('express');
var router = express.Router({ mergeParams: true});
var Post = require('../models/post');
//auth session
var auth = require('./lib/auth');
router.get('/', auth.pleaseLogin);

router.get('/', function(req, res, next) {
    if(req.session.username == req.params.username){
        res.render('edit', {username: req.session.username});
    }
    else{
        next();
    }
});

router.post('/', function(req, res){
   var postData = {
       username : req.session.username,
       title : req.body.titleArea,
       content : req.body.editArea,
       tag : req.body.tagArea,
       category : req.body.categorySelect
   };
    var post = new Post(postData);
    post.save();
    res.redirect('/'+req.session.username+'/index');

});

module.exports = router;
