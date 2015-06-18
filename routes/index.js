var express = require('express');
var router = express.Router({ mergeParams: true});
var Post = require('../models/post');
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');

router.get('/', function(req, res, next) {
        getContent.getIndex(req.params.username,

            function(err, results){

                var userData = results.userData[0];
                var postData = results.postData;
                var categoryData = results.categoryData;
                var tagData = results.tagData;

                console.log(tagData);
                var fullUrl =  req.protocol + '://' + req.get('host') + req.originalUrl;


                if(results.postData == false){

                    if(results.userData != false){
                        res.render('index', {
                            hasPost : (typeof(postData)!='undefined'&&postData.length > 0),
                            mainTitle : req.params.username+'的博客',
                            subTitle : fullUrl.toString(),


                            imgsrc : '/images/avatars/'+'wjt.gif'
                        });}
                    else{next();}

                    }
                else{


                    var tagsArr =[];
                    var categoryArr = [];
                    var titleArr = [];
                    var contentArr = [];
                    var timeArr = [];
                    var hrefArr = [];
                    var i;

                    for(i= 0; i < postData.length;i++){

                        categoryArr[i] = postData[i].category;
                        titleArr[i] = postData[i].title;
                        contentArr[i] = markdown.parse(postData[i].content) ;
                        timeArr[i] = postData[i].time;
                        hrefArr[i] = '/'+postData[i].username+'/'+postData[i].date+'/'+postData[i].title
                    }


                    //tagsArr[i] = tagData[i].tag;



                    res.render('index', {
                        //postData : postData,
                        hasPost : (typeof(postData)!='undefined'&&postData.length > 0),
                        categoryLength : postData.length,
                        postDataLength : postData.length,
                        name : userData.name,
                        mainTitle : userData.name +'的博客',
                        subTitle : fullUrl.toString(),

                        category : categoryData,
                        tagsArrArr : tagsArr,
                        categoryArr : categoryArr,
                         titleArr : titleArr,
                        contentArr: contentArr,
                        timeArr : timeArr,
                        hrefArr : hrefArr,

                        imgsrc : '/images/avatars/'+req.params.username+'.gif'
                    });




                }




                });

});

module.exports = router;
