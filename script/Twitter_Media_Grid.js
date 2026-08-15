let body = $response.body;

try {
    if (body && typeof body === 'string') {
        body = body.replace(
            /"responsive_web_profile_redesign_enabled"\s*:\s*\{\s*"value"\s*:\s*true\s*\}/g,
            '"responsive_web_profile_redesign_enabled":{"value":false}'
        );
        
        body = body.replace(
            /"rweb_media_carousel_enabled"\s*:\s*\{\s*"value"\s*:\s*true\s*\}/g,
            '"rweb_media_carousel_enabled":{"value":false}'
        );
    }
} catch (e) {
    console.log("X Media Grid Restore error: " + e);
}

$done({ body });
