// Debug 脚本：任何 response 都打印一次日志
console.log("🛠️ Debug 脚本已执行，URL：", $request.url);
$done({});  // 不修改 body
