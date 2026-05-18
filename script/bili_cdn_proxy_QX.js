/**
 * @fileoverview Bilibili CDN 代理脚本 (Quantumult X 特供版)
 * * 修正了先前的语法错误：
 * 1. 统一使用 script-request-header 类型的脚本。
 * 2. 网页端（Mozilla）：使用 QuanX 的 { path: newUrl } 语法执行内部重写。
 * 3. App 端（非Mozilla）：使用 QuanX 的 { status: "HTTP/1.1 307..." } 语法直接拦截并返回重定向响应。
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    // 放行 CORS 预检请求
    if ($request.method === 'OPTIONS') {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;
    const originalHeaders = $request.headers;

    try {
        // 正则提取 hostname，比 new URL() 在旧版环境更稳妥
        let hostname = "";
        const match = originalUrl.match(/^https?:\/\/([^/]+)/);
        if (match) hostname = match[1];

        // 避免无限循环
        if (hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({}); 
            return;
        }

        const encodedUrl = encodeURIComponent(originalUrl);
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // 获取 User-Agent
        const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

        if (ua.includes('Mozilla')) {
            // --- 1. 网页端：内部重写 URL + 修正 authority ---
            let newHeaders = {};
            for (let key in originalHeaders) {
                newHeaders[key.toLowerCase()] = originalHeaders[key];
            }
            const newAuthority = 'proxy-tf-all-ws.bilivideo.com';
            newHeaders['host'] = newAuthority;
            newHeaders['authority'] = newAuthority;
            
            // QuanX 的内部重写规范：使用 path 键值改变目标 URL
            $done({ 
                path: newUrl,
                url: newUrl, // 兼顾部分特殊情况
                headers: newHeaders 
            });

        } else {
            // --- 2. App 端：直接返回 307 外部重定向响应 ---
            // 这是 QuanX 独有的、直接在请求阶段 mock 响应体的语法
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
