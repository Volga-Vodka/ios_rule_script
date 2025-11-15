/**
 * @fileoverview Bilibili CDN 代理脚本 (QX V3 - App 优先版)
 *
 * QX 无法实现 V12 (Web V10 + App V3) 的分流.
 * 本脚本只实现 V3 (307 重定向) 逻辑.
 * 这将 100% 修复 App 端, 但 Web 端会因 CORS 失败.
 */

function run() {
    // 检查 $request 是否存在
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); 
        return;
    }

    // (V4 逻辑) 放行CORS预检请求
    if ($request.method === 'OPTIONS') {
        $done({}); 
        return;
    }

    const originalUrl = $request.url;

    try {
        const url = new URL(originalUrl);

        // 避免无限循环
        if (url.hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({}); 
            return;
        }

        // --- (V3) 核心逻辑: 307 重定向 ---
        const encodedUrl = encodeURIComponent(originalUrl);
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        const response = {
            status: 307,
            headers: {
                'Location': newUrl
            }
        };
        $done({ response: response });

    } catch (e) {
        console.log(`Bili CDN V3-QX 脚本错误: ${e}`);
        $done({}); // 发生错误，放行原请求
    }
}

// 执行脚本
run();
