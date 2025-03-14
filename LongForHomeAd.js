const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/supera/C4/v1_11_0/publicApi/nav/query/app")) {
    console.log("获取到了url body")
    console.log(obj)
}
