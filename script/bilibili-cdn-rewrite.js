let body = $response.body;

try {
    let obj = JSON.parse(body);

    const customCDN = "upos-sz-estgoss.bilivideo.com";
    let changed = false;

    if (obj?.data?.durl && Array.isArray(obj.data.durl)) {
        obj.data.durl.forEach(item => {
            if (item.url) {
                const original = item.url;
                item.url = item.url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                if (original !== item.url) changed = true;
            }
            if (item.backup_url && Array.isArray(item.backup_url)) {
                item.backup_url = item.backup_url.map(url => {
                    const newUrl = url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                    if (url !== newUrl) changed = true;
                    return newUrl;
                });
            }
        });
        if (changed) console.log("✅ CDN 替换成功:", customCDN);
        else console.log("⚠️ 没有发现需要替换的链接");
        body = JSON.stringify(obj);
    } else {
        console.log("⚠️ 未发现 durl 字段");
    }

} catch (e) {
    console.log("❌ 脚本错误:", e);
}

$done({ body });
