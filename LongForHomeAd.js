const url = $request.url;

if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/supera/C4/v1_11_0/publicApi/nav/query/app")) {
    if (obj?.data?.data?.length > 0) {
        let jsonData = obj.data.data;
        if (Array.isArray(obj.data.data)){
            obj.data.data = obj.data.data.filter(item => item?.frameName !== equals("商城"))
        }
        console.log(obj.data.data)
    }
}

$done({ body: JSON.stringify(obj) });
