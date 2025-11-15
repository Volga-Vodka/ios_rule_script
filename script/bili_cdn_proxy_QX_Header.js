// 检查 $request 是否存在
if (typeof $request === 'undefined' || !$request.url) {
    $done({});
}

// V4 逻辑: 放行 OPTIONS
if ($request.method === 'OPTIONS') {
    $done({});
}

// 获取 UA
const originalHeaders = $request.headers;
const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

if (ua.includes('Mozilla')) {
    // --- 1. 是浏览器: 执行 V10 逻辑 (只修改 Header) ---
    // (URL 已经被上一个脚本改过了)
    let newHeaders = {};
    for (let key in originalHeaders) {
        newHeaders[key.toLowerCase()] = originalHeaders[key];
    }
    const newAuthority = 'proxy-tf-all-ws.bilivideo.com';
    newHeaders['host'] = newAuthority;
    newHeaders['authority'] = newAuthority;
    
    $done({ headers: newHeaders });

} else {
    // --- 2. 是 App (或未知): 执行 V3 逻辑 (307 外部重定向) ---
    // (URL 脚本没有修改 URL, 所以 $request.url 还是原 URL)
    const originalUrl = $request.url;
    
    // 避免无限循环 (虽然 App 端 V3 逻辑可能不需要, 但保险起见)
    try {
        const url = new URL(originalUrl);
        if (url.hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({}); 
            return;
        }
    } catch (e) {}

    const encodedUrl = encodeURIComponent(originalUrl);
    const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
    
    const response = {
        status: 307,
        headers: { 'Location': newUrl }
    };
    $done({ response: response });
}
