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
    $('#editForm').submit(function(){return false;});

    $('#titleArea').keydown(function(event){
        var realEvent = event||window.event;
        if(realEvent.keyCode==13)
        {return false;}
    });
    $('#tagArea').keydown(function(event){
        var realEvent = event||window.event;
        if(realEvent.keyCode==13)
        {return false;}
    });



    $('#titleArea').blur(
        function(){
            var title = $(this).val();
            var realdate = new Date();
            var date = ''+realdate.getFullYear()+'-'+realdate.getMonth()+'-'+realdate.getDate();
            var urlArr = $(location).attr('href').split('/');
            var username = urlArr[3];
            $.ajax({
                url: ('/' + username + '/edit/checktitle'),
                type: 'POST',
                cache: false,
                data : {username : username,
                    title : title,
                    date : date
                },
                success : function(data, status){
                    if(data.status == false){
                        alert('同一天内的博文标题不得相同');
                    }
            }}
            );
        }
    );


    function TextValidate(){
        var code;
        var character;
        var err_msg = "Text can not contain SPACES or any of these special characters other than underscore (_) and hyphen (-).";
        if (document.all) //判断是否是IE浏览器
        {
            code = window.event.keyCode;
        }
        else
        {
            code = arguments.callee.caller.arguments[0].which;
        }
        var character = String.fromCharCode(code);

        var txt=new RegExp("[ ,\\`,\\~,\\!,\\@,\#,\\$,\\%,\\^,\\+,\\*,\\&,\\\\,\\/,\\?,\\|,\\:,\\.,\\<,\\>,\\{,\\},\\(,\\),\\',\\;,\\=,\"]");
        //特殊字符正则表达式
        if (txt.test(character))
        {
            alert("标题不可以包含空格或任何以下特殊字符:\n , ` ~ ! @ # $ % ^ + & * \\ / ? | : . < > {} () [] \" ");
            if (document.all)
            {
                window.event.returnValue = false;
            }
            else
            {
                arguments.callee.caller.arguments[0].preventDefault();
            }
        }
    }

    $('#titleArea').keypress(TextValidate);



function validateForm() {
    var boolResult = true;
   var titleArea =  $('#titleArea');
    var editArea = $('#editArea');
    var tagArea = $('#tagArea');
    var originalTag = tagArea.val();
    var originalTitle = titleArea.val();



    if(Trim.isEmpty(Trim.all(titleArea.val()))){
        boolResult = false;
        alert('标题不得为空');
    }
    if(Trim.isEmpty(Trim.all(editArea.val()))){
        boolResult = false;
        alert('内容不得为空');
    }

    var titlePunctuationAlertFlag = false;


    for(var i = 0; i < originalTag.length; i++){
        if(originalTitle.charAt(i) == '/'){
            if(titlePunctuationAlertFlag ==  false){
                boolResult = false;
                alert('标题不得含有\"/\"符号');

                titlePunctuationAlertFlag = true;
            }
        }
    }






    var tagPunctuationAlertFlag = false;

    for(var i = 0; i < originalTag.length; i++){
        if((originalTag.charAt(i) == ',') || (originalTag.charAt(i) == '，')|| (originalTag.charAt(i)=='　')){
            if(tagPunctuationAlertFlag ==  false){
                boolResult = false;
                alert('标签不得包含半角、全角逗号或全角空格');
                tagPunctuationAlertFlag = true;
            }
        }
    }

    if(tagPunctuationAlertFlag == false){
        //调整tag字符串以便post.save
        var tag = originalTag.replace(/\s+/g, ' ');
    }


    if(boolResult == true){
        var originalTitle = titleArea.val();
        var title = Trim.normal(originalTitle);
        titleArea.val(title);
        tagArea.val(tag);

    }

    return boolResult;
}



    $('#editSubmit').click(
        function(){
            if(validateForm() == true){
                var urlArr = $(location).attr('href').split('/');
                var username = urlArr[3];
                var date = urlArr[5];



                var titleArea = $('#titleArea').val();
                var editArea = $('#editArea').val();
                var tagArea = $('#tagArea').val();
                var categorySelect = $('#categorySelect').val();
                var action = date;

                $.ajax(
                    {   url: $('#editForm').attr('action'),
                        type: 'POST',
                        cache: false,
                        data : {titleArea: titleArea,
                            editArea : editArea,
                            tagArea : tagArea,
                            categorySelect : categorySelect
                        },
                        success : function(data, status){
                            if(data.status == true){
                                alert('发表成功!');
                                if(action == 'new'){
                                    window.location = data.returnedPostURL;
                                }else{
                                window.location= ('/'+username+'/'+date+'/'+titleArea);}

                            }
                            if(data.status == false){
                                alert('发表失败!');
                                window.location.reload();
                            }
                        }
                    }
                );
            }
        }
    );



function addCategory(notice){
var flag = {bool : true};
    var category = add(notice, flag);
    if(category != false && typeof(category) != 'undefined'){
        var urlArr = $(location).attr('href').split('/');
        var username = urlArr[3];
        var date = urlArr[5];
        var title = urlArr[6];
        console.log(urlArr);



        $.ajax(
            {   url: ('/' + username + '/edit/newcategory'),
                type: 'POST',
                cache: false,
                data : {category : category},
                success : function(data, status){
                    if(data.status = true){
                        alert('增加分类成功!');
                    var option =$("<option value="+category+">"+category+"</option>");
                    $('#categorySelect').append(option);

                    }
                }
            }
        );





    }

    return false;
}

function add(notice, flag){
    var newStr = '新分类名称:';
    var retypeStr = '名称不符合规范, 请重新输入:';
    var changeStr = '与已有分类重复, 请重新输入:';


    var originalCategoryArr = [];
    $('#categorySelect option').each(function(){
        originalCategoryArr.push($(this).val());
    });

    if ((notice != newStr) && (notice != retypeStr)){
        notice = newStr;
    }

    var category = prompt(notice);

    if(category === null){
        return false;
    }

    else{
    if(Check.regName(category) == false){
        flag.bool = false;
        addCategory(retypeStr);
    }

    else if(Check.isRepeat(originalCategoryArr, category)){
        flag.bool = false;
        addCategory(changeStr);
    }
    else
    flag.bool = true;

    if(flag.bool == true){
        return category;
    }
    }


}


var newCategory = $('#newCategory');
newCategory.click(addCategory);



});