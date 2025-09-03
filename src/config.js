// Configuration file for API endpoints and external services
window.APP_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://misc-1.onrender.com',
  
  // External Services
  TELEGRAM_BOT_NAME: 'Med',
  
  // Media API Configuration
  MEDIA_API_BASE_URL: 'http://noods.ddnsfree.com',
  EDIA_API_BASE_URL: 'http://vid.ddnsfree.com',

  // Telegram Mini App Configuration
  TELEGRAM_WEBAPP_URL: 'https://telegram.org/js/telegram-web-app.js',
  REDIRECT_URL: 'https://t.me/Med',
  PLATFORM_RESTRICTION: 'ios', // Only allow iOS users
  
  // Mini App Settings
  MINI_APP_SETTINGS: {
    expandOnInit: true,
    enableClosingConfirmation: false,
    headerColor: '#4f3bc4',
    backgroundColor: '#4f3bc4'
  }
};

// Helper functions that use the config
window.APP_CONFIG.QUOTA_CHECK = (userid) => `${window.APP_CONFIG.API_BASE_URL}/quota/${userid}`;
window.APP_CONFIG.VIDEO_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/v`;
window.APP_CONFIG.NOTE_QUOTA_DECREMENT = (userid) => `${window.APP_CONFIG.API_BASE_URL}/dquota/${userid}/n`;
window.APP_CONFIG.TELEGRAM_URL = `https://t.me/${window.APP_CONFIG.TELEGRAM_BOT_NAME}`;
window.APP_CONFIG.VIDEO_PLAYER_URL = (encodedId) => `${window.APP_CONFIG.EDIA_API_BASE_URL}?vid=${encodedId}`;
window.APP_CONFIG.NOTE_VIEWER_URL = (encodedId) => `${window.APP_CONFIG.MEDIA_API_BASE_URL}?nid=${encodedId}`;

// Telegram Mini App helper functions
window.APP_CONFIG.getTelegramUserId = () => {
  return localStorage.getItem('telegram_user_id') || window.telegramWebApp?.getUserId();
};

window.APP_CONFIG.getTelegramUser = () => {
  const userData = localStorage.getItem('medoracle_user');
  return userData ? JSON.parse(userData) : window.telegramWebApp?.getUser();
};

window.APP_CONFIG.isIOSUser = () => {
  return window.telegramWebApp?.isIOS() || false;
};

window.APP_CONFIG.isTelegramMiniApp = () => {
  return window.telegramWebApp?.isTelegramWebApp() || false;
};
