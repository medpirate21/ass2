// Telegram WebApp utilities for Mini App integration
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
      // Initialize Telegram WebApp
      this.tg.ready();
      this.tg.expand();
      
      // Get user data
      this.user = this.tg.initDataUnsafe?.user || null;
      
      // Detect platform
      this.platform = this.detectPlatform();
      
      // Set theme
      this.setTheme();
      
      this.isReady = true;
      
      // Dispatch ready event
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
    if (this.tg?.platform) {
      return this.tg.platform;
    }
    
    // Fallback platform detection
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else if (userAgent.includes('android')) {
      return 'android';
    } else if (userAgent.includes('mac')) {
      return 'macos';
    } else if (userAgent.includes('win')) {
      return 'windows';
    }
    return 'unknown';
  }

  isIOS() {
    return this.platform === 'ios';
  }

  getUserId() {
    return this.user?.id || null;
  }

  getUser() {
    return this.user;
  }

  getPlatform() {
    return this.platform;
  }

  setTheme() {
    if (!this.tg) return;
    
    // Set Telegram WebApp theme
    const isDark = document.documentElement.classList.contains('dark');
    this.tg.setHeaderColor(isDark ? '#13151a' : '#4f3bc4');
    this.tg.setBackgroundColor(isDark ? '#13151a' : '#4f3bc4');
  }

  showAlert(message) {
    if (this.tg) {
      this.tg.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message, callback) {
    if (this.tg) {
      this.tg.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      callback(result);
    }
  }

  close() {
    if (this.tg) {
      this.tg.close();
    }
  }

  // Check if running in Telegram WebApp environment
  isTelegramWebApp() {
    return !!window.Telegram?.WebApp;
  }

  // Validate that the app is accessed through Telegram
  validateTelegramAccess() {
    if (!this.isTelegramWebApp()) {
      return false;
    }
    
    // Additional validation can be added here
    return true;
  }
}

// Create global instance
window.telegramWebApp = new TelegramWebApp();

// Export for module usage
export default TelegramWebApp;
