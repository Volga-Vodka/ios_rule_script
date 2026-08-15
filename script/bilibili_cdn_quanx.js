 /**
  * @fileoverview Bilibili CDN 代理脚本 (Quantumult X V12)
  *
  * Based on:
  * - bilibili_cdn.js V12
  * - bili_cdn_proxy_QX.js
  *
  * Logic:
  * - Web (Mozilla): QX internal rewrite via relative path + Host/Authority
  * - App / unknown: 307 external redirect
  * - HTTPDNS / IP direct / proxy endpoint: bypass
  * - OPTIONS: bypass
  */

function run() {
    // $request 不存在或 URL 无效时直接放行
    if (typeof $request === 'undefined' || !$request.url) {
        $done({});
        return;
    }

    const originalUrl = $request.url;

    // 1. 防止代理循环嵌套
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com')) {
        $done({});
        return;
    }

    // 2. 放行 HTTPDNS / DNS 探测 / IP 直连
    if (
        originalUrl.includes('httpdns.bilivideo.com') ||
        originalUrl.includes('/resolve?') ||
        originalUrl.includes('203.119.206.8')
    ) {
        $done({});
        return;
    }

    // 3. 放行 CORS 预检请求
    if ($request.method === 'OPTIONS') {
        $done({});
        return;
    }

    const originalHeaders = $request.headers || {};

    try {
        const url = new URL(originalUrl);

        // 再次防止已经是代理 Host 的请求进入重写
        if (url.hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({});
            return;
        }

        const encodedUrl = encodeURIComponent(originalUrl);

        /*
         * QX 网页端：
         * 必须使用相对 path。
         *
         * 不能使用：
         *   url: newFullUrl
         *
         * 否则可能出现 QX 将绝对 URL 与原 Host/path
         * 拼接后形成 https://...https://... 的问题。
         */
        const newPath = `/?url=${encodedUrl}`;

        // App 端 307 使用完整 URL
        const newFullUrl =
            `https://proxy-tf-all-ws.bilivideo.com${newPath}`;

        // 获取 User-Agent，兼容大小写
        const ua =
            originalHeaders['user-agent'] ||
            originalHeaders['User-Agent'] ||
            '';

        if (ua.includes('Mozilla')) {

            // =====================================================
            // Web：QX 内部重写
            // =====================================================

            let newHeaders = {};

            // QX headers 统一转为小写，避免 Host / authority
            // 大小写造成匹配问题
            for (let key in originalHeaders) {
                newHeaders[key.toLowerCase()] = originalHeaders[key];
            }

            const newAuthority =
                'proxy-tf-all-ws.bilivideo.com';

            newHeaders['host'] = newAuthority;
            newHeaders['authority'] = newAuthority;

            /*
             * 关键：
             * QX 使用 path，而不是 url。
             */
            $done({
                path: newPath,
                headers: newHeaders
            });

        } else {

            // =====================================================
            // App / Unknown：307 外部重定向
            // =====================================================

            $done({
                status: "HTTP/1.1 307 Temporary Redirect",
                headers: {
                    "Location": newFullUrl
                }
            });
        }

    } catch (e) {
        console.log(`Bili CDN QX V12 脚本错误: ${e}`);
        $done({});
    }
}

run();
