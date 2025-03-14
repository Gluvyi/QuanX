const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/supera/C4/v1_11_0/publicApi/nav/query/app")) {
    if (obj?.data?.data?.length > 0) {
        let jsonData = obj.data.data;
        if (Array.isArray(jsonData)){
            jsonData = jsonData.filter(item => item.frameName !== "商城")
        }
        console.log(jsonData)
    }
}

$done({ body: JSON.stringify(jsonData) });
