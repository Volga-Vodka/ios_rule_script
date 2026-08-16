/**
 * @fileoverview Bilibili CDN 代理脚本 (Loon - 统一 307 版)
 * App / Web 统一使用 307 重定向
 * 注入 CORS 头以兼容网页端跨域请求
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({});
        return;
    }

    const originalUrl = $request.url;

    // 防止代理循环，以及放行 HTTPDNS / DNS 探测
    if (
        originalUrl.includes('proxy-tf-all-ws.bilivideo.com') ||
        originalUrl.includes('httpdns.bilivideo.com') ||
        originalUrl.includes('/resolve?') ||
        originalUrl.includes('203.119.206.8')
    ) {
        $done({});
        return;
    }

    // OPTIONS 预检请求直接返回 200
    if ($request.method === 'OPTIONS') {
        $done({
            response: {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Max-Age': '86400'
                }
            }
        });
        return;
    }

    try {
        const encodedUrl = encodeURIComponent(originalUrl);

        const newFullUrl =
            `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;

        // App / Web 统一 307
        $done({
            response: {
                status: 307,
                headers: {
                    'Location': newFullUrl,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Expose-Headers': '*'
                }
            }
        });

    } catch (e) {
        console.log(`Bili CDN Loon 脚本错误: ${e}`);
        $done({});
    }
}

run();
