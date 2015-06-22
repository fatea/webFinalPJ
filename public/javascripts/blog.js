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
$('#likeTag').click(function(){
    //alert($(location).attr('href').split('/'));
   var urlArr =  $(location).attr('href').split('/');
        var username = urlArr[3];
    var date = urlArr[4];
    var title = urlArr[5];
    $.ajax(
        {
            //url: '/like',
             url : '/'+username +'/'+date+'/'+title+'/like',
            type : 'POST',
            cache : false,
            //data : {username : username, date : date, title : title},
            success : function(data, status){
                //alert(typeof(data));
                if(data == false){
                alert('只有登录用户才可以点赞');
                }
                else{
                 var likeCount = $('#likeCount');
                    likeCount.text('('+(parseInt(likeCount.text().replace(/[(|)]/g, ''))+1)+')');
                }
            }
        }
    );



    return false;
});

});