// Configuration file for API endpoints and external services
window.APP_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://misc-1.onrender.com',
  
  // External Services
  TELEGRAM_BOT_NAME: 'Med',
  
  // Media API Configuration
  MEDIA_API_BASE_URL: 'http://noods.ddnsfree.com',

  
  EDIA_API_BASE_URL: 'http://vid.ddnsfree.com',


};

// Helper functions that use the config
window.APP_CONFIG.QUOTA_CHECK = (userid) => `${window.APP_CONFIG.API_BASE_URL}/quota/${userid}`;
window.APP_CONFIG.VIDEO_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/v`;
window.APP_CONFIG.NOTE_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/n`;
window.APP_CONFIG.USER_LOGIN = (userid) => `${window.APP_CONFIG.API_BASE_URL}/cuser/${userid}`;
window.APP_CONFIG.TELEGRAM_URL = `https://t.me/${window.APP_CONFIG.TELEGRAM_BOT_NAME}`;
window.APP_CONFIG.VIDEO_PLAYER_URL = (encodedId) => `${window.APP_CONFIG.EDIA_API_BASE_URL}?vid=${encodedId}`;
window.APP_CONFIG.NOTE_VIEWER_URL = (encodedId) => `${window.APP_CONFIG.MEDIA_API_BASE_URL}?nid=${encodedId}`;
