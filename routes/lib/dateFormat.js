
function getDate(date){
    var dateStr = ''+date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
    return dateStr;
}

function getTime(date){
    var minuteStr = date.getMinutes();
    if(parseInt(minuteStr)<= 9){
        minuteStr = '0'+ parseInt(minuteStr);
    }
    var timeStr = getDate(date) +' '+date.getHours()+':'+minuteStr;
    return timeStr;
}

module.exports.getDate = getDate;
module.exports.getTime = getTime;

