/*
 * @name Bilibili CDN Replacer
 * @description 将所有 Bilibili 播放链接的 CDN 域名统一替换为 upos-sz-estgoss.bilivideo.com
 */

let body = $response.body;

try {
    let obj = JSON.parse(body);

    const customCDN = "upos-sz-estgoss.bilivideo.com";

    if (obj?.data?.durl && Array.isArray(obj.data.durl)) {
        obj.data.durl.forEach(item => {
            if (item.url) {
                item.url = item.url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
            }
            if (item.backup_url && Array.isArray(item.backup_url)) {
                item.backup_url = item.backup_url.map(url =>
                    url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`)
                );
            }
        });
        body = JSON.stringify(obj);
        console.log("✅ Bilibili CDN 链接已统一替换为:", customCDN);
    } else {
        console.log("⚠️ 未发现 durl 字段");
    }

} catch (e) {
    console.log("❌ Bilibili CDN 脚本出错:", e);
}

$done({ body });
