/**
 * @fileoverview Bilibili 播放链接 API 响应重写 (全平台通用版)
 * 兼容: Loon, Quantumult X, Surge, Stash
 * 逻辑: 拦截 playurl 接口 JSON，将原生 CDN 替换为代理 CDN。
 */

const proxyDomain = "https://proxy-tf-all-ws.bilivideo.com/?url=";

if (typeof $response !== 'undefined' && $response.body) {
    try {
        // 解析响应体，自动处理掉 \u0026 等 JSON 转义符
        let obj = JSON.parse($response.body);
        
        // 递归遍历并替换所有匹配的 CDN URL
        function replaceUrls(data) {
            if (typeof data === 'string') {
                // 匹配 B 站官方 CDN 域名
                if (/^https?:\/\/[a-zA-Z0-9-]+\.bilivideo\.(com|cn)/.test(data)) {
                    // 防止重复代理
                    if (!data.includes('proxy-tf-all-ws.bilivideo.com')) {
                        return proxyDomain + encodeURIComponent(data);
                    }
                }
                return data;
            }
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    data[i] = replaceUrls(data[i]);
                }
            } else if (typeof data === 'object' && data !== null) {
                for (let key in data) {
                    data[key] = replaceUrls(data[key]);
                }
            }
            return data;
        }

        // 执行替换并重新序列化为 JSON 返回
        obj = replaceUrls(obj);
        $done({ body: JSON.stringify(obj) });

    } catch (e) {
        console.log(`Bili API Rewrite Error: ${e}`);
        // 若解析出错，原样返回，防止视频加载失败
        $done({ body: $response.body });
    }
} else {
    $done({});
}
