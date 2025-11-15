/**
 * bili_cdn_proxy_qx_compat.js
 * QuanX 兼容版 — 使用在 rewrite_local 的 "url script-request-header" 场景
 *
 * 功能：
 *  - 对 bilivideo / mcdn.bilivideo.cn 的媒体请求返回 307 重定向到 proxy-tf-all-ws.bilivideo.com/?url=ENCODED
 *  - 避免对 proxy-tf-all-ws.bilivideo.com 本身以及已经被封装的请求重复封装
 *  - 使用正则解析 host，兼容旧版 JS 环境（不使用 URL() 构造器）
 *
 * 使用方法（rewrite_local）:
 * ^https?:\/\/(?!proxy-tf-all-ws\.bilivideo\.com)[^\/]+\.bilivideo\.com\/ url script-request-header <RAW_SCRIPT_URL>
 */

if (typeof $request === 'undefined' || !$request.url) {
  $done({});
} else {
  try {
    var original = $request.url + '';
    var method = ($request.method || 'GET').toUpperCase();

    // 只处理 GET/HEAD 请求
    if (!(method === 'GET' || method === 'HEAD')) {
      $done({});
      return;
    }

    // 从 URL 中提取 host（兼容旧引擎）
    var hostMatch = original.match(/^https?:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
    var host = hostMatch ? hostMatch[1].toLowerCase() : '';

    // 放行 proxy 本身，避免循环
    if (host === 'proxy-tf-all-ws.bilivideo.com') {
      $done({});
      return;
    }

    // 仅处理 bilivideo 或 mcdn.bilivideo.cn 子域
    if (!/\.bilivideo\.com$/i.test(host) && !/\.mcdn\.bilivideo\.cn$/i.test(host)) {
      $done({});
      return;
    }

    // 若 URL 已经包含我们的 proxy 域或已经有 url= 参数，则放行（避免重复封装）
    if (original.indexOf('proxy-tf-all-ws.bilivideo.com') !== -1 || original.indexOf('url=') !== -1) {
      $done({});
      return;
    }

    // 只对常见媒体后缀或明显媒体路径进行处理（更保守）
    // 若你想放宽匹配，可移除 MEDIA_EXT_RE / PATH_HINT_RE 的相关判断
    var MEDIA_EXT_RE = /\.(m4s|mp4|m3u8|ts|flv|mp3|aac|m4a)(?:\?|$)/i;
    var PATH_HINT_RE = /(upos|iovip|bilivideo|bfs|player|playurl|video\/|audio\/)/i;
    if (!MEDIA_EXT_RE.test(original) && !PATH_HINT_RE.test(original)) {
      $done({});
      return;
    }

    // 构造重定向 URL（可在后面追加 token 做鉴权）
    var encoded = encodeURIComponent(original);
    var newUrl = 'https://proxy-tf-all-ws.bilivideo.com/?url=' + encoded;

    // 日志（便于在 QuanX Console 中排查）
    console.log('[bili_proxy] redirect:', original, '->', newUrl);

    $done({
      response: {
        status: 307,
        headers: {
          'Location': newUrl,
          'Cache-Control': 'no-cache'
        }
      }
    });
  } catch (e) {
    // 发生异常时放行，避免影响正常请求
    console.log('[bili_proxy] error:', String(e));
    $done({});
  }
}
