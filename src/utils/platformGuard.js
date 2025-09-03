// Platform guard for iOS-only access
class PlatformGuard {
  constructor() {
    this.redirectUrl = 'https://t.me/Med'; // Your Telegram bot URL
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    // Wait for Telegram WebApp to be ready
    await this.waitForTelegramWebApp();
    
    // Check platform and redirect if necessary
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
      
      // Fallback timeout
      setTimeout(resolve, 3000);
    });
  }

  checkPlatformAccess() {
    const telegramApp = window.telegramWebApp;
    
    // Check if running in Telegram WebApp
    if (!telegramApp?.isTelegramWebApp()) {
      this.redirectToTelegram('Please access this app through Telegram');
      return;
    }

    // Check if user is on iOS
    if (!telegramApp.isIOS()) {
      this.redirectToTelegram('This app is only available for iOS users. Please use our Telegram bot instead.');
      return;
    }

    // Check if user data is available
    const userId = telegramApp.getUserId();
    if (!userId) {
      this.redirectToTelegram('Unable to verify user. Please restart the app from Telegram.');
      return;
    }

    // Store user data for the app
    this.storeUserData(telegramApp.getUser());
    
    // Platform check passed
    console.log('Platform check passed - iOS user detected:', userId);
  }

  redirectToTelegram(message) {
    // Show message using Telegram WebApp if available, otherwise alert
    if (window.telegramWebApp?.tg) {
      window.telegramWebApp.showAlert(message + '\n\nRedirecting to Telegram bot...');
      setTimeout(() => {
        window.location.href = this.redirectUrl;
      }, 2000);
    } else {
      alert(message);
      window.location.href = this.redirectUrl;
    }
  }

  storeUserData(user) {
    if (user) {
      // Store Telegram user data
      const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        platform: 'ios',
        timestamp: Date.now()
      };
      
      localStorage.setItem('medoracle_user', JSON.stringify(userData));
      localStorage.setItem('telegram_user_id', user.id.toString());
      
      // Dispatch user ready event
      window.dispatchEvent(new CustomEvent('user-authenticated', {
        detail: userData
      }));
    }
  }

  getUserId() {
    return localStorage.getItem('telegram_user_id');
  }

  getUser() {
    const userData = localStorage.getItem('medoracle_user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated() {
    return !!this.getUserId();
  }
}

// Create global instance
window.platformGuard = new PlatformGuard();

export default PlatformGuard;
