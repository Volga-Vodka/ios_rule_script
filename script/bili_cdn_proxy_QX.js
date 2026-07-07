/**
 * @fileoverview Bilibili CDN 代理脚本 (Quantumult X 终极版)
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    // 1. 【防嵌套防御】：遇到代理域名本身，直接放行
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com')) {
        $done({}); 
        return;
    }

    // 2. 【防降级防御】：遇到 HTTPDNS / gRPC 探测，直接放行（交给分流规则或 Mock 脚本处理）
    if (originalUrl.includes('httpdns.bilivideo.com') || 
        originalUrl.includes('/resolve?') || 
        originalUrl.includes('203.119.206.8')) {
        $done({}); 
        return;
    }

    // 3. 放行 CORS 预检请求
    if ($request.method === 'OPTIONS') {
        $done({}); 
        return;
    }

    const originalHeaders = $request.headers;

    try {
        const encodedUrl = encodeURIComponent(originalUrl);
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

        if (ua.includes('Mozilla')) {
            // --- 网页端：内部重写 URL + 修正 authority ---
            let newHeaders = {};
            for (let key in originalHeaders) {
                newHeaders[key.toLowerCase()] = originalHeaders[key];
            }
            const newAuthority = 'proxy-tf-all-ws.bilivideo.com';
            newHeaders['host'] = newAuthority;
            newHeaders['authority'] = newAuthority;
            
            $done({ 
                path: newUrl,
                url: newUrl,
                headers: newHeaders 
            });

        } else {
            // --- App 端：直接返回 307 外部重定向响应 ---
            $done({
                status: "HTTP/1.1 307 Temporary Redirect",
                headers: {
                    "Location": newUrl
                }
            });
        }

    } catch (e) {
        console.log(`Bili CDN QX 脚本错误: ${e}`);
        $done({});
    }
}

run();
