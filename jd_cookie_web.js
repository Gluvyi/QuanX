const APIKey = "CookiesJD";
const $ = new API("ql", false);
const CacheKey = `#${APIKey}`;
$.KEY_sessions = "#chavy_boxjs_sessions";

const jdHelp = JSON.parse($.read("#jd_ck_remark") || "{}");
let remark = [];
try {
  remark = JSON.parse(jdHelp.remark || "[]");
} catch (e) {
  console.log(e);
}

function getUsername(ck) {
  if (!ck) return "";
  return decodeURIComponent(ck.match(/pin=(.+?);/)[1]);
}

async function getScriptUrl() {
  const response = await $.http.get({
    url: "https://raw.githubusercontent.com/Gluvyi/QuanX/main/ql_api.js",
  });
  return response.body;
}

const mute = "#cks_get_mute";
$.mute = $.read(mute);

function getSessions() {
  const sessionstr = $.read($.KEY_sessions);
  const sessions = ![undefined, null, "null", ""].includes(sessionstr)
    ? JSON.parse(sessionstr)
    : [];
  return Array.isArray(sessions) ? sessions : [];
}

const allConfig = getSessions()
  .filter((item) => item && item.appId === "ql")
  .map((item) => {
    const temp = {};
    item.datas.forEach((data) => {
      const [, idKey] = data.key.replace("@").split(".");
      if (idKey !== "env") temp[idKey] = data.val;
    });
    return temp;
  });

(async () => {
  const ql_script = (await getScriptUrl()) || "";
  eval(ql_script);
  
  await GetCookie();
})()
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    $.done();
  });

function getCache() {
  return JSON.parse($.read(CacheKey) || "[]");
}

function updateJDHelp(username) {
  if (remark.length) {
    const newRemark = remark.map((item) => {
      if (item.username === username) {
        return { ...item, status: "正常" };
      }
      return item;
    });
    jdHelp.remark = JSON.stringify(newRemark, null, `\t`);
    $.write(JSON.stringify(jdHelp), "#jd_ck_remark");
  }
}

async function GetCookie() {
  const CV = `${$request.headers["Cookie"] || $request.headers["cookie"]};`;
  // https://sgm-m.jd.com/h5
  if ($request.headers && $request.url.indexOf("https://sgm-m.jd.com/h5") > -1) {
    try{
      // 抛异常
      await $.ql.login();
    }catch(error){
      $.notify(
          "用户名: " + DecodeName,
          $.ql_config.ip,
          `青龙登录失败！服务器可能出现问题！`
        );
      return
    }
    
    let qlCk = await $.ql.select("JD_COOKIE");
    if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
      const CookieValue = CV.match(/pt_key=.+?;/) + CV.match(/pt_pin=.+?;/);
      if (CookieValue.indexOf("fake_") > -1) return console.log("异常账号");
      
      if (!qlCk.data) return;
      qlCk = qlCk.data;
      
      const DecodeName = getUsername(CookieValue);
      const current = qlCk.find(
        (item) => getUsername(item.value) === DecodeName
      );
      
      if (current && current.value === CookieValue) {
        $.notify(
            "用户名: " + DecodeName,
            `账号无需更新!`
          );
        return;
      }

      let remarks = "";
      remarks = remark.find((item) => item.username === DecodeName);
      if (remarks) {
        remarks =
          name === "JD_COOKIE"
            ? remarks.nickname
            : `${remarks.nickname}&${remarks.remark}&${remarks.qywxUserId}`;
      }
      let response;
      if (current) {
        current.value = CookieValue;
        response = await $.ql.edit({
          name: "JD_COOKIE",
          remarks: current.remarks||remarks,
          value: CookieValue,
          id: current.id,
        });
        if (response.data.status === 1) {
          response = await $.ql.enabled([current.id]);
        }
      } else {
        response = await $.ql.add([
          { name: "JD_COOKIE", value: CookieValue, remarks: remarks },
        ]);
      }
      if (response.code === 200) {
        $.notify(
          "用户名: " + DecodeName,
          $.ql_config.ip,
          `同步更新青龙成功🎉`
        );
      } else {
        console.log("青龙同步失败");
      }
    }
  }
}

async function TotalBean(Cookie) {
  const opt = {
    url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2&sceneval=2&g_login_type=1&g_ty=ls&isLogin=1",
    headers: {
      cookie: Cookie,
      Referer: "https://home.m.jd.com/",
    },
  };
  return $.http.get(opt).then((response) => {
    try {
      return JSON.parse(response.body);
    } catch (e) {
      return false;
    }
  });
}

function ENV() {
  const isQX = typeof $task !== "undefined";
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
  const isNode = typeof require == "function" && !isJSBox;
  const isRequest = typeof $request !== "undefined";
  const isScriptable = typeof importModule !== "undefined";
  return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable };
}

function HTTP(defaultOptions = { baseURL: "" }) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
  const URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options = typeof options === "string" ? { url: options } : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || "")) {
      options.url = baseURL ? baseURL + options.url : options.url;
    }
    options = { ...defaultOptions, ...options };
    const timeout = options.timeout;
    const events = {
      ...{
        onRequest: () => { },
        onResponse: (resp) => resp,
        onTimeout: () => { },
      },
      ...options.events,
    };

    events.onRequest(method, options);

    let worker;
    if (isQX) {
      worker = $task.fetch({ method, ...options });
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require("request") : $httpClient;
        request[method.toLowerCase()](options, (err, response, body) => {
          if (err) reject(err);
          else
            resolve({
              statusCode: response.status || response.statusCode,
              headers: response.headers,
              body,
            });
        });
      });
    } else if (isScriptable) {
      const request = new Request(options.url);
      request.method = method;
      request.headers = options.headers;
      request.body = options.body;
      worker = new Promise((resolve, reject) => {
        request
          .loadString()
          .then((body) => {
            resolve({
              statusCode: request.response.statusCode,
              headers: request.response.headers,
              body,
            });
          })
          .catch((err) => reject(err));
      });
    }

    let timeoutid;
    const timer = timeout
      ? new Promise((_, reject) => {
        timeoutid = setTimeout(() => {
          events.onTimeout();
          return reject(
            `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
          );
        }, timeout);
      })
      : null;

    return (
      timer
        ? Promise.race([timer, worker]).then((res) => {
          clearTimeout(timeoutid);
          return res;
        })
        : worker
    ).then((resp) => events.onResponse(resp));
  }

  const http = {};
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options))
  );
  return http;
}

function API(name = "untitled", debug = false) {
  const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require("fs");

          return {
            fs,
          };
        } else {
          return null;
        }
      })();
      this.initCache();

      const delay = (t, v) =>
        new Promise(function (resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function (t) {
        return this.then(function (v) {
          return delay(t, v);
        });
      };
    }

    // persistance

    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

      if (isNode) {
        // create a json for root cache
        let fpath = "root.json";
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`)
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: "w" },
          (err) => console.log(err)
        );
        this.node.fs.writeFileSync(
          "root.json",
          JSON.stringify(this.root),
          { flag: "w" },
          (err) => console.log(err)
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(data, key);
        }
        if (isQX) {
          return $prefs.setValueForKey(data, key);
        }
        if (isNode) {
          this.root[key] = data;
        }
      } else {
        this.cache[key] = data;
      }
      this.persistCache();
    }

    read(key) {
      this.log(`READ ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.read(key);
        }
        if (isQX) {
          return $prefs.valueForKey(key);
        }
        if (isNode) {
          return this.root[key];
        }
      } else {
        return this.cache[key];
      }
    }

    delete(key) {
      this.log(`DELETE ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(null, key);
        }
        if (isQX) {
          return $prefs.removeValueForKey(key);
        }
        if (isNode) {
          delete this.root[key];
        }
      } else {
        delete this.cache[key];
      }
      this.persistCache();
    }

    // notification
    notify(title, subtitle = "", content = "", options = {}) {
      const openURL = options["open-url"];
      const mediaURL = options["media-url"];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`,
          {
            url: openURL,
          }
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts["openUrl"] = openURL;
        if (mediaURL) opts["mediaUrl"] = mediaURL;
        if (JSON.stringify(opts) == "{}") {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : "") +
          (mediaURL ? `\n多媒体: ${mediaURL}` : "");
        if (isJSBox) {
          const push = require("push");
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + "\n" : "") + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log("ERROR: " + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== "undefined") {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }
  })(name, debug);
}
