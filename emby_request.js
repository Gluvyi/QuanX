const headers = $request.headers;
delete headers["user-agent"];

headers['User-Agent'] = `Fileball/200 CFNetwork/1327.0.4 Darwin/21.2.0`;

if ('X-Emby-Authorization' in headers){
    delete headers["X-Emby-Authorization"];
    headers['X-Emby-Authorization'] = `Emby UserId=71B51549-82C2-4783-AF1E-DB19302A8B07,Client=Filebox,Device=iPhone,DeviceId=F499F2DA-A0A0-4C07-B423-996CDEA6EC22,Version=1.2.27`;
}

$done({ headers });
