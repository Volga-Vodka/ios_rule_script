/**
 * @fileoverview Bilibili CDN 代理脚本 (V3 - 最终修正版)
 *
 * 1. 修正了无限循环：
 * 使用 URL() 对象精确判断 hostname，
 * 确保对 proxy-tf-all-ws.bilivideo.com 的请求被正确放行。
 * 2. 依赖 [MITM] 中添加 `hostname = *.bilivideo.com`。
 */

function run() {
    // 检查 $request 是否存在
    if (typeof $request === 'undefined' || !$request.url) {
        $done({}); // 环境异常，直接放行
        return;
    }

    const originalUrl = $request.url;

    try {
        // 使用 URL() 构造函数来解析 URL
        const url = new URL(originalUrl);

        // --- 关键修正 ---
        // 精确判断当前请求的域名 (hostname)
        // 如果是代理服务器本身，则必须直接放行
        if (url.hostname === 'proxy-tf-all-ws.bilivideo.com') {
            $done({}); // 放行，不做任何修改
            return;
        }

        // --- 原始逻辑 ---
        // 1. 对原始 URL 进行完整的 URL 编码
        const encodedUrl = encodeURIComponent(originalUrl);
        
        // 2. 构建你指定的目标 URL
        const newUrl = `https://proxy-tf-all-ws.bilivideo.com/?url=${encodedUrl}`;
        
        // 3. 创建一个 307 (临时重定向) 响应
        const response = {
            status: 307,
            headers: {
                'Location': newUrl
            }
        };
        
        // 4. 使用 $done() 返回这个重定向响应
        $done({ response: response });

    } catch (e) {
        console.log(`Bili CDN 脚本错误: ${e}`);
        $done({}); // 解析URL失败或发生其他错误，直接放行
    }
}

// 执行脚本
run();
