/**
 * @fileoverview Bilibili CDN 代理脚本 (Quantumult X - 统一 307 跨域注入版)
 * 强制双端使用 307 重定向，并注入 CORS 头以解决网页端跨域拦截问题。
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    // 防代理循环嵌套与降级探测
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com') || 
        originalUrl.includes('httpdns.bilivideo.com') || 
        originalUrl.includes('/resolve?') || 
        originalUrl.includes('203.119.206.8')) {
        $done({}); 
        return;
    }

    // 直接放行 OPTIONS 预检请求（重要：这是跨域的第一步）
    if ($request.method === 'OPTIONS') {
        $done({
            status: "HTTP/1.1 200 OK",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        }); 
        return;
    }

    try {
        const encodedUrl = encodeURIComponent(originalUrl);
        const newFullUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // 废弃 UA 判断，统一执行外部重定向，并附加 CORS 头
        $done({
            status: "HTTP/1.1 307 Temporary Redirect",
            headers: {
                "Location": newFullUrl,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Expose-Headers": "*"
            }
        });

    } catch (e) {
        console.log(`Bili CDN QX 脚本错误: ${e}`);
        $done({});
    }
}

run();
