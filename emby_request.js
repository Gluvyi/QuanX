const headers = $request.headers;
console.log(headers);
delete headers["user-agent"];
console.log(headers);

headers['User-Agent'] = `Fileball/180 CFNetwork/1327.0.4 Darwin/21.2.0`;
console.log(headers);
$done({ headers });
