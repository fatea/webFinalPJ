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
function validateForm() {
    var boolResult = true;
   var titleArea =  $('#titleArea').val();
    var editArea = $('#editArea').val();
    if(Trim.isEmpty(Trim.all(titleArea))){
        boolResult = false;
        alert('标题不得为空');
    }
    if(Trim.isEmpty(Trim.all(editArea))){
        boolResult = false;
        alert('内容不得为空');
    }

    return boolResult;
}

    $('#editForm').submit(validateForm);



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
            {   url: ('/' + username + '/edit/'+ date + '/' + title + '/newcategory'),
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