require.config(

    {
        paths: {
            "jquery": 'lib/jquery-1.11.3.min',
            "trim": "lib/trim",
            "check": "lib/check"
        }
    }
);

require(['jquery', 'trim', 'check'], function($, Trim, Check) {
    var urlArr = $(location).attr('href').split('/');
    var username = urlArr[3];
    var date = urlArr[4];
    var title = urlArr[5];


    //点赞和取消点赞
    $('#likeTag').click(function () {
        //alert($(location).attr('href').split('/'));
        $.ajax(
            {
                //url: '/like',
                url: ('/' + username + '/' + date + '/' + title + '/like'),
                type: 'POST',
                cache: false,
                //data : {username : username, date : date, title : title},
                success: function (data, status) {
                    //alert(typeof(data));
                    var likeCount = $('#likeCount');


                    if (data == 'false') {
                        alert('只有登录用户才可以点赞');
                    }
                    else if (data == '1') {
                        //alert('返回值为1');
                        likeCount.text('(' + (parseInt(likeCount.text().replace(/[(|)]/g, '')) + 1) + ')');
                    } else if (data == '-1') {
                        //alert('返回值为-1');
                        likeCount.text('(' + (parseInt(likeCount.text().replace(/[(|)]/g, '')) - 1) + ')');
                    }

                }
            }
        );

        return false;
    });



    $('#commentTag').click(function(){
        var urlArr = $(location).attr('href').split('/');
        var username = urlArr[3];
        var date = urlArr[4];
        var title = urlArr[5];


        var href = $(this).attr('href');

        $.ajax(
            {
                url: ('/' + username + '/' + date + '/' + title + '/commenttag'),
                type: 'POST',
                cache: false,
                success: function (data, status) {
                    if(data.status == true){
                        var commentArea = $('#commentArea');
                        $('html,body').animate({scrollTop: commentArea.offset().top}, 0);
                        commentArea[0].focus();
                    }
                    else{
                        alert('只有登录用户才可以评论');
                    }

                }
            }
        );

        return false;
    });




//新增评论
    $('#commentSubmit').click(function () {
        var commentArea = $('#commentArea');
        var commentContent = commentArea.val();

        if (Trim.isEmpty(Trim.all(commentContent))) {
            alert('评论不得为空!');
        }
        else {
            $.ajax(
                {
                    //url: '/like',
                    url: ('/' + username + '/' + date + '/' + title + '/newcomment'),
                    type: 'POST',
                    cache: false,
                    data: {commentContent: commentContent},
                    success: function (data, status) {

                        if (data.status == false) {
                            alert('只有登录用户才可以评论');
                        }
                        else if (data.status == true) {
                            var commenterName = data.commenterName;
                            var commentTime = data.commentTime;
                            var commenterUsername = data.commenterUsername;
                            var tempCommentLi = $('#tempCommentLi');
                            if (tempCommentLi.length > 0) {
                                tempCommentLi.remove();
                            }

                            var comment = $('<li class="commentLi">' +
                            '<a href=' + '/' + commenterUsername + '/index' + ' class="commenterName">' + commenterName + '</a>' +
                            '<div class="commentContent">' + '<pre>' + commentContent + '</pre>' + '</div>' +
                            '<ul class="commentTag">' +
                            '<li class="commentTime"><span class="commentTime">' + commentTime + '</span></li>' +
                            '<li class="commentDelete">' + '<a href="" class="tag">删除</a></li>' +
                            '</ul>' +
                            '</li>' +
                            '<hr/>');
                            $('#commentUL').append(comment);
                            $('#commentArea').val('');
                        }

                    }
                }
            );

        }


        return false;
    });


//删除评论
    $('a.deleteComment').click(function (){


        if(confirm('确认删除?') == true){
        var commentid = parseInt($(this).attr('href'));


        var parentLiOfThisLink = $(this).parents('li.commentLi');
        var nextHr = parentLiOfThisLink.next();




        $.ajax(
            {
                url: ('/' + username + '/' + date + '/' + title + '/deletecomment'),
                type: 'POST',
                cache: false,
                data: {commentid: commentid},
                success : function(data, status){
                if(data.status == false){
                console.log(data);
                }else{
                    nextHr.remove();
                    parentLiOfThisLink.remove();
                }

                }
            }
        );

        }


        return false;

    });









});