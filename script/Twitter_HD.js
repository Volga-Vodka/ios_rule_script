let body = $response.body;
if (body && body.includes("#EXT-X-STREAM-INF")) {
    let lines = body.split('\n');
    let newBody = "";
    let lastStreamInfo = "";
    let lastStreamUrl = "";
    
    // 遍历 m3u8 文件，保留头部信息，提取最后一个视频流（X 默认将最高画质排在最后）
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
            lastStreamInfo = lines[i];
            lastStreamUrl = lines[i+1];
        } else if (lines[i].startsWith("#EXTM3U") || lines[i].startsWith("#EXT-X-VERSION") || lines[i].startsWith("#EXT-X-INDEPENDENT-SEGMENTS")) {
            newBody += lines[i] + "\n";
        }
    }
    // 拼接最高画质的流信息
    newBody += lastStreamInfo + "\n" + lastStreamUrl + "\n";
    $done({ body: newBody });
} else {
    $done({});
}
