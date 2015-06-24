require.config(

    {
        paths: {
            "jquery": 'lib/jquery-1.11.3.min',
            "trim": "lib/trim",
            "check": "lib/check"
        }
    }
);

require(['jquery', 'trim', 'check'], function($, Trim, Check){
    var urlArr =  $(location).attr('href').split('/');
    var username = urlArr[3];
    var date = urlArr[4];
    var title = urlArr[5];

$('#likeTag').click(function(){
    //alert($(location).attr('href').split('/'));
    $.ajax(
        {
            //url: '/like',
             url : ('/'+username +'/'+date+'/'+title+'/like'),
            type : 'POST',
            cache : false,
            //data : {username : username, date : date, title : title},
            success : function(data, status){
                //alert(typeof(data));
                var likeCount = $('#likeCount');


                    if(data == 'false'){
                        alert('只有登录用户才可以点赞');
                    }
                else if(data == '1'){
                        //alert('返回值为1');
                        likeCount.text('('+(parseInt(likeCount.text().replace(/[(|)]/g, ''))+1)+')');
                    }else if(data == '-1'){
                        //alert('返回值为-1');
                        likeCount.text('('+(parseInt(likeCount.text().replace(/[(|)]/g, ''))-1)+')');
                    }

            }
        }
    );

    return false;
});






    $('#commentSubmit').click(function(){
        var commentArea = $('#commentArea');
        var commentContent = commentArea.val();
        $.ajax(
            {
                //url: '/like',
                url : '/'+username +'/'+date+'/'+title+'/comment',
                type : 'POST',
                cache : false,
                //data : {username : username, date : date, title : title},
                success : function(data, status){
                    alert(commentContent);
                    var commenterName = '测试评论用户名';
                    var commentTime = '测试评论时间';


                    if(data == 'false'){
                        alert('只有登录用户才可以评论');
                    }
                    else if(data == 'true'){
                       var tempCommentLi = $('#tempCommentLi');
                        if(tempCommentLi.length > 0){
                           tempCommentLi.remove();
                        }
                        var comment =$('<li class="commentLi">' +
                        '<a href=' +'/'+username+'/index' +' class="commenterName">'+ commenterName+'</a>'+
                        '<div class="commentContent">'+'<pre>'+commentContent+'</pre>'+'</div>'+
                        '<ul class="commentTag">'+
                        '<li class="commentTime"><span class="commentTime">'+commentTime+'</span></li>'+
                        '<li class="commentDelete">'+'<a href="" class="tag">删除</a></li>'+
                        '</ul>'+
                        '</li>'+
                        '<hr/>');
                        $('#commentUL').append(comment);
                    }

                }
            }
        );



        return false;
    });

});