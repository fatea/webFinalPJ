var db = require('../models/db');
var dateFormat = require('../routes/lib/dateFormat');

function Comment(commentData){
    this.username = commentData.username;
    this.title = commentData.title;
    this.content = commentData.content;
}

Comment.prototype.save = function(){
    var date = new Date();
    var comment = {
        username: this.username,
        content : this.content,
        time :dateFormat.getTime(date),
        realdate : date,
        realtime : date
    };
    var insertSQL = 'INSERT INTO COMMENT_LIST SET ?';

    db.query(insertSQL, comment, function(err, result){
        if (err){
            console.log(err);
        }
        else{
            console.log("INSERT Return ==> ");
            console.log(result);
        }
    });
};

Comment.delete = function(postid){
    var deleteSQL = 'DELETE FROM COMMENT_LIST WHERE postid = ?';
    db.query(deleteSQL, postid, function(err, result){
        if (err){
            console.log(err);
        }
        else{
            console.log("DELETE Return ==> ");
            console.log(result);
        }

    });
};










module.exports = Comment;