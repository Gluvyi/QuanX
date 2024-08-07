/***************
 [rewrite_local]
 ^https:\/\/api\.merach\.com\/user\/user-member url script-response-body Merit.js

 [mitm]
 hostname = api.merach.com
 ***************/

const expireData = '2026-09-30';



// 和指定日期相差天数
function dateDiffInDays() {
    // 当前日期
    var currentData = new Date();
    // 设置目标日期为2026-09-30
    const targetDate = new Date(expireData);
    const timeDiff = targetDate.getTime() - currentData.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

var replaceData = {
    "isExpire": 0,
    "vidType": 10,
    "days": dateDiffInDays(),
    "expireData": expireData
};

var responseJson = JSON.parse($response.body);
responseJson.data.isMember = 1;
responseJson.data.days = dateDiffInDays;
responseJson.data.level = 5;
responseJson.data.expireDate = expireData;
responseJson.data.items = [
    {
        "isExpire": 0,
        "vipType": 10,
        "days": dateDiffInDays,
        "expireDate": expireData
    },
    {
        "isExpire": 0,
        "vipType": 20,
        "days": dateDiffInDays,
        "expireDate": expireData
    },
    {
        "isExpire": 0,
        "vipType": 30,
        "days": dateDiffInDays,
        "expireDate": expireData
    }
];

// $response.body.data.items.get(0).replace(replaceData);
// var body = $response.body.data.replace(/isMember":\w+/g, 'isMember":1')
//     .replace(/days":\w+/g, dateDiffInDays)
//     .replace(/level":\w+/g, 'level": 5')
//     .replace(/expireDate":\w+/g, `expireDate": ${expireData}`);

$done({body: JSON.stringify(responseJson)})
