/*
------------------------------------------
@Author: Leiyiyan
@Date: 2025-04-14
@Description: 龙湖天街小程序签到、抽奖
------------------------------------------
获取 Cookie：打开龙湖天街小程序，进入 我的 - 签到赚珑珠 - 任务赚奖励 - 马上签到。

图标：https://raw.githubusercontent.com/leiyiyan/resource/main/icons/lhtj.png
================ Loon 配置 ================
[MITM]
hostname = gw2c-hw-open.longfor.com

cron "3 0 * * *" script-path=https://raw.githubusercontent.com/zhenyuefu/scripts/main/lhtj.js, tag=龙湖天街签到

http-request ^https?:\/\/gw2c\-hw\-open\.longfor\.com\/lmarketing\-task\-api\-mvc\-prod\/openapi\/task\/v1\/signature\/clock script-path=https://raw.githubusercontent.com/zhenyuefu/scripts/main/lhtj.js, timeout=60, tag=龙湖天街获取Cookie

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/
const $ = new Env("龙湖天街");
const ckName = "lhtj_data";
const userCookie =
  $.toObj($.isNode() ? process.env[ckName] : $.getdata(ckName)) || [];
//notify
const notify = $.isNode() ? require("./sendNotify") : "";
$.notifyMsg = [];
//debug
$.is_debug =
  ($.isNode() ? process.env.IS_DEDUG : $.getdata("is_debug")) || "false";
$.doFlag = { true: "✅", false: "⛔️" };
//------------------------------------------
const baseUrl = "";
const _headers = {};

const LOTTERY_CONFIG = {
  componentNo: "CY11Z39U03D7BWLF",
  activityNo: "AP253103P1Z9CTCG",
  componentNo_APP: "CO11336N1003YDLZ",
  activityNo_APP: "AP25S103D1UP0D95",
  signEndpoint:
    "https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/sign",
  clickEndpoint:
    "https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/click",
};

const userAgent = {
  miniProgram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.63(0x18003f2e) NetType/4G Language/zh_CN miniProgram/wx50282644351869da",
  app: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.17.4_202509111135_Default_3.2.4.9",
};

const SIGN_CONFIG = {
  activityNo: "11111111111686241863606037740000",
  activityNo_APP: "11111111111736501868255956070000",
};

const CHANNEL_CONFIGS = [
  {
    key: "miniProgram",
    label: "小程序",
    signActivityNo: SIGN_CONFIG.activityNo,
    lotteryActivityNo: LOTTERY_CONFIG.activityNo,
    lotteryComponentNo: LOTTERY_CONFIG.componentNo,
  },
  {
    key: "app",
    label: "App",
    signActivityNo: SIGN_CONFIG.activityNo_APP,
    lotteryActivityNo: LOTTERY_CONFIG.activityNo_APP,
    lotteryComponentNo: LOTTERY_CONFIG.componentNo_APP,
  },
];

//------------------------------------------
const fetch = async (o) => {
  try {
    if (typeof o === "string") o = { url: o };
    if (o?.url?.startsWith("/") || o?.url?.startsWith(":"))
      o.url = baseUrl + o.url;
    const res = await Request({
      ...o,
      headers: o.headers || _headers,
      url: o.url,
    });
    debug(
      res,
      o?.url?.replace(/\/+$/, "").substring(o?.url?.lastIndexOf("/") + 1),
    );
    if (res?.message.match(/登录已过期|用户未登录/))
      throw new Error(`用户需要去登录`);
    return res;
  } catch (e) {
    $.ckStatus = false;
    $.log(`⛔️ 请求发起失败！${e}`);
  }
};
async function main() {
  //check accounts
  if (!userCookie?.length) throw new Error("找不到可用的帐户");
  $.log(`⚙️ 发现 ${userCookie?.length ?? 0} 个帐户\n`);
  const index = 0;
  //doTask of userList
  for (const user of userCookie) {
    //init of user
    $.log(`🚀 开始任务`);
    $.notifyMsg = [];
    $.ckStatus = true;
    $.title = "";
    $.avatar = "";

    let totalReward = 0;
    for (const channel of CHANNEL_CONFIGS) {
      if (!$.ckStatus) break;
      const rewardNum = await signin(user, channel);
      totalReward += Number.isFinite(Number(rewardNum)) ? Number(rewardNum) : 0;
      if (!$.ckStatus) break;
      const { shouldDraw } = await lotterySignin(user, channel);
      if ($.ckStatus && shouldDraw) {
        await $.wait(1000);
        await lotteryClock(user, channel);
      }
    }

    if ($.ckStatus) {
      //查询用户信息
      const { nick_name, growth_value, level, head_portrait } =
        await getUserInfo(user);
      //查询珑珠
      const { balance } = await getBalance(user);
      $.avatar = head_portrait;
      $.title = `本次运行共获得${totalReward}积分`;
      DoubleLog(
        `当前用户:${nick_name}\n成长值: ${growth_value}  等级: V${level}  珑珠: ${balance}`,
      );
    } else {
      DoubleLog(`⛔️ 「${user.userName ?? `账号${index}`}」check ck error!`);
    }
    //notify
    await sendMsg($.notifyMsg.join("\n"));
  }
}

//签到
async function signin(user, channel = CHANNEL_CONFIGS[0]) {
  try {
    const userAgentKey = channel?.key || "miniProgram";
    const activityNo = channel?.signActivityNo || SIGN_CONFIG.activityNo;
    const labelPrefix = channel?.label ? `[${channel.label}] ` : "";
    const opts = {
      url: "https://gw2c-hw-open.longfor.com/lmarketing-task-api-mvc-prod/openapi/task/v1/signature/clock",
      headers: {
        cookie: user.cookie,
        "user-agent": userAgent[userAgentKey] || userAgent.miniProgram,
        token: user.token,
        "x-lf-dxrisk-token": user["x-lf-dxrisk-token"],
        "x-gaia-api-key": "c06753f1-3e68-437d-b592-b94656ea5517",
        "x-lf-bu-code": user["x-lf-bu-code"],
        "x-lf-channel": user["x-lf-channel"],
        origin: "https://longzhu.longfor.com",
        referer: "https://longzhu.longfor.com/",
        "x-lf-dxrisk-source": user["x-lf-dxrisk-source"],
        "x-lf-usertoken": user["x-lf-usertoken"],
      },
      type: "post",
      dataType: "json",
      body: {
        activity_no: activityNo,
      },
    };
    const res = await fetch(opts);
    const reward_num =
      res?.data?.is_popup === 1 ? res?.data?.reward_info[0]?.reward_num : 0;
    $.log(
      `${$.doFlag[res?.data?.is_popup === 1]} ${labelPrefix}${
        res?.data?.is_popup === 1
          ? `每日签到: 成功, 获得${res?.data?.reward_info[0]?.reward_num}分`
          : "每日签到: 今日已签到"
      }\n`,
    );
    return reward_num;
  } catch (e) {
    $.log(`⛔️ 每日签到失败！${e}\n`);
    return 0;
  }
}

function buildLotteryHeaders(user, channel = CHANNEL_CONFIGS[0]) {
  const userAgentKey = channel?.key || "miniProgram";
  return {
    cookie: user.cookie,
    "user-agent": userAgent[userAgentKey] || userAgent.miniProgram,
    authtoken: user.token,
    "x-lf-dxrisk-token": user["x-lf-dxrisk-token"],
    bucode: user["x-lf-bu-code"],
    channel: user["x-lf-channel"],
    origin: "https://llt.longfor.com",
    referer: "https://llt.longfor.com/",
    "x-lf-dxrisk-source": user["x-lf-dxrisk-source"],
    "x-lf-usertoken": user["x-lf-usertoken"],
    "x-gaia-api-key": "2f9e3889-91d9-4684-8ff5-24d881438eaf",
  };
}
// 抽奖签到
async function lotterySignin(user, channel = CHANNEL_CONFIGS[0]) {
  try {
    const labelPrefix = channel?.label ? `[${channel.label}] ` : "";
    const opts = {
      url: LOTTERY_CONFIG.signEndpoint,
      headers: buildLotteryHeaders(user, channel),
      type: "post",
      dataType: "json",
      body: {
        component_no: channel?.lotteryComponentNo || LOTTERY_CONFIG.componentNo,
        activity_no: channel?.lotteryActivityNo || LOTTERY_CONFIG.activityNo,
      },
    };
    const res = await fetch(opts);
    const code = res?.code || "";
    let shouldDraw = false;
    let message = res?.message || "未知返回";
    if (code === "0000") {
      const ticket = res?.data?.ticket_times ?? "";
      message = ticket
        ? `${labelPrefix}抽奖签到: 成功, 获得${ticket}次抽奖机会`
        : `${labelPrefix}抽奖签到: 成功`;
      shouldDraw = true;
    } else if (code === "863036") {
      message = `${labelPrefix}抽奖签到: 今日已签到`;
      shouldDraw = true;
    } else {
      message = `${labelPrefix}抽奖签到: ${message}`;
    }
    $.log(`${$.doFlag[code === "0000" || code === "863036"]} ${message}\n`);
    $.notifyMsg.push(message);
    return { shouldDraw };
  } catch (e) {
    $.notifyMsg.push(`抽奖签到失败: ${e.message}`);
    $.log(`⛔️ 抽奖签到失败！${e}\n`);
    return { shouldDraw: false };
  }
}
// 抽奖
async function lotteryClock(user, channel = CHANNEL_CONFIGS[0]) {
  try {
    const labelPrefix = channel?.label ? `[${channel.label}] ` : "";
    const opts = {
      url: LOTTERY_CONFIG.clickEndpoint,
      headers: buildLotteryHeaders(user, channel),
      type: "post",
      dataType: "json",
      body: {
        component_no: channel?.lotteryComponentNo || LOTTERY_CONFIG.componentNo,
        activity_no: channel?.lotteryActivityNo || LOTTERY_CONFIG.activityNo,
        batch_no: "",
      },
    };
    const res = await fetch(opts);
    const code = res?.code || "";
    let message = res?.message || "未知返回";
    if (code === "0000") {
      const prize =
        res?.data?.prize_name ||
        res?.data?.prizeName ||
        res?.data?.desc ||
        "未知奖品";
      message = `${labelPrefix}抽奖成功, 获得${prize}`;
    } else if (code === "863033") {
      message = `${labelPrefix}抽奖: 今日已抽奖`;
    } else {
      message = `${labelPrefix}抽奖: ${message}`;
    }
    $.log(`${$.doFlag[code === "0000"]} ${message}\n`);
    $.notifyMsg.push(message);
  } catch (e) {
    $.notifyMsg.push(`抽奖失败: ${e.message}`);
    $.log(`⛔️ 抽奖失败！${e}\n`);
  }
}
//查询用户信息
async function getUserInfo(user) {
  try {
    const opts = {
      url: "https://longzhu-api.longfor.com/lmember-member-open-api-prod/api/member/v1/mine-info",
      headers: {
        "User-Agent": userAgent.miniProgram,
        Referer:
          "https://servicewechat.com/wx50282644351869da/424/page-frame.html",
        token: user.token,
        "X-Gaia-Api-Key": "d1eb973c-64ec-4dbe-b23b-22c8117c4e8e",
      },
      type: "post",
      dataType: "json",
      body: {
        channel: user["x-lf-channel"],
        bu_code: user["x-lf-bu-code"],
        token: user.token,
      },
    };
    const res = await fetch(opts);
    const growth_value = res?.data?.growth_value || 0;
    $.log(
      `🎉 ${res?.code === "0000" ? `您当前成长值: ${growth_value}` : res?.message}\n`,
    );
    return res?.data;
  } catch (e) {
    $.log(`⛔️ 查询用户信息失败！${e}\n`);
  }
}
//查询珑珠
async function getBalance(user) {
  try {
    const opts = {
      url: "https://longzhu-api.longfor.com/lmember-member-open-api-prod/api/member/v1/balance",
      headers: {
        "User-Agent": userAgent.miniProgram,
        Referer:
          "https://servicewechat.com/wx50282644351869da/424/page-frame.html",
        token: user.token,
        "X-Gaia-Api-Key": "d1eb973c-64ec-4dbe-b23b-22c8117c4e8e",
      },
      type: "post",
      dataType: "json",
      body: {
        channel: user["x-lf-channel"],
        bu_code: user["x-lf-bu-code"],
        token: user.token,
      },
    };
    const res = await fetch(opts);
    const balance = res?.data.balance || 0;
    const expiring_lz = res?.data.expiring_lz || 0;
    $.log(
      `🎉 ${res?.code === "0000" ? `您当前珑珠: ${balance}, 即将过期: ${expiring_lz}` : res?.message}\n`,
    );
    return res?.data;
  } catch (e) {
    $.log(`⛔️ 查询用户珑珠失败！${e}\n`);
  }
}
//获取Cookie
async function getCookie() {
  if ($request && $request.method === "OPTIONS") return;

  const header = ObjectKeys2LowerCase($request.headers);
  if (!header.cookie) throw new Error("获取Cookie错误，值为空");

  const newData = {
    userName: "微信用户",
    "x-lf-dxrisk-token": header["x-lf-dxrisk-token"],
    "x-lf-channel": header["x-lf-channel"],
    token: header.token,
    "x-lf-usertoken": header["x-lf-usertoken"],
    cookie: header.cookie,
    "x-lf-bu-code": header["x-lf-bu-code"],
    "x-lf-dxrisk-source": header["x-lf-dxrisk-source"],
  };
  const index = userCookie.findIndex((e) => e.token == newData.token);
  index !== -1 ? (userCookie[index] = newData) : userCookie.push(newData);
  $.setjson(userCookie, ckName);
  $.msg($.name, `🎉获取Cookie成功!`, ``);
}

//主程序执行入口
!(async () => {
  if (typeof $request !== "undefined") {
    await getCookie();
  } else {
    await main();
  }
})()
  .catch((e) => {
    $.logErr(e), $.msg($.name, `⛔️ script run error!`, e.message || e);
  })
  .finally(async () => {
    $.done({ ok: 1 });
  });
function getDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** ---------------------------------固定不动区域----------------------------------------- */
// biome-ignore format: allow compact one-line helper functions
async function sendMsg(a) { a && ($.isNode() ? await notify.sendNotify($.name, a) : $.msg($.name, $.title || "", a, { "media-url": $.avatar })) }
// biome-ignore format: allow compact one-line helper functions
function DoubleLog(o) { o && ($.log(`${o}`), $.notifyMsg.push(`${o}`)) }
// biome-ignore format: allow compact one-line helper functions
function debug(g, e = "debug") { "true" === $.is_debug && ($.log(`\n-----------${e}------------\n`), $.log("string" == typeof g ? g : $.toStr(g) || `debug error => t=${g}`), $.log(`\n-----------${e}------------\n`)) }
//From xream's ObjectKeys2LowerCase
// biome-ignore format: allow compact one-line helper functions
function ObjectKeys2LowerCase(obj) { return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])) }
//From sliverkiss's Request
// biome-ignore format: allow compact one-line helper functions
async function Request(t) { "string" == typeof t && (t = { url: t }); try { if (!t?.url) throw new Error("[发送请求] 缺少 url 参数"); let { url: o, type: e, headers: r = {}, body: s, params: a, dataType: n = "form", resultType: u = "data" } = t; const p = e ? e?.toLowerCase() : "body" in t ? "post" : "get", c = o.concat("post" === p ? "?" + $.queryStr(a) : ""), i = t.timeout ? $.isSurge() ? t.timeout / 1e3 : t.timeout : 1e4; "json" === n && (r["Content-Type"] = "application/json;charset=UTF-8"); const y = s && "form" == n ? $.queryStr(s) : $.toStr(s), l = { ...t, ...t?.opts ? t.opts : {}, url: c, headers: r, ..."post" === p && { body: y }, ..."get" === p && a && { params: a }, timeout: i }, m = $.http[p.toLowerCase()](l).then((t => "data" == u ? $.toObj(t.body) || t.body : $.toObj(t) || t)).catch((t => $.log(`❌请求发起失败！原因为：${t}`))); return Promise.race([new Promise(((t, o) => setTimeout((() => o("当前请求已超时")), i))), m]) } catch (t) { console.log(`❌请求发起失败！原因为：${t}`) } }
//From chavyleung's Env.js
// biome-ignore format: allow compact one-line helper functions
function Env(e,t){class s{constructor(e){this.env=e}send(e,t="GET"){e="string"==typeof e?{url:e}:e;let s=this.get;"POST"===t&&(s=this.post);const i=new Promise(((t,i)=>{s.call(this,e,((e,s,o)=>{e?i(e):t(s)}))}));return e.timeout?((e,t=1e3)=>Promise.race([e,new Promise(((e,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),t)}))]))(i,e.timeout):i}get(e){return this.send.call(this.env,e)}post(e){return this.send.call(this.env,e,"POST")}}return new class{constructor(e,t){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=e,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,t),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(e,t=null){try{return JSON.parse(e)}catch{return t}}toStr(e,t=null,...s){try{return JSON.stringify(e,...s)}catch{return t}}getjson(e,t){let s=t;if(this.getdata(e))try{s=JSON.parse(this.getdata(e))}catch{}return s}setjson(e,t){try{return this.setdata(JSON.stringify(e),t)}catch{return!1}}getScript(e){return new Promise((t=>{this.get({url:e},((e,s,i)=>t(i)))}))}runScript(e,t){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=t&&t.timeout?t.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:e,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((e,t,i)=>s(i)))})).catch((e=>this.logErr(e)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t);if(!s&&!i)return{};{const i=s?e:t;try{return JSON.parse(this.fs.readFileSync(i))}catch(e){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):i?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s){const i=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of i)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e||(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce(((e,s,i)=>Object(e[s])===e[s]?e[s]:e[s]=Math.abs(t[i+1])>>0==+t[i+1]?[]:{}),e)[t[t.length-1]]=s),e}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,i,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(a);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),i)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(e,t);return s}getval(e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(e);case"Quantumult X":return $prefs.valueForKey(e);case"Node.js":return this.data=this.loaddata(),this.data[e];default:return this.data&&this.data[e]||null}}setval(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(e,t);case"Quantumult X":return $prefs.setValueForKey(e,t);case"Node.js":return this.data=this.loaddata(),this.data[t]=e,this.writedata(),!0;default:return this.data&&this.data[t]||null}}initGotEnv(e){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,e&&(e.headers=e.headers?e.headers:{},e&&(e.headers=e.headers?e.headers:{},void 0===e.headers.cookie&&void 0===e.headers.Cookie&&void 0===e.cookieJar&&(e.cookieJar=this.ckjar)))}get(e,t=(()=>{})){switch(e.headers&&(delete e.headers["Content-Type"],delete e.headers["Content-Length"],delete e.headers["content-type"],delete e.headers["content-length"]),e.params&&(e.url+="?"+this.queryStr(e.params)),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(e),this.got(e).on("redirect",((e,t)=>{try{if(e.headers["set-cookie"]){const s=e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),t.cookieJar=this.ckjar}}catch(e){this.logErr(e)}})).then((e=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=e,n=s.decode(a,this.encoding);t(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:i,response:o}=e;t(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(e,t=(()=>{})){const s=e.method?e.method.toLocaleLowerCase():"post";switch(e.body&&e.headers&&!e.headers["Content-Type"]&&!e.headers["content-type"]&&(e.headers["content-type"]="application/x-www-form-urlencoded"),e.headers&&(delete e.headers["Content-Length"],delete e.headers["content-length"]),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":e.method=s,this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(e);const{url:o,...r}=e;this.got[s](o,r).then((e=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=e,n=i.decode(a,this.encoding);t(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:s,response:o}=e;t(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(e,t=null){const s=t?new Date(t):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in i)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?i[t]:("00"+i[t]).substr((""+i[t]).length)));return e}queryStr(e){let t="";for(const s in e){let i=e[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),t+=`${s}=${i}&`)}return t=t.substring(0,t.length-1),t}msg(t=e,s="",i="",o={}){const r=e=>{const{$open:t,$copy:s,$media:i,$mediaMime:o}=e;switch(typeof e){case void 0:return e;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:e};case"Loon":case"Shadowrocket":return e;case"Quantumult X":return{"open-url":e};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=e.openUrl||e.url||e["open-url"]||t;a&&Object.assign(r,{action:"open-url",url:a});let n=e["update-pasteboard"]||e.updatePasteboard||s;n&&Object.assign(r,{action:"clipboard",text:n});let h=e.mediaUrl||e["media-url"]||i;if(h){let e,t;if(h.startsWith("http"));else if(h.startsWith("data:")){const[s]=h.split(";"),[,i]=h.split(",");e=i,t=s.replace("data:","")}else{e=h,t=(e=>{const t={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in t)if(0===e.indexOf(s))return t[s];return null})(h)}Object.assign(r,{"media-url":h,"media-base64":e,"media-base64-mime":o??t})}return Object.assign(r,{"auto-dismiss":e["auto-dismiss"],sound:e.sound}),r}case"Loon":{const s={};let o=e.openUrl||e.url||e["open-url"]||t;o&&Object.assign(s,{openUrl:o});let r=e.mediaUrl||e["media-url"]||i;return r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=e["open-url"]||e.url||e.openUrl||t;r&&Object.assign(o,{"open-url":r});let a=e.mediaUrl||e["media-url"]||i;a&&Object.assign(o,{"media-url":a});let n=e["update-pasteboard"]||e.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(t,s,i,r(o));break;case"Quantumult X":$notify(t,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let e=["","==============📣系统通知📣=============="];e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n")),this.logs=this.logs.concat(e)}}debug(...e){this.logLevels[this.logLevel]<=this.logLevels.debug&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.debug}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}info(...e){this.logLevels[this.logLevel]<=this.logLevels.info&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.info}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}warn(...e){this.logLevels[this.logLevel]<=this.logLevels.warn&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.warn}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}error(...e){this.logLevels[this.logLevel]<=this.logLevels.error&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.error}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.map((e=>e??String(e))).join(this.logSeparator))}logErr(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t,e);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t,void 0!==e.message?e.message:e,e.stack);break}}wait(e){return new Promise((t=>setTimeout(t,e)))}done(e={}){const t=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${t} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(e);break;case"Node.js":process.exit(1)}}}(e,t)}