
var boolResult = true;
function validateForm() {
    return boolResult;
}
function addCategory(notice){
var flag = {bool : true};
    var category = add(notice, flag);
    if(category != false){
        var option =$("<option value="+category+">"+category+"</option>");
        $('#categorySelect').append(option);


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