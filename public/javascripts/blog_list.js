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
$('#newPost').click(function(){
    var urlArr = $(location).attr('href').split('/');
    var username = urlArr[3];
    newPostURL='/'+username+'/edit/new';
    window.location = newPostURL;
    return false;
});


    //$("input[name='rd']:checked").val();
    $("input[name='scope']").change(function(){
        var scope = $("input[name='scope']:checked").val();
        if(scope == 'singleUser'){
            //$("#searchSingleUser").prop("checked", true);
            console.log(scope);
        $('#searchUsername').show();
        }else{
            //$("#searchAllUser").prop("checked", true);
            //console.log($("input[name='scope']:checked").val());
            $('#searchUsername').hide();
        }
    });

    $('#searchForm').submit(function(){

        var finalReturn = false;
        var searchUsername = $('#searchUsername').val();
        var searchKeyword = $('#searchInput').val();
        var scope = $("input[name='scope']:checked").val();


        if(scope == 'singleUser'){
            if((Check.regUsername(searchUsername) == true)){
                if(!(Trim.isEmpty(searchKeyword))){

                    finalReturn = true;
                }else{
                    alert('搜索关键词不得为空!');
                    finalReturn = false;
                }
            }else{
                alert('用户名用户名输入有误，请重新输入');
                finalReturn = false;
            }

        }else{

            if(!(Trim.isEmpty(searchKeyword))){

                finalReturn = true;
            }else{
                alert('搜索关键词不得为空!');
                finalReturn = false;
            }
        }


return finalReturn;
    });







    $('.postDelete').click(function(){
       var url = $(this).attr('href');
       var confirmResult =  confirm('确定要删除该博文吗?');
       if(confirmResult == true){
           $.ajax({
               url : url,
               cache:false,
               type : 'POST',
               success : function(data, status){

                   if(data.status == true){
                       alert('删除成功!');
                       window.location.reload();
                   }else{
                       alert('删除失败!');
                       window.location.reload();
                   }


               }
           });
       }
       return false;
   });


$('.categoryDelete').click(function(){
    if(confirm('确定要删除该分类吗?')== true){
        var urlArr = $(location).attr('href').split('/');
        var username = urlArr[3];
    var deleteCategoryURL = $(this).attr('href');
        $.ajax({
            url : deleteCategoryURL,
            cache : false,
            type : 'POST',
            success : function(data, status){
                if(data.status == true){
                    alert('删除成功!');
                    window.location = ('/'+username+'/blog_list/未分类博文');
                }else{
                    if(data.status == false){
                        alert('不能删除系统保留分类!');
                        window.location.reload();
                    }else{
                    alert('删除失败!');
                    window.location.reload();
                    }
                }
            }
        });
    }

    return false;
});


    function addCategory(notice){
        var flag = {bool : true};
        var category = add(notice, flag);

        if(category != false && typeof(category) != 'undefined' ){
            var editCategoryURL = $(this).attr('href');

            var urlArr = editCategoryURL.split('/');
            console.log(urlArr);
            var username = urlArr[1];
            $.ajax(
                {   url: editCategoryURL,
                    type: 'POST',
                    cache: false,
                    data :{category : category},
                    success : function(data, status){
                        console.log(data);
                        if(data.status == true){
                            alert('修改成功!');
                            console.log(username);
                            console.log(category);
                            window.location = ('/'+username+'/blog_list/'+category);
                        }else{
                            if(data.reason == false){
                                alert('禁止修改系统默认分类!');
                                window.location.reload();
                            }else{
                                alert('修改失败!');
                                window.location.reload();
                            }

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
        $('.realCategoryTag').each(function(){
            originalCategoryArr.push($(this).text());
        });
        originalCategoryArr.push('全部博文');


        console.log(originalCategoryArr);

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


    /*var newCategory = $('#newCategory');
    newCategory.click(addCategory);*/






    $('.categoryEdit').click(addCategory);
});