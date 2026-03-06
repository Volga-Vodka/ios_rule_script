let body = $response.body;

// 1. 极速拦截：使用 indexOf 替代 includes (性能更好)，如果不是目标文件瞬间放行，不产生任何多余变量
if (!body || body.indexOf("#EXT-X-STREAM-INF") === -1) {
    $done({});
} else {
    let lines = body.split('\n');
    let headerLines = []; // 优化：使用数组暂存，彻底消灭字符串 += 拼接带来的内存碎片
    let bestStreamInfo = "";
    let bestStreamUrl = "";
    let maxBandwidth = 0;

    // 2. 单次遍历：将两次循环合并为一次，并缓存数组长度提高读取效率
    for (let i = 0, len = lines.length; i < len; i++) {
        let line = lines[i];
        
        // 收集音频和头部信息直接推入数组
        if (line.startsWith("#EXTM3U") || 
            line.startsWith("#EXT-X-VERSION") || 
            line.startsWith("#EXT-X-INDEPENDENT-SEGMENTS") || 
            line.startsWith("#EXT-X-MEDIA")) {
            headerLines.push(line);
        } 
        // 在同一次循环中比对画质
        else if (line.startsWith("#EXT-X-STREAM-INF")) {
            let match = line.match(/BANDWIDTH=(\d+)/);
            if (match) {
                // 指定 10 进制，防止 parseInt 隐式转换消耗性能
                let bw = parseInt(match[1], 10);
                if (bw > maxBandwidth) {
                    maxBandwidth = bw;
                    bestStreamInfo = line;
                    bestStreamUrl = (i + 1 < len) ? lines[i+1] : ""; // 防越界保护
                }
            }
        }
    }

    // 3. 终极拼装：使用 join 一次性生成最终文本，对内存极其友好
    if (bestStreamInfo) {
        headerLines.push(bestStreamInfo);
        headerLines.push(bestStreamUrl);
        $done({ body: headerLines.join('\n') + '\n' });
    } else {
        $done({});
    }
}
