(function () {
    var argStr = $script.argument || "";
    var params = {};

    argStr.split("&").forEach(function (kv) {
        var i = kv.indexOf("=");
        if (i > -1) {
            var key = kv.slice(0, i);
            var value = kv.slice(i + 1);
            try {
                value = decodeURIComponent(value);
            } catch (e) {}
            params[key] = value;
        }
    });

    var nodeName = (params.node || "").trim();
    var timeout = parseInt(params.timeout || "4000", 10);

    if (!nodeName) {
        $notification.post(
            "节点探活",
            "未配置节点",
            "请在插件参数中填写节点名称"
        );
        $done();
        return;
    }

    var testUrl = "https://www.gstatic.com/generate_204";

    var failKey = "node_ping_fail_" + nodeName;
    var downKey = "node_ping_down_" + nodeName;

    $httpClient.get(
        {
            url: testUrl,
            timeout: timeout,
            node: nodeName
        },
        function (error, response) {

            var success =
                !error &&
                response &&
                response.status >= 200 &&
                response.status < 400;

            if (success) {

                var wasDown =
                    $persistentStore.read(downKey) === "1";

                // 清除连续失败次数
                $persistentStore.write("0", failKey);

                // 如果之前是 DOWN，现在恢复
                if (wasDown) {

                    $persistentStore.remove(downKey);

                    $notification.post(
                        "节点恢复",
                        nodeName,
                        "节点已恢复\nHTTP " + response.status
                    );
                }

            } else {

                var failCount = parseInt(
                    $persistentStore.read(failKey) || "0",
                    10
                );

                failCount++;

                $persistentStore.write(
                    String(failCount),
                    failKey
                );

                // 连续2次失败才判定 DOWN
                if (
                    failCount >= 2 &&
                    $persistentStore.read(downKey) !== "1"
                ) {

                    $persistentStore.write("1", downKey);

                    var reason = "";

                    if (error) {
                        reason =
                            error.message ||
                            String(error);
                    } else if (response) {
                        reason =
                            "HTTP " +
                            response.status;
                    } else {
                        reason = "请求失败";
                    }

                    $notification.post(
                        "节点超时告警",
                        nodeName,
                        "连续2次探测失败\n" + reason
                    );
                }
            }

            $done();
        }
    );
})();
