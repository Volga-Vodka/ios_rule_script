/**
 * @fileoverview Bilibili CDN 代理脚本 (V12 - V3/V10 智能分流版)
 *
 * (V11) 尝试为 App 端使用 V5 逻辑 (内部重写), 失败.
 * 您的反馈是正确的: "app端用v3即可".
 *
 * 最终结论:
 * 1. 网页端: 必须使用 V10 (内部重写 + 修正 authority)
 * 2. App 端: 必须使用 V3 (307 外部重定向)
 *
 * (V12) 解决方案: 智能分流
 * - 通过检查 User-Agent:
 * - 如果是 "Mozilla" (浏览器), 则执行 V10 逻辑.
 * - 如果是 App (bili-universal等), 则执行 V3 逻辑.
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
    const originalHeaders = $request.headers; // 原始请求头

    try {
        const url = new URL(originalUrl);

        // 避免无限循环
        if (url.hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({}); 
            return;
        }

        const encodedUrl = encodeURIComponent(originalUrl);
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // --- (V12) 关键修正: 智能分流 (V10 vs V3) ---
        
        // 获取 User-Agent (同时兼容大小写)
        const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

        if (ua.includes('Mozilla')) {
            // --- 1. 是浏览器: 执行 V10 逻辑 (内部重写 + 修正 authority) ---
            let newHeaders = {};
            
            for (let key in originalHeaders) {
                newHeaders[key.toLowerCase()] = originalHeaders[key];
            }

            const newAuthority = 'proxy-tf-all-ws.bilivideo.com';
            newHeaders['host'] = newAuthority;
            newHeaders['authority'] = newAuthority;
            
            $done({ 
                url: newUrl, 
                headers: newHeaders 
            });

        } else {
            // --- 2. 是 App (或未知): 执行 V3 逻辑 (307 外部重定向) ---
            const response = {
                status: 307,
                headers: {
                    'Location': newUrl
                }
            };
            $done({ response: response });
        }

    } catch (e) {
        console.log(`Bili CDN V12 脚本错误: ${e}`);
        $done({}); // 发生错误，放行原请求
    }
}

// 执行脚本
run();
