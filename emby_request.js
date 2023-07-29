const headers = $request.headers;
console.log(headers);
delete headers["user-agent"];
delete headers["X-Emby-Authorization"];
console.log(headers);

headers['User-Agent'] = `Fileball/180 CFNetwork/1327.0.4 Darwin/21.2.0`;
headers['X-Emby-Authorization'] =  `Emby UserId=E87E6854-A5B3-415E-9FEF-D436559BEAAF,Client=Filebox,Device=iPhone,DeviceId=F499F2DA-A0A0-4C07-B423-996CDEA6EC22,Version=1.2.11`;
console.log(headers);
$done({ headers });
