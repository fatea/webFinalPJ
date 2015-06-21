var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var utf = require('./lib/utf');

router.get('/', function(req, res, next) {

    getContent.getBlog(req.params.username, req.params.date, req.params.title, (req.params.username != req.session.username),

        function(err, results){

            var user = results.userData[0];

            var postNotFound = (results.postData == false);
            var post = results.postData.post;
            var comments = results.postData.comments;
            var tag = results.postData.tag;



            var fullUrl =  req.protocol + '://' + req.get('host') + '/'+req.params.username+'/index';


            if(postNotFound){
                    next();
            }
            else{



                if(comments == false){
                    comments = [];
                }


                res.render('blog', {
                    //postData : postData,
                    hasPost : (typeof(post)!='undefined'&&post.length > 0),
                    username: user.username,
                    name : user.name,
                    mainTitle : user.name +'的博客',
                    subTitle : fullUrl.toString(),
                    comments : comments,
                    category : post.category,
                    tags : tag,
                    loginStatus : (req.session.username != null),
                    guest : (req.params.username != req.session.username),
                    title : post.title,
                    content: post.content,
                    time : post.time,
                    pageview : post.pageview,
                    imgsrc : '/images/avatars/'+req.params.username+'.gif'
                });

            }
        });

});

module.exports = router;
