var express = require('express');
var router = express.Router({ mergeParams: true});
var clone = require('clone');
var async = require('async');
var getContent = require('./lib/getContent');
var markdown = require('markdown');

router.get('/', function(req, res, next) {
    getContent.getIndex(req.params.username,

        function(err, results){
            console.log('here is the req.params: '+req.params.category);


            var userData = results.userData[0];
            var postData = results.postData;
            var categoryData = results.categoryData;
            var tagData = results.tagData;



            var fullUrl =  req.protocol + '://' + req.get('host') + req.originalUrl;

            var selectedCategory = req.params.category;

            var hasThisCategory = false;
            if(results.postData == false){

                if(results.userData != false){
                    console.log('没有博文但是有分类');



                    if(typeof(categoryData.length) != 'undefined') {

                        if(selectedCategory == '全部博文'){
                            hasThisCategory = true;
                        }else{
                            for (var k = 0; k < categoryData.length; k++) {
                                if (categoryData[k].category == selectedCategory) {
                                    hasThisCategory = true;
                                    break;
                                }
                            }
                        }

                    }



                    if(hasThisCategory) {
                        res.render('blog_list', {
                            hasPost : (typeof(postData)!='undefined'&&postData.length > 0),
                            mainTitle : userData.name+'的博客',
                            subTitle : ('http://localhost:3000/'+userData.username+'/blog_list/'),
                            name : userData.name,
                            guest : (req.params.username != req.session.username),
                            category : categoryData,
                            selectedCategory : selectedCategory,
                            username : userData.username,
                            imgsrc : '/images/avatars/'+userData.username+'.png'
                        });
                    }  else{
                        next();
                    }



                }
                else{next();}

            }
            else{
                console.log('进入到了else这步');

                if(typeof(categoryData.length) != 'undefined') {
                    if(selectedCategory == '全部博文'){
                        hasThisCategory = true;
                    }else{
                        for (var l = 0; l < categoryData.length; l++) {
                            if (categoryData[l].category == selectedCategory) {
                                hasThisCategory = true;
                                break;
                            }
                        }
                    }

                }
                console.log('有没有这个分类? '+ hasThisCategory);



                var tagsArr =[];
                var categoryArr = [];
                var titleArr = [];
                var contentArr = [];
                var timeArr = [];
                var hrefArr = [];
                var commentCountArr = [];
                var pageviewArr = [];
                var dateArr = [];
                var i;

                for(i= 0; i < postData.length;i++){

                    categoryArr[i] = postData[i].category;
                    if(postData[i].tag != ''){
                        try{
                            if(postData[i].tag === null){
                                tagsArr[i] = null;
                            }
                            else{
                                tagsArr[i] = postData[i].tag.split(',');}
                        }catch(ex){
                            tagsArr[i] = [postData[i].tag];
                        }
                    }
                    else{
                        tagsArr[i] = null;
                    }

                    commentCountArr[i] = postData[i].commentCount;


                    pageviewArr[i] = postData[i].pageview;

                    titleArr[i] = postData[i].title;
                    contentArr[i] = markdown.parse(postData[i].content.substr(0,200)) ;
                    timeArr[i] = postData[i].time;
                    dateArr[i]= postData[i].date;
                    hrefArr[i] = ('/'+postData[i].username+'/'+postData[i].date+'/'+postData[i].title);
                }

                console.log('当前分类的博文有: '+titleArr);




                if(selectedCategory != '全部博文'){
                    titleArr = [];
                    dateArr = [];
                    hrefArr = [];
                    var p = 0;
                    for(var u = 0; u < postData.length; u++){
                    if(postData[u].category == selectedCategory){
                        titleArr[p] = postData[u].title;
                        dateArr[p] = postData[u].date;
                        hrefArr[p] = ('/'+postData[u].username+'/'+postData[u].date+'/'+postData[u].title);
                        p++;
                    }
                    }
                }




                var hasPostUnderThisCategory = (hasThisCategory == true && selectedCategory != '全部博文' && titleArr.length > 0);

                if(hasThisCategory){
                    res.render('blog_list', {
                        //postData : postData,
                        hasPost : (typeof(postData)!='undefined'&&postData.length > 0),
                        hasPostUnderThisCategory: hasPostUnderThisCategory,
                        categoryLength : postData.length,
                        postDataLength : titleArr.length,
                        name : userData.name,
                        mainTitle : userData.name +'的博客',
                        subTitle : ('http://localhost:3000/'+userData.username+'/blog_list/'),
                        guest : (req.params.username != req.session.username),
                        username: userData.username,
                        commentCount : commentCountArr,
                        pageviewArr: pageviewArr,
                        category : categoryData,
                        tagsArr : tagsArr,
                        categoryArr : categoryArr,
                        titleArr : titleArr,
                        contentArr: contentArr,
                        timeArr : timeArr,
                        hrefArr : hrefArr,
                        dateArr :dateArr,
                        selectedCategory : selectedCategory,
                        imgsrc : '/images/avatars/'+req.params.username+'.gif'
                    });
                }else{
                    next();
                }





            }




        });

});

module.exports = router;
