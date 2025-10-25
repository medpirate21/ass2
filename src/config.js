// Configuration file for API endpoints and external services
window.APP_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://misc-1.onrender.com',
  
  // External Services
  TELEGRAM_BOT_NAME: 'Med',
  
  // Media API Configuration
  MEDIA_API_BASE_URL: 'http://noods.ddnsfree.com',
  
  EDIA_API_BASE_URL: 'http://vid.ddnsfree.com',

  // Client-side encryption passphrase (change this in production!)
  ENCODE_PASSPHRASE: 'change-this-passphrase'
};

// Helper functions that use the config
window.APP_CONFIG.QUOTA_CHECK = (userid) => `${window.APP_CONFIG.API_BASE_URL}/quota/${userid}`;
window.APP_CONFIG.VIDEO_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/v`;
window.APP_CONFIG.NOTE_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/n`;
window.APP_CONFIG.USER_LOGIN = (userid) => `${window.APP_CONFIG.API_BASE_URL}/cuser/${userid}`;
window.APP_CONFIG.USER_REGISTER = (userid, username) => `${window.APP_CONFIG.API_BASE_URL}/nuser/${userid}/${username}`;
window.APP_CONFIG.TG_PLATFORM_CHECK = (userid, platform) => `${window.APP_CONFIG.API_BASE_URL}/tgcheck/${userid}/${platform}`;
window.APP_CONFIG.TELEGRAM_URL = `https://t.me/${window.APP_CONFIG.TELEGRAM_BOT_NAME}`;
window.APP_CONFIG.VIDEO_PLAYER_URL = (encodedId) => `${window.APP_CONFIG.EDIA_API_BASE_URL}?vid=${encodedId}`;
window.APP_CONFIG.NOTE_VIEWER_URL = (encodedId) => `${window.APP_CONFIG.MEDIA_API_BASE_URL}?nid=${encodedId}`;

// --- Encryption utilities (AES-GCM with PBKDF2) ---
(function(){
  const textEncoder = new TextEncoder();

  function toBase64Url(bytes) {
    let str = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
  }

  async function getHmacKey(secret) {
    const keyData = textEncoder.encode(secret);
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  }

  async function signHmacSha256(message, secret) {
    const key = await getHmacKey(secret);
    const sigBuf = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message));
    return new Uint8Array(sigBuf);
  }

  // Build Telegram start param from provided data object (signed, not encrypted)
  window.APP_CONFIG.BUILD_TG_START = async (dataObj) => {
    const json = JSON.stringify(dataObj);
    const sig = await signHmacSha256(json, window.APP_CONFIG.ENCODE_PASSPHRASE);
    const payload = `${toBase64Url(textEncoder.encode(json))}.${toBase64Url(sig)}`;
    return payload;
  };

  // Convenience: open Telegram bot with start param
  window.APP_CONFIG.OPEN_TG_WITH_START = async (dataObj) => {
    const start = await window.APP_CONFIG.BUILD_TG_START(dataObj);
    const url = `${window.APP_CONFIG.TELEGRAM_URL}?start=tg_${encodeURIComponent(start)}`;
    window.location.href = url;
  };
})();

