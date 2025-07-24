/*
 * @name  Bilibili 全量 CDN 替换（调试版）
 * @note  替换 dash.video/audio + durl 中的所有 CDN 域名，并打印替换统计
 */

let body = $response.body;
if (!body) return $done({});

try {
  let json = JSON.parse(body);
  const host = "upos-sz-estgoss.bilivideo.com";
  let vCount = 0, aCount = 0, dCount = 0;

  // DASH 视频
  if (json.data?.dash?.video) {
    json.data.dash.video.forEach(item => {
      if (item.baseUrl) {
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        vCount++;
      }
      if (item.backupUrl) {
        item.backupUrl = item.backupUrl.map(u => {
          vCount++;
          return u.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        });
      }
    });
    console.log(`🎬 DASH 视频链接已替换 ${vCount} 次`);
  }

  // DASH 音频
  if (json.data?.dash?.audio) {
    json.data.dash.audio.forEach(item => {
      if (item.baseUrl) {
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        aCount++;
      }
      if (item.backupUrl) {
        item.backupUrl = item.backupUrl.map(u => {
          aCount++;
          return u.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        });
      }
    });
    console.log(`🎵 DASH 音频链接已替换 ${aCount} 次`);
  }

  // 传统 durl（如果有的话）
  if (json.data?.durl) {
    json.data.durl.forEach(item => {
      if (item.url) {
        item.url = item.url.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        dCount++;
      }
      if (item.backup_url) {
        item.backup_url = item.backup_url.map(u => {
          dCount++;
          return u.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        });
      }
    });
    console.log(`📦 DURL 链接已替换 ${dCount} 次`);
  }

  $done({ body: JSON.stringify(json) });

} catch (err) {
  console.log("❌ 脚本执行出错：", err);
  $done({});
}
