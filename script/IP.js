if ($response.statusCode != 200) {
  $done(null); // 注意：JavaScript 区分大小写，原代码中的 Null 建议改为标准的 null
}

var body = $response.body;
var obj = JSON.parse(body);

// 第一行显示：国家 (例如: United States)
var title = obj['country'];

// 第二行显示：城市 + 运营商 (例如: San Bruno Verizon 5G Home)
var subtitle = obj['city'] + ' ' + obj['isp'];

// 获取 IP（新 API 字段为 ip）
var ip = obj['ip'];

// 详细信息面板内容（新 API 字段 org 变为 organization 或 asn_organization）
var description = "国家:" + obj['country'] + '\n' + 
                  "城市:" + obj['city'] + '\n' + 
                  "运营商:" + obj['isp'] + '\n' + 
                  "数据中心:" + obj['organization'];

// 将结果输出给 Quantumult X 面板
$done({
    title: title,
    subtitle: subtitle,
    ip: ip,
    content: description 
});
