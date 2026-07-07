/**
 * @fileoverview Bilibili CDN 代理脚本 (Quantumult X 终极防嵌套版)
 * 修正了 QuanX 在内部重写时绝对路径与 Host 拼接导致的 https://...https://... 错误。
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    // 1. 【防代理循环嵌套】
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com')) {
        $done({}); 
        return;
    }

    // 2. 【防降级探测】放行 HTTPDNS 与 IP 直连
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
        
        // 区分“相对路径”和“绝对路径”
        const newPath = `/?url=${encodedUrl}`; // 专供 Web 端内部重写使用
        const newFullUrl = `https://proxy-tf-all-ws.bilivideo.com${newPath}`; // 专供 App 端 307 使用
        
        const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

        if (ua.includes('Mozilla')) {
            // --- 网页端：内部重写 (修正拼接 Bug) ---
            let newHeaders = {};
            for (let key in originalHeaders) {
                newHeaders[key.toLowerCase()] = originalHeaders[key];
            }
            const newAuthority = 'proxy-tf-all-ws.bilivideo.com';
            newHeaders['host'] = newAuthority;
            newHeaders['authority'] = newAuthority;
            
            // 关键修正：这里 path 只能传入相对路径
            $done({ 
                path: newPath,
                headers: newHeaders 
            });

        } else {
            // --- App 端：307 外部重定向 ---
            $done({
                status: "HTTP/1.1 307 Temporary Redirect",
                headers: {
                    "Location": newFullUrl
                }
            });
        }

    } catch (e) {
        console.log(`Bili CDN QX 脚本错误: ${e}`);
        $done({});
    }
}

run();
