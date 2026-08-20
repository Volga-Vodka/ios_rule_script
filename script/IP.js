if ($response.statusCode != 200) {
  $done(null);
}

var body = $response.body;
var obj = JSON.parse(body);

// 提取新 JSON 中的字段
var title = obj['country']; 
var subtitle = obj['city'] + ' ' + obj['isp'];
var ip = obj['ip']; // 新 API 获取 IP 的字段名是 'ip'
var description = "国家:" + obj['country'] + '\n' + 
                  "城市:" + obj['city'] + '\n' + 
                  "运营商:" + obj['isp'] + '\n' + 
                  "数据中心:" + obj['asn_organization']; // 使用 asn_organization 或 organization

$done({title, subtitle, ip, description});
