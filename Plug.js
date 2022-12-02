[sctipt]
#京东淘宝比价
^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig|basicConfig) url script-response-body https://service.2ti.st/QuanX/Script/jd_tb_price/main.js
^http://.+/amdc/mobileDispatch url script-request-body https://service.2ti.st/QuanX/Script/jd_tb_price/main.js
^https?://trade-acs\.m\.taobao\.com/gw/mtop\.taobao\.detail\.getdetail url script-response-body https://service.2ti.st/QuanX/Script/jd_tb_price/main.js

#Emby解锁高级模式
^https:\/\/mb3admin\.com\/admin\/service(\/registration\/validateDevice|\/appstore\/register|\/registration\/validate|\/registration\/getStatus|\/supporter\/retrievekey) url script-echo-response https://raw.githubusercontent.com/Gluvyi/QuanX/main/EmbyCrack.js

# 去微信公众号广告 (By Choler)
^https?:\/\/mp\.weixin\.qq\.com\/mp\/getappmsgad url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/Wechat.js

#知乎手机网页优化。(如使用 APP 请勿添加本规则)
// 先重写到桌面版
//^https:\/\/www\.zhihu\.com\/(question|topic) url request-header (\r\n)User-Agent:.+(\r\n) request-header $1User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36$2
// 再注入 CSS 进行优化
//^https:\/\/www\.zhihu\.com\/question url script-response-body https://raw.githubusercontent.com/elecV2/QuantumultX-Tools/master/betterweb/zhihux.user.js
//^https:\/\/www\.zhihu\.com\/topic url script-response-body https://raw.githubusercontent.com/elecV2/QuantumultX-Tools/master/betterweb/zhihux.user.js
// 去掉知乎跳转第三方网站的中间页面
//^https?:\/\/link\.zhihu\.com/\?target=(https?)%3A//(.*) url 307 $1://$2
// 不跳转应用商店
//^https:\/\/oia\.zhihu\.com\/answers\/([0-9]+)\?.* url 307 https://www.zhihu.com/answer/$1
//^https:\/\/oia\.zhihu\.com\/articles\/([0-9]+)\?.* url 307 https://zhuanlan.zhihu.com/p/$1

#CSDN优化
// 先重写到桌面版
^https:\/\/blog\.csdn\.net\/ url request-header (\r\n)User-Agent:.+(\r\n) request-header $1User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36$2
// 再注入 CSS 进行优化
^https:\/\/blog\.csdn\.net\/ url script-response-body https://raw.githubusercontent.com/elecV2/QuantumultX-Tools/master/betterweb/csdn.res.js
// 免跳转应用商店(也可以直接 filter 屏蔽 openinstall.io) *重写到桌面版后，这条规则基本就没什么用了*
^https:\/\/wvhzpj\.openinstall\.io\/ulink url script-echo-response https://raw.githubusercontent.com/elecV2/QuantumultX-Tools/master/betterweb/csdn.req.js

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

# fileball
^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$ url script-response-body https://raw.githubusercontent.com/Gluvyi/QuanX/main/FileBall.js

[MITM]
hostname = api.m.jd.com, trade-acs.m.taobao.com, oia.zhihu.com, link.zhihu.com, www.zhihu.com, blog.csdn.net, *.openinstall.io, mb3admin.com, api.weibo.cn,mapi.weibo.com,*.uve.weibo.com, pan.baidu.com, www.google.*, encrypted.google.*, buy.itunes.apple.com, biz.caiyunapp.com, mp.weixin.qq.com, testflight.apple.com, api.revenuecat.com
