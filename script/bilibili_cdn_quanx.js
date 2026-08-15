/**
 * Bilibili CDN Proxy - Quantumult X V12
 *
 * Web:
 *   使用 307，但确保代理参数是完整绝对 URL
 *
 * App:
 *   使用原 V3 307
 *
 * 额外处理：
 *   - 防止 proxy-tf-all-ws 二次嵌套
 *   - 防止 HTTPDNS / IP 探测被代理
 *   - 正确处理 //host/path
 *   - 保留原始 query
 */

function done() {
    $done({});
}

function run() {

    if (typeof $request === 'undefined' || !$request.url) {
        done();
        return;
    }

    const originalUrl = $request.url;
    const headers = $request.headers || {};

    /*
     * ------------------------------------------------------------
     * 1. 不处理已经进入代理服务器的请求
     * ------------------------------------------------------------
     */
    try {
        const current = new URL(originalUrl);

        if (
            current.hostname === 'proxy-tf-all-ws.bilivideo.com'
        ) {
            done();
            return;
        }
    } catch (e) {
        // 某些 QX 请求可能出现协议相对 URL
    }

    /*
     * ------------------------------------------------------------
     * 2. HTTPDNS / DNS 探测 / IP 探测直接放行
     * ------------------------------------------------------------
     */
    if (
        originalUrl.includes('httpdns.bilivideo.com') ||
        originalUrl.includes('/resolve?') ||
        originalUrl.includes('203.119.206.8')
    ) {
        done();
        return;
    }

    /*
     * ------------------------------------------------------------
     * 3. OPTIONS 不处理
     * ------------------------------------------------------------
     */
    if ($request.method === 'OPTIONS') {
        done();
        return;
    }

    /*
     * ------------------------------------------------------------
     * 4. 把协议相对 URL 转成绝对 URL
     *
     * B站网页可能出现：
     *
     *   //cn-xxx.bilivideo.com/...
     *
     * encodeURIComponent("//...")
     *
     * 会导致 proxy 收到：
     *
     *   url=//cn-xxx...
     *
     * 所以这里明确补 https://
     * ------------------------------------------------------------
     */

    let targetUrl = originalUrl;

    if (targetUrl.indexOf('//') === 0) {
        targetUrl = 'https:' + targetUrl;
    }

    /*
     * ------------------------------------------------------------
     * 5. 只允许真正的 Bilibili CDN 进入代理
     *
     * 这样即使 rewrite 匹配范围以后扩大，
     * data.bilibili.com / api.bilibili.com 也不会被代理。
     * ------------------------------------------------------------
     */

    let targetHost = '';

    try {
        targetHost = new URL(targetUrl).hostname.toLowerCase();
    } catch (e) {
        done();
        return;
    }

    const isBiliVideo =
        targetHost.endsWith('.bilivideo.com') ||
        targetHost.endsWith('.mcdn.bilivideo.cn');

    if (!isBiliVideo) {
        done();
        return;
    }

    /*
     * ------------------------------------------------------------
     * 6. 生成代理 URL
     * ------------------------------------------------------------
     */

    const encodedUrl = encodeURIComponent(targetUrl);

    const proxyUrl =
        'https://proxy-tf-all-ws.bilivideo.com/?url=' +
        encodedUrl;

    /*
     * ------------------------------------------------------------
     * 7. UA 判断
     * ------------------------------------------------------------
     */

    const ua =
        headers['user-agent'] ||
        headers['User-Agent'] ||
        '';

    const isWeb = /Mozilla/i.test(ua);

    /*
     * ------------------------------------------------------------
     * 8. Web
     *
     * 不再尝试 QX 的：
     *
     *   $done({
     *       path: ...,
     *       headers: ...
     *   })
     *
     * 因为它不能像 Loon 的 url 重写那样可靠地改变
     * 底层目标主机。
     *
     * 直接让浏览器重新请求代理 URL。
     * ------------------------------------------------------------
     */

    if (isWeb) {

        $done({
            response: {
                status: 307,
                headers: {
                    'Location': proxyUrl,
                    'Cache-Control': 'no-store'
                }
            }
        });

        return;
    }

    /*
     * ------------------------------------------------------------
     * 9. App
     *
     * 保留 V3 行为
     * ------------------------------------------------------------
     */

    $done({
        response: {
            status: 307,
            headers: {
                'Location': proxyUrl
            }
        }
    });
}

run();
