const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

const urlSuffix = "/nav/query"

// 去除app初始化首页中商城按钮
if (url.includes(urlSuffix + "/app")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName !== "商城");
        }
        console.log(obj.data.data)
    }
} 

// app中只保留"在社区"Tab页
if (url.includes(urlSuffix + "/navigation")) {
    if (obj?.data?.data?.length > 0) {
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName === "在社区")
        }
        console.log(obj.data.data)
    }
}

// 只保留首页中MiniCard
if (url.includes("/getPageData/C4home")) {
    if (obj?.data?.components?.length > 0) {
        if (Array.isArray(obj.data.components)){
            obj.data.components = obj.data.components(item => item?.componentType === "MiniCard");
        }
    }
    console.log(obj.data.components)
}

$done({ body: JSON.stringify(obj) });
