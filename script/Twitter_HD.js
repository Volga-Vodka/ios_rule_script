let body = $response.body;
if (body && body.includes("#EXT-X-STREAM-INF")) {
    let lines = body.split('\n');
    let newBody = "";
    let bestStreamInfo = "";
    let bestStreamUrl = "";
    let maxBandwidth = 0;
    
    // 1. 提取 m3u8 文件的基础头部信息（关键修复：增加保留 #EXT-X-MEDIA 音频轨标签）
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTM3U") || 
            lines[i].startsWith("#EXT-X-VERSION") || 
            lines[i].startsWith("#EXT-X-INDEPENDENT-SEGMENTS") || 
            lines[i].startsWith("#EXT-X-MEDIA")) { // 这里把声音留下了！
            newBody += lines[i] + "\n";
        }
    }

    // 2. 遍历所有视频流，读取 BANDWIDTH 数值，找出最大值
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
            let info = lines[i];
            let url = lines[i+1];
            
            let bandwidthMatch = info.match(/BANDWIDTH=(\d+)/);
            if (bandwidthMatch && bandwidthMatch.length > 1) {
                let bandwidth = parseInt(bandwidthMatch[1]);
                if (bandwidth > maxBandwidth) {
                    maxBandwidth = bandwidth;
                    bestStreamInfo = info;
                    bestStreamUrl = url;
                }
            }
        }
    }
    
    // 3. 将最高画质的流拼接到带有音频信息的头部后，返回给客户端
    if (bestStreamInfo) {
        newBody += bestStreamInfo + "\n" + bestStreamUrl + "\n";
        $done({ body: newBody });
    } else {
        $done({}); 
    }
} else {
    $done({}); 
}
