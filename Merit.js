/***************
[rewrite_local]
^https:\/\/api\.merach\.com\/user\/user-member url script-response-body Merit.js

[mitm]
hostname = api.merach.com
***************/

const expireData = '2026-09-30';

// 当前日期
var currentData = new Date();

// 和指定日期相差天数
function dateDiffInDays() {
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(expireData.getFullYear(), expireData.getMonth(), expireData.getDate());
    var utc2 = Date.UTC(currentData.getFullYear(), currentData.getMonth(), currentData.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

var replaceData = {
    "isExpire": 0,
    "vidType": 10,
    "days": dateDiffInDays(),
    "expireData": expireData
};

console.log($response.body.data.items);

$response.body.data.items.get(0).replace(replaceData);
var body = $response.body.data.replace(/isMember":\w+/g, 'isMember":1')
    .replace(/days":\w+/g, dateDiffInDays)
    .replace(/level":\w+/g, 'level": 5')
    .replace(/expireDate":\w+/g, `expireDate": ${expireData}`);

$done({body})