const targetCDN = "upos-sz-estgoss.bilivideo.com"; 


let body = $response.body;

try {
    // 尝试解析JSON格式的响应体
    let obj = JSON.parse(body);
    if (obj.durl) {
        obj.durl.forEach(segment => {
            if (segment.url) {
                segment.url = replaceCDN(segment.url, targetCDN);
            }
            if (segment.backup_url && segment.backup_url.length > 0) {
                segment.backup_url.forEach((url, index) => {
                    segment.backup_url[index] = replaceCDN(url, targetCDN);
                });
            }
        });
    }
    
    if (obj.data && obj.data.durl) {
         obj.data.durl.forEach(segment => {
            if (segment.url) {
                segment.url = replaceCDN(segment.url, targetCDN);
            }
            if (segment.backup_url && segment.backup_url.length > 0) {
                segment.backup_url.forEach((url, index) => {
                    segment.backup_url[index] = replaceCDN(url, targetCDN);
                });
            }
        });
    }
    
    // 

    body = JSON.stringify(obj);

} catch (e) {
    console.log("Bilibili CDN Mod: JSON parsing failed, might be Protobuf. " + e);
}

$done({body});

function replaceCDN(originalUrl, newCdnHost) {
    if (!originalUrl || !newCdnHost) return originalUrl;
    let url = new URL(originalUrl);
    url.host = newCdnHost;
    return url.toString();
}
