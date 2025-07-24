/*
 * @name Bilibili 全量 CDN 替换
 * @description 替换 durl + dash 中的所有 CDN 域名为指定自定义 CDN
 */

let body = $response.body;

try {
    let obj = JSON.parse(body);
    const customCDN = "upos-sz-estgoss.bilivideo.com";
    let changed = false;

    // 替换 durl.url 和 durl.backup_url
    if (obj?.data?.durl) {
        obj.data.durl.forEach(item => {
            if (item.url) {
                const original = item.url;
                item.url = item.url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                if (original !== item.url) changed = true;
            }
            if (item.backup_url) {
                item.backup_url = item.backup_url.map(url => {
                    const newUrl = url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                    if (url !== newUrl) changed = true;
                    return newUrl;
                });
            }
        });
    }

    // 替换 dash.video 和 dash.audio 的 baseUrl 与 backupUrl
    if (obj?.data?.dash) {
        const dash = obj.data.dash;

        // 视频
        if (Array.isArray(dash.video)) {
            dash.video.forEach(item => {
                if (item.baseUrl) {
                    const original = item.baseUrl;
                    item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                    if (original !== item.baseUrl) changed = true;
                }
                if (item.backupUrl) {
                    item.backupUrl = item.backupUrl.map(url => {
                        const newUrl = url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                        if (url !== newUrl) changed = true;
                        return newUrl;
                    });
                }
            });
        }

        // 音频
        if (Array.isArray(dash.audio)) {
            dash.audio.forEach(item => {
                if (item.baseUrl) {
                    const original = item.baseUrl;
                    item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                    if (original !== item.baseUrl) changed = true;
                }
                if (item.backupUrl) {
                    item.backupUrl = item.backupUrl.map(url => {
                        const newUrl = url.replace(/https?:\/\/[^\/]+/, `https://${customCDN}`);
                        if (url !== newUrl) changed = true;
                        return newUrl;
                    });
                }
            });
        }
    }

    if (changed) {
        console.log("✅ Bilibili CDN 全部替换为:", customCDN);
    } else {
        console.log("⚠️ 未匹配到可替换的字段");
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("❌ 处理失败:", e);
    $done({});
}
