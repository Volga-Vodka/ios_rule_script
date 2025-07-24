// Quantumult X: bilibili CDN 替换脚本
// 脚本类型：script-response-body
// 配合 Rewrite 和 MITM 使用
// 匹配 URL: https://api.bilibili.com/x/player/wbi/playurl*

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);
  const replaceHost = "upos-sz-estgoss.bilivideo.com";

  // 替换 DASH 视频 CDN
  if (obj?.data?.dash?.video) {
    obj.data.dash.video.forEach(item => {
      if (item.baseUrl) {
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`);
      }
      if (item.backupUrl && Array.isArray(item.backupUrl)) {
        item.backupUrl = item.backupUrl.map(url => url.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`));
      }
    });
  }

  // 替换 DASH 音频 CDN
  if (obj?.data?.dash?.audio) {
    obj.data.dash.audio.forEach(item => {
      if (item.baseUrl) {
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`);
      }
      if (item.backupUrl && Array.isArray(item.backupUrl)) {
        item.backupUrl = item.backupUrl.map(url => url.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`));
      }
    });
  }

  // 替换 DURL 模式（如存在）
  if (obj?.data?.durl) {
    obj.data.durl.forEach(item => {
      if (item.url) {
        item.url = item.url.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`);
      }
      if (item.backup_url && Array.isArray(item.backup_url)) {
        item.backup_url = item.backup_url.map(url => url.replace(/https?:\/\/[^\/]+/, `https://${replaceHost}`));
      }
    });
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("💥 Bilibili CDN 替换失败：" + e.message);
  $done({});
}

