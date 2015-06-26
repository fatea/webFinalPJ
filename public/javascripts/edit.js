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

function validateForm() {
    var boolResult = true;
   var titleArea =  $('#titleArea');
    var editArea = $('#editArea');
    var tagArea = $('#tagArea');
    var originalTag = tagArea.val();




    if(Trim.isEmpty(Trim.all(titleArea.val()))){
        boolResult = false;
        alert('标题不得为空');
    }
    if(Trim.isEmpty(Trim.all(editArea.val()))){
        boolResult = false;
        alert('内容不得为空');
    }

    var tagPunctuationAlertFlag = false;

    for(var i = 0; i < originalTag.length; i++){
        if((originalTag.charAt(i) == ',') || (originalTag.charAt(i) == '，')|| (originalTag.charAt(i)==' ')){
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
                                window.location= ('/'+username+'/'+date+'/'+titleArea);

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
    if(category != false){
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