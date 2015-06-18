//var express = require('express');
var Check = {};
Check.regUsername = function(str){
    var regUsername = new RegExp("^[a-zA-Z0-9_]{2,14}$");
    return (regUsername.test(str));
};


Check.regPassword = function(str){
    var regPassword = new RegExp("^(?=.*[a-zA-Z_])[a-zA-Z0-9_]{6,40}$");
   return (regPassword.test(str));
};

Check.regName = function(str){
    var regName = new RegExp("^[\u4e00-\u9fa5_a-zA-Z0-9]{1,20}$");
    return (regName.test(str));
};

Check.isRepeat = function(strOriginal, strToCheck){
    var strArr = strOriginal;

    if(typeof(strOriginal) == 'string'){
    strArr = (Trim.normal(strOriginal)).split(' ');}

    var result = false;
    for(var i = 0; i < strArr.length; i++){
        if(strToCheck == strArr[i]){
            result = true;
        }
    }
    return result;
};



Check.isEmpty = function(obj_id){
   var val = $('#'+obj_id).val();
   return Trim.isEmpty(val);
};


