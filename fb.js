[rewrite_local]

^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$ url script-response-body https://raw.githubusercontents.com/chxm1023/QX/main/Scripts/Fileball.js

[mitm] 

hostname = api.revenuecat.com
