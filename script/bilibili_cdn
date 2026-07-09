/**
 * @fileoverview Bilibili CDN 代理脚本 (Loon 全端 307 终极版)
 * 核心：彻底放弃内部重写，全端强制 307 外部重定向。
 * 附加：完美防嵌套死循环、精准阻断 HTTPDNS。
 */

function run() {
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    // 1. 【防嵌套防御】遇到代理域名本身，直接放行
    if (originalUrl.includes('proxy-tf-all-ws.bilivideo.com')) {
        $done({}); 
        return;
    }

    // 2. 【防降级探测防御】遇到 HTTPDNS，直接放行 (交给阻断脚本或规则处理)
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

    try {
        const encodedUrl = encodeURIComponent(originalUrl);
        const newFullUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // --- 终极解法：无视客户端，全部下发 307 重定向！ ---
        const response = {
            status: 307,
            headers: {
                'Location': newFullUrl
            }
        };
        $done({ response: response });

    } catch (e) {
        console.log(`Bili CDN Loon 脚本错误: ${e}`);
        $done({});
    }
}

run();
