var Trim = {};

Trim.all = function(str) {
	str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
	str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
	str = str.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
	str = str.replace(/ /ig, ''); //去掉
	str = str.replace(/^[\s　]+|[\s　]+$/g, ""); //去掉全角半角空格
	str = str.replace(/[\r\n]/g, ""); //去掉回车换行

	return str;
};

Trim.normal = function(str){
return str.replace(/(^\s*)|(\s*$)/g, "");  // 去掉左右空格
};
Trim.left = function(str){
return str.replace(/(^\s*)/g, ""); // 去掉左空格
};
Trim.right = function(str){
return str.replace(/(\s*$)/g, ""); // 去掉右空格
};

Trim.isEmpty = function(val){
	
function trim(text)
{
  if (typeof(text) == "string")
  {
    return text.replace(/^\s*|\s*$/g, "");
  }
  else
  {
    return text;
  }
}


  switch (typeof(val))
  {
    case 'string':
      return trim(val).length == 0 ? true : false;
      break;
    case 'number':
      return val == 0;
      break;
    case 'object':
      return val == null;
      break;
    case 'array':
      return val.length == 0;
      break;
    default:
      return true;
  }
};

