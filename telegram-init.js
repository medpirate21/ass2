// Telegram WebApp initialization script - extracted to reduce memory usage
class TelegramWebApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isReady = false;
    this.user = null;
    this.platform = null;
    
    if (this.tg) {
      this.init();
    }
  }

  init() {
    try {
      this.tg.ready();
      this.tg.expand();
      this.user = this.tg.initDataUnsafe?.user || null;
      this.platform = this.detectPlatform();
      this.setTheme();
      this.isReady = true;
      
      window.dispatchEvent(new CustomEvent('telegram-webapp-ready', {
        detail: {
          user: this.user,
          platform: this.platform,
          isIOS: this.isIOS()
        }
      }));
    } catch (error) {
      console.error('Telegram WebApp initialization failed:', error);
    }
  }

  detectPlatform() {
    if (this.tg?.platform) return this.tg.platform;
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('win')) return 'windows';
    return 'unknown';
  }

  isIOS() { return this.platform === 'ios'; }
  getUserId() { return this.user?.id || null; }
  getUser() { return this.user; }
  getPlatform() { return this.platform; }
  isTelegramWebApp() { return !!window.Telegram?.WebApp; }
  
  setTheme() {
    if (!this.tg) return;
    const isDark = document.documentElement.classList.contains('dark');
    this.tg.setHeaderColor(isDark ? '#13151a' : '#4f3bc4');
    this.tg.setBackgroundColor(isDark ? '#13151a' : '#4f3bc4');
  }

  showAlert(message) {
    if (this.tg) this.tg.showAlert(message);
    else alert(message);
  }

  close() { if (this.tg) this.tg.close(); }
}

// Platform Guard class
class PlatformGuard {
  constructor() {
    this.redirectUrl = window.APP_CONFIG?.REDIRECT_URL || 'https://t.me/Med';
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    await this.waitForTelegramWebApp();
    this.checkPlatformAccess();
    this.isInitialized = true;
  }

  waitForTelegramWebApp() {
    return new Promise((resolve) => {
      if (window.telegramWebApp?.isReady) {
        resolve();
        return;
      }
      
      const handleReady = () => {
        window.removeEventListener('telegram-webapp-ready', handleReady);
        resolve();
      };
      
      window.addEventListener('telegram-webapp-ready', handleReady);
      setTimeout(resolve, 3000);
    });
  }

  checkPlatformAccess() {
    const telegramApp = window.telegramWebApp;
    
    if (!telegramApp?.isTelegramWebApp()) {
      const platform = this.detectPlatformFallback();
      if (platform === 'ios' || platform === 'macos') {
        this.redirectToTelegram('Please access this app through Telegram');
      } else {
        this.redirectToDownload();
      }
      return;
    }

    const platform = telegramApp.getPlatform();
    if (platform !== 'ios' && platform !== 'macos') {
      this.redirectToDownload();
      return;
    }

    const userId = telegramApp.getUserId();
    if (!userId) {
      this.redirectToTelegram('Unable to verify user. Please restart the app from Telegram.');
      return;
    }

    this.storeUserData(telegramApp.getUser());
    console.log('Platform check passed - iOS/macOS user detected:', userId);
  }

  detectPlatformFallback() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('win')) return 'windows';
    return 'unknown';
  }

  redirectToDownload() {
    window.location.href = '/download';
  }

  redirectToTelegram(message) {
    if (window.telegramWebApp?.tg) {
      window.telegramWebApp.showAlert(message + '\n\nRedirecting to Telegram bot...');
      setTimeout(() => window.location.href = this.redirectUrl, 2000);
    } else {
      alert(message);
      window.location.href = this.redirectUrl;
    }
  }

  storeUserData(user) {
    if (user) {
      const telegramApp = window.telegramWebApp;
      const detectedPlatform = telegramApp?.getPlatform() || this.detectPlatformFallback();
      
      const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        platform: detectedPlatform,
        timestamp: Date.now()
      };
      
      localStorage.setItem('medoracle_user', JSON.stringify(userData));
      localStorage.setItem('telegram_user_id', user.id.toString());
      
      window.dispatchEvent(new CustomEvent('user-authenticated', {
        detail: userData
      }));
    }
  }

  getUserId() { return localStorage.getItem('telegram_user_id'); }
  getUser() {
    const userData = localStorage.getItem('medoracle_user');
    return userData ? JSON.parse(userData) : null;
  }
  isAuthenticated() { return !!this.getUserId(); }
}

// Initialize global instances
window.telegramWebApp = new TelegramWebApp();
window.platformGuard = new PlatformGuard();
