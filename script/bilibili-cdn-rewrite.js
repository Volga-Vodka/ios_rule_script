// 用于打印 JSON 结构和示例链接的调试脚本

let body = $response.body;
if (!body) return $done({});

// 解析 JSON
let json;
try {
  json = JSON.parse(body);
} catch (e) {
  console.log("❌ JSON 解析失败：", e);
  return $done({});
}

// 打印 data 级别的顶级字段
console.log("📦 data keys:", Object.keys(json.data || {}));

// 如果有 dash，打印 dash 的字段
if (json.data?.dash) {
  console.log("📦 dash keys:", Object.keys(json.data.dash));

  // 如果有 video 数组，打印第一个元素的字段名和示例 URL
  if (Array.isArray(json.data.dash.video) && json.data.dash.video.length > 0) {
    const v0 = json.data.dash.video[0];
    console.log("🎬 video[0] keys:", Object.keys(v0));
    console.log("🎬 video[0] URL:", v0.baseUrl || v0.BaseUrl || v0.url || "（未找到字段）");
  }

  // 如果有 audio 数组，打印第一个元素的字段名和示例 URL
  if (Array.isArray(json.data.dash.audio) && json.data.dash.audio.length > 0) {
    const a0 = json.data.dash.audio[0];
    console.log("🎵 audio[0] keys:", Object.keys(a0));
    console.log("🎵 audio[0] URL:", a0.baseUrl || a0.BaseUrl || a0.url || "（未找到字段）");
  }
}

// 如果有 durl，打印第一个元素的字段名和示例 URL
if (Array.isArray(json.data.durl) && json.data.durl.length > 0) {
  const d0 = json.data.durl[0];
  console.log("📦 durl[0] keys:", Object.keys(d0));
  console.log("📦 durl[0] URL:", d0.url || d0.Url || "（未找到字段）");
}

$done({ body });
