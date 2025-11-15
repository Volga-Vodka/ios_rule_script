// 检查 $request 是否存在
if (typeof $request !== 'undefined' && $request.url) {
    
    // 获取 UA
    const originalHeaders = $request.headers;
    const ua = originalHeaders['user-agent'] || originalHeaders['User-Agent'] || "";

    // V4 逻辑: OPTIONS 请求直接返回原 URL
    if ($request.method === 'OPTIONS') {
        $done($request.url); // 返回原 URL
    }
    // V12 逻辑: 只有 Web 端才修改 URL
    else if (ua.includes('Mozilla')) {
        const originalUrl = $request.url;
        const encodedUrl = encodeURIComponent(originalUrl);
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        $done(newUrl); // 返回新 URL
    } else {
        // App 端, 保持 URL 不变 (将由 Header 脚本处理)
        $done($request.url); // 返回原 URL
    }
} else {
    $done($request.url); // 异常, 返回原 URL
}
