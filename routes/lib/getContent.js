var async = require('async');
var Post = require('../../models/post');
var User = require('../../models/user');
var db = require('../../models/db');


function getIndex(username, renderCallback){
    async.parallel(
        {
            userData : function(callback){
                User.get(username, callback);
            },
            postData : function(callback){
                Post.getAllPost(username, callback);
            },

            categoryData : function(callback){
                Post.getAllCategory(username, callback);
            },

            tagData : function(callback){
                Post.getAllTag(username, callback);
            }

        },
        renderCallback
    );
}



function getBlog(username, date, title, guest, renderCallback){
    async.parallel(
        {
            userData : function(callback){
                User.get(username, callback);
            },
            postData : function(callback){
                Post.getOnePost(username, date, title, guest, callback);
            }
        },
        renderCallback
    );
}






module.exports.getIndex = getIndex;
module.exports.getBlog = getBlog;
