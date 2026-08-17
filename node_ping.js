(function () {
    var node = ($argument.node_name || "").trim();
    var timeout = parseInt($argument.timeout_ms || "4000", 10);

    if (!node) {
        $notification.post(
            "节点探活",
            "未配置节点",
            "请填写节点名称"
        );
        $done();
        return;
    }

    var testUrl = "https://www.gstatic.com/generate_204";

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

                // 之前是异常状态，现在恢复
                if ($persistentStore.read(downKey) === "1") {

                    $persistentStore.remove(downKey);

                    $notification.post(
                        "节点恢复",
                        node,
                        "节点已恢复"
                    );
                }

            } else {

                // 当前已经通知过 DOWN，则不重复通知
                if ($persistentStore.read(downKey) !== "1") {

                    $persistentStore.write(
                        "1",
                        downKey
                    );

                    $notification.post(
                        "节点异常",
                        node,
                        "节点无法连接"
                    );
                }
            }

            $done();
        }
    );
})();
