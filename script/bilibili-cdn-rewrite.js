/*
 * @fileoverview Replace Bilibili CDN URLs in playurl response.
 * @note Ensure MITM is properly configured for api.bilibili.com
 */

let body = $response.body;

try {
    let obj = JSON.parse(body);

    if (obj?.data?.durl && Array.isArray(obj.data.durl)) {
        obj.data.durl.forEach(item => {
            if (item.url) {
                // 替换主url
                item.url = item.url.replace(/upos-hz-mirror.*?\.bilivideo\.com/, 'upos-sz-estgoss.bilivideo.com');
            }
            if (item.backup_url && Array.isArray(item.backup_url)) {
                item.backup_url = item.backup_url.map(url =>
                    url.replace(/upos-hz-mirror.*?\.bilivideo\.com/, 'upos-sz-estgoss.bilivideo.com')
                );
            }
        });
        body = JSON.stringify(obj);
    }
} catch (e) {
    console.log('Bilibili CDN Script Error:', e);
}

$done({ body });
