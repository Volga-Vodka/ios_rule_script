/**
 * @fileoverview Bilibili CDN 统一 307 跨域重定向脚本 (QX / Loon 通用版)
 * 强制双端使用 307 重定向，并注入 CORS 头解决网页端跨域拦截。
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    // 1. 防代理循环嵌套与降级探测
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com') || 
        originalUrl.includes('httpdns.bilivideo.com') || 
        originalUrl.includes('/resolve?') || 
        originalUrl.includes('203.119.206.8')) {
        $done({}); 
        return;
    }

    // 2. 网页端跨域预检请求 (OPTIONS) 处理
    // 直接返回 200 并补齐跨域允许头，阻止向源站发送 OPTIONS 导致 CORS 失败
    if ($request.method === 'OPTIONS') {
        $done({
            response: {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Max-Age": "86400"
                }
            }
        }); 
        return;
    }

    try {
        const encodedUrl = encodeURIComponent(originalUrl);
        const newFullUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // 3. 执行 307 外部重定向 (携带 CORS 头)
        // 统一构造 response 对象，QX 和 Loon 均兼容此写法
        $done({
            response: {
                status: 307,
                headers: {
                    "Location": newFullUrl,
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Expose-Headers": "*"
                }
            }
        });

    } catch (e) {
        console.log(`Bili CDN 307 Script Error: ${e}`);
        $done({}); // 异常时放行原请求
    }
}

run();
