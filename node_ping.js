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

    $httpClient.get(
        {
            url: "https://www.gstatic.com/generate_204",
            timeout: timeout,
            node: node
        },
        function (error, response) {

            var success =
                !error &&
                response &&
                response.status >= 200 &&
                response.status < 400;

            // 只有探测失败才通知
            if (!success) {
                $notification.post(
                    "节点异常",
                    node,
                    "节点无法连接"
                );
            }

            // 探测成功：什么都不做
            $done();
        }
    );
})();
