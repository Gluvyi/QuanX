const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// 去除app初始化首页中商城按钮
if (url.includes("/app")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName !== "商城")
        }
        console.log(obj.data.data)
    }
} 

// app中只保留在社区Tab页
if (url.includes("/navigation")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName === "在社区")
        }
        console.log(obj.data.data)
    }
}

$done({ body: JSON.stringify(obj) });
