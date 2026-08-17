// node_ping.js
(function () {
  const argStr = $script.argument || "";
  const params = {};
  argStr.split("&").forEach(kv => {
    const i = kv.indexOf("=");
    if (i > -1) params[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
  });

  const TARGET_NODE = (params.node || "").trim();
  const HTTP_TIMEOUT = parseInt(params.timeout || "4000", 10);
  const TEST_URL = "http://www.gstatic.com/generate_204";

  if (!TARGET_NODE) {
    $notification.post("节点探活", "未配置节点名", "请在插件参数填节点名称");
    $done();
    return;
  }

  const failKey = "node_ping_fail_" + TARGET_NODE;
  const downKey = "node_ping_down_" + TARGET_NODE;

  $httpClient.get(
    {
      url: TEST_URL,
      timeout: HTTP_TIMEOUT,
      node: TARGET_NODE
    },
    (error, response) => {
      let ok = false;
      if (!error && response && response.status >= 200 && response.status < 400) {
        ok = true;
      }

      if (ok) {
        const fails = 0;
        $persistentStore.write(String(fails), failKey);
        // 之前是宕机状态 → 发恢复通知
        if ($persistentStore.read(downKey) === "1") {
          $persistentStore.remove(downKey);
          $notification.post("节点恢复", TARGET_NODE, "探测正常 status=" + response.status);
        }
      } else {
        let fails = parseInt($persistentStore.read(failKey) || "0", 10);
        fails += 1;
        $persistentStore.write(String(fails), failKey);
        if (fails >= 2 && $persistentStore.read(downKey) !== "1") {
          $persistentStore.write("1", downKey);
          const errMsg = error ? (error.message || String(error)) : ("HTTP " + (response && response.status));
          $notification.post("节点超时告警", TARGET_NODE, "连续2次失败: " + errMsg);
        }
      }
      $done();
    }
  );
})();
