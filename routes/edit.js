var express = require('express');
var router = express.Router({ mergeParams: true});
var Post = require('../models/post');
var getContent = require('./lib/getContent');
//auth session
var auth = require('./lib/auth');
router.get('/', auth.pleaseLogin);

router.get('/', function(req, res, next) {
    if((req.session.username == req.params.username)){
        if(req.params.action == 'new'){
        res.render('edit', {username: req.session.username});}
        else {
            var guest = false;
            getContent.getBlog(req.params.username, req.params.date, req.params.title, guest,
                function(err, results){
                    var user = results.userData[0];
                    var postNotFound = (results.postData == false);
                    var post = results.postData.post;


                    if(postNotFound){
                        next();
                    }
                    else{




                        res.render('edit', {
                            hasPost : (typeof(post)!='undefined'&&post.length > 0),
                            username: user.username,
                            category : post.category,
                            tags : post.tag,
                            title : post.title,
                            content: post.content

                        });

                    }






                }
            );


        }
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
