// BaiduNetDisk_Ad.js
let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        if (obj.data && Array.isArray(obj.data.data)) {
            // 过滤 小说、短剧、打印、求职
            const block = ["novel", "shortplay", "print", "job_hunt"];
            obj.data.data = obj.data.data.filter(i => !block.includes(i.type));
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) { $done({}); }
} else { $done({}); }
