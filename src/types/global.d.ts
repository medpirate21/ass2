// Global type declarations for custom window properties

interface LoginModal {
  show: () => void;
  hide: () => void;
  checkAuth: () => void;
}

interface AppConfig {
  API_BASE_URL: string;
  TELEGRAM_BOT_NAME: string;
  MEDIA_API_BASE_URL: string;
  EDIA_API_BASE_URL: string;
  ENCODE_PASSPHRASE?: string;
  QUOTA_CHECK: (userid: string) => string;
  VIDEO_QUOTA_DECREMENT: (userid: string) => string;
  NOTE_QUOTA_DECREMENT: (userid: string) => string;
  USER_LOGIN: (userid: string) => string;
  USER_REGISTER: (userid: string, username: string) => string;
  TG_PLATFORM_CHECK: (userid: string, platform: string) => string;
  TELEGRAM_URL: string;
  VIDEO_PLAYER_URL: (encodedId: string) => string;
  NOTE_VIEWER_URL: (encodedId: string) => string;
  BUILD_TG_START?: (dataObj: Record<string, any>) => Promise<string>;
  OPEN_TG_WITH_START?: (dataObj: Record<string, any>) => Promise<void>;
}

declare global {
  interface Window {
    loginModal?: LoginModal;
    APP_CONFIG: AppConfig;
  }
  
  // Fix for setTimeout/setInterval return types
  // In browser environments, these return numbers
  // In Node.js environments, these return Timeout objects
  type TimerId = number | NodeJS.Timeout;
}

export {};
