





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

    $('#originalPassword').blur(
        function(){
            var originalPassword = $(this).val();
            var urlArr = $(location).attr('href').split('/');
            console.log(urlArr);
            var username = urlArr[3];
            $.ajax({
                    url: ('/' + username + '/checkpassword'),
                    type: 'POST',
                    cache: false,
                    data : {username : username,
                        password:originalPassword
                    },
                    success : function(data, status){
                        if(data.status == false){
                            alert('原密码不正确');
                        }
                    }}
            );
        }
    );


    $('#newPassword').blur(
        function(){
            var newPassword = $(this).val();
            var urlArr = $(location).attr('href').split('/');
            var username = urlArr[3];
            if($(this).val() == $('#originalPassword').val()){
                alert('新密码不得与原密码相同');
            }

        }
    );



    $('#profileForm').submit(
        function(){
            var finalResult = true;
            var newPassword = $('#newPassword').val();
            var originalPassword = $('#originalPassword').val();
            //var urlArr = $(location).attr('href').split('/');
            //var username = urlArr[3];
            if(newPassword == originalPassword){
                finalResult = false;
                alert('新密码不得与原密码相同');
            }
            if((Trim.isEmpty(newPassword)== true)||(Trim.isEmpty(originalPassword) == true)){
                finalResult = false;
                alert('密码不得为空');
            }else{
                if(Check.regPassword(newPassword) == false){
                    finalResult = false;
                    alert('密码不符合规范,请重新输入');
                }
            }
            return finalResult;

        }
    );

});
















