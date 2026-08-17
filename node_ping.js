(function () {
    var node = ($argument.node_name || "").trim();
    var timeout = parseInt($argument.timeout_ms || "4000", 10);

    if (!node) {
        $notification.post(
            "节点探活",
            "未配置节点",
            "请在插件参数中填写节点名称"
        );
        $done();
        return;
    }

    var testUrl = "https://www.gstatic.com/generate_204";

    var failKey = "node_ping_fail_" + node;
    var downKey = "node_ping_down_" + node;

    $httpClient.get(
        {
            url: testUrl,
            timeout: timeout,
            node: node
        },
        function (error, response) {

            var success =
                !error &&
                response &&
                response.status >= 200 &&
                response.status < 400;

            if (success) {

                // 清零失败次数
                $persistentStore.write("0", failKey);

                // 如果之前已经判定宕机，现在恢复
                if ($persistentStore.read(downKey) === "1") {

                    $persistentStore.remove(downKey);

                    $notification.post(
                        "节点恢复",
                        node,
                        "HTTP " + response.status
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

                // 连续两次失败才报警
                if (
                    failCount >= 2 &&
                    $persistentStore.read(downKey) !== "1"
                ) {

                    $persistentStore.write(
                        "1",
                        downKey
                    );

                    var reason;

                    if (error) {
                        reason =
                            error.message ||
                            String(error);
                    } else if (response) {
                        reason =
                            "HTTP " + response.status;
                    } else {
                        reason = "请求失败";
                    }

                    $notification.post(
                        "节点超时告警",
                        node,
                        "连续2次探测失败\n" + reason
                    );
                }
            }

            $done();
        }
    );
})();
