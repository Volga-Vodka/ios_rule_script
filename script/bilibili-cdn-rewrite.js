// 强力调试：打印根字段、data 字段、及前 200 字符的 body 片段

let body = $response.body;
if (!body) {
  console.log("⚠️ body 为空");
  $done({});
}

// 打印 body 前 200 字符，帮助确认接口返回到底是什么
console.log("🔍 body snippet:", body.substring(0, 200).replace(/\n/g, ""));

let json;
try {
  json = JSON.parse(body);
} catch (e) {
  console.log("❌ JSON 解析失败：", e);
  $done({});
}

// 打印根层字段
console.log("🏷️ root keys:", Object.keys(json));

// 如果存在 result 字段，也打印其子键
if (json.result && typeof json.result === "object") {
  console.log("🏷️ result keys:", Object.keys(json.result));
}

// 打印 data 层字段（如果有）
if (json.data && typeof json.data === "object") {
  console.log("🏷️ data keys:", Object.keys(json.data));
}

$done({ body });
