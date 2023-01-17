[sctipt]
#Emby解锁高级模式
^https:\/\/mb3admin\.com\/admin\/service(\/registration\/validateDevice|\/appstore\/register|\/registration\/validate|\/registration\/getStatus|\/supporter\/retrievekey) url script-echo-response https://raw.githubusercontent.com/Gluvyi/QuanX/main/EmbyCrack.js

# 去微信公众号广告 (By Choler)
^https?:\/\/mp\.weixin\.qq\.com\/mp\/getappmsgad url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/Wechat.js

#微博去广告
^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js
^https?://m?api\.weibo\.c(n|om)/2/(statuses/(unread|extend|positives/get|(friends|video)(/|_)(mix)?timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|profile/statuses|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page|!/(photos/pic_recommend_status|live/media_homelist)|video/tiny_stream_video_list|photo/info|remind/unread_count) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js

#百度网盘开启蓝光和倍速
https:\/\/pan\.baidu\.com\/rest\/2\.0\/membership\/user url script-response-body https://raw.githubusercontent.com/Yu1zzZ/QuanX/main/BaiduCloud.js

#谷歌拼接
// http:\/\/www\.google\..* url script-response-body https://raw.githubusercontent.com/Yu1zzZ/QuanX/main/Google.js
//https:\/\/www\.google\..* url script-response-body https://raw.githubusercontent.com/Yu1zzZ/QuanX/main/Google.js
//https:\/\/encrypted\.google\..* url script-response-body https://raw.githubusercontent.com/Yu1zzZ/QuanX/main/Google.js

#彩云破解
彩云天气SVIP = type=http-response,requires-body=1,max-size=0,pattern=https?:\/\/biz\.caiyunapp\.com\/(membership_rights|v2\/user),script-path=https://raw.githubusercontent.com/Tartarus2014/Script/master/CaiYun.js

#Picsew破解
^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt url script-response-body https://raw.githubusercontent.com/Yu1zzZ/QuanX/main/Picsew.js

# 该订阅仅适用于QuantumultX, 用于更新TestFlight App时, 提示"APP不可用"问题. 解除区域限制.
^https?:\/\/testflight\.apple\.com\/v\d\/accounts\/.+?\/install$ url script-request-body https://gist.githubusercontent.com/NobyDa/9be418b93afc5e9c8a8f4d28ae403cf2/raw/TF_Download.js

# fileball  1.2.1
# ^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$ url script-response-body https://raw.githubusercontent.com/Gluvyi/QuanX/main/FileBall.js

# file 1.2.7
# ^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$ url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/fileball.js

# ^https:\/\/app-measurement\.com\/config\/app\/1?(.*?)*$ url reject

projects = type=http-response,pattern=^https://firebaseremoteconfig.googleapis.com/v1/projects/filebox-ac299/.*,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Alex0510/Eric/master/surge/Script/projects.js
fileball = type=http-response,pattern=^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/fileball.js
[MITM]
hostname = *.openinstall.io, mb3admin.com, api.weibo.cn,mapi.weibo.com,*.uve.weibo.com, pan.baidu.com, www.google.*, encrypted.google.*, buy.itunes.apple.com, biz.caiyunapp.com, mp.weixin.qq.com, testflight.apple.com, 

# api.revenuecat.com, app-measurement.com, *.googleapis.com
