if ($response.statusCode != 200) {
    $done(null);
}
var body = $response.body;
var obj = JSON.parse(body);
var title = obj['country'];
var subtitle = obj['city'] + ' ' + obj['isp'];
var ip = obj['ip'];
var description =
    "国家" + ":" + obj['country'] +
    '\n' + "城市" + ":" + obj['city'] +
    '\n' + "运营商" + ":" + obj['isp'] +
    '\n' + "数据中心" + ":" + obj['organization'];
$done({
    title: title,
    subtitle: subtitle,
    ip: ip,
    description: description
});
