function getDeepLink(socialId, url, isAppleDevice) {
  if (!url) return "";
  
  // Clean URL to extract username
  let username = "";
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    username = pathParts[0] || "";
    if (socialId === "whatsapp") {
      const searchParams = urlObj.searchParams;
      const phone = urlObj.pathname.replace('/', '') || searchParams.get('phone');
      if (phone) return `whatsapp://send?phone=${phone}`;
    }
  } catch (e) {
    // If invalid URL, assume they pasted just the username
    username = url.replace('@', '');
  }

  // Deep link mappings based on device
  switch (socialId) {
    case "instagram":
      if (username) return isAppleDevice ? `instagram://user?username=${username}` : `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end`;
      break;
    case "x":
    case "twitter":
      if (username) return isAppleDevice ? `twitter://user?screen_name=${username}` : `intent://twitter.com/${username}#Intent;package=com.twitter.android;scheme=https;end`;
      break;
    case "linkedin":
      if (username) return isAppleDevice ? `linkedin://profile/${username}` : `intent://linkedin.com/in/${username}#Intent;package=com.linkedin.android;scheme=https;end`;
      break;
    case "facebook":
      if (username) return isAppleDevice ? `fb://profile/${username}` : `intent://facebook.com/${username}#Intent;package=com.facebook.katana;scheme=https;end`;
      break;
    case "tiktok":
      if (username) return isAppleDevice ? `snssdk1233://user/profile/${username}` : `intent://tiktok.com/@${username}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`;
      break;
    case "youtube":
      if (username) return isAppleDevice ? `youtube://www.youtube.com/${username}` : `intent://youtube.com/${username}#Intent;package=com.google.android.youtube;scheme=https;end`;
      break;
  }
  
  // Fallback to web URL
  return url.startsWith("http") ? url : `https://${url}`;
}
