/*
 * @name  Bilibili 全量 CDN 替换（调试版）
 * @note  替换 dash.video/audio + durl 中的所有 CDN 域名，并打印替换统计
 */
console.log("🚀 正式替换脚本已执行，当前 URL：", $request.url);

/

let body = $response.body;
if (!body) return $done({});

try {
  let json = JSON.parse(body);
  const host = "upos-sz-estgoss.bilivideo.com";

  // 记录样例
  let firstVideoOld = null, firstVideoNew = null;
  let firstAudioOld = null, firstAudioNew = null;

  // 替换 DASH 视频
  if (json.data?.dash?.video) {
    json.data.dash.video.forEach((item, idx) => {
      if (item.baseUrl) {
        if (idx === 0) firstVideoOld = item.baseUrl;
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        if (idx === 0) firstVideoNew = item.baseUrl;
      }
      if (item.backupUrl) {
        item.backupUrl = item.backupUrl.map(u =>
          u.replace(/https?:\/\/[^\/]+/, `https://${host}`)
        );
      }
    });
    console.log("🎬 video[0] before:", firstVideoOld);
    console.log("🎬 video[0]  after:", firstVideoNew);
  }

  // 替换 DASH 音频
  if (json.data?.dash?.audio) {
    json.data.dash.audio.forEach((item, idx) => {
      if (item.baseUrl) {
        if (idx === 0) firstAudioOld = item.baseUrl;
        item.baseUrl = item.baseUrl.replace(/https?:\/\/[^\/]+/, `https://${host}`);
        if (idx === 0) firstAudioNew = item.baseUrl;
      }
      if (item.backupUrl) {
        item.backupUrl = item.backupUrl.map(u =>
          u.replace(/https?:\/\/[^\/]+/, `https://${host}`)
        );
      }
    });
    console.log("🎵 audio[0] before:", firstAudioOld);
    console.log("🎵 audio[0]  after:", firstAudioNew);
  }

  $done({ body: JSON.stringify(json) });

} catch (e) {
  console.log("❌ 脚本出错：", e);
  $done({});
}
