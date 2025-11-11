// loon-mcdn-request.js
// 请求阶段：若 hostname 包含 mcdn.bilivideo.com，则先做 HostSwap（保留 path & query）
// 返回修改过的 url（让请求直接到 proxy-tf-all-ws.bilivideo.com）
// 同时在 headers 中写入 X-Original-Host 以防代理需要原始 host（可选）

(function() {
  const req = $request;
  if (!req || !req.url) return $done({}); // 非脚本环境保护

  try {
    const urlObj = new URL(req.url);
    const host = urlObj.hostname || '';
    if (!/(\.|^)mcdn\.bilivideo\.com$/i.test(host)) {
      // 非 mcdn 链接，不处理
      return $done({});
    }

    // 1) 生成 HostSwap 版本
    const hostSwapUrl = new URL(req.url);
    hostSwapUrl.hostname = 'proxy-tf-all-ws.bilivideo.com';
    const newUrl = hostSwapUrl.toString();

    // 2) 修改请求并保留 Range/Referer 等 header（尽量不删除原有 header）
    const headers = Object.assign({}, req.headers);
    // 附带原始 host 以便 proxy 内部解析（部分 proxy 可能需要）
    headers['X-Original-Host'] = host;

    // 返回改写后的请求
    $done({
      url: newUrl,
      headers: headers
    });
  } catch (e) {
    // 脚本异常则放行原请求
    $done({});
  }
})();
