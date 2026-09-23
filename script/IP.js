if ($response.statusCode != 200) {
    $done(null);
}
var body = $response.body;
var obj = JSON.parse(body);
// 对应新的 API 字段
var title = obj['country'];
var subtitle = obj['city'] + ' ' + obj['isp'];
var ip = obj['ip'];
var description =
    "国家:" + obj['country'] + '\n' + "城市:" + obj['city'] + '\n' + "运营商:" + obj['isp'] + '\n' + "数据中心:" + obj['organization'];
// Quantumult X 节点信息显示
$done({
    title: title,
    subtitle: subtitle,
    ip: ip,
    description: description
});
