export const API_CONFIG = {
  DEV_URL: 'http://localhost:8080',

  PROD_URL: 'https://auth.side.my.id',

  IS_PRODUCTION: true,
};

export const getBaseURL = (): string => {
  return API_CONFIG.IS_PRODUCTION ? API_CONFIG.PROD_URL : API_CONFIG.DEV_URL;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
  },

  USER: {
    PROFILE: '/api/v1/user/profile',
    CHANGE_PASSWORD: '/api/v1/user/change-password',
    DEACTIVATE: '/api/v1/user/deactivate',
    LOGOUT: '/api/v1/user/logout',
    REFRESH: '/api/v1/user/refresh',
  },

  ATTENDANCE: {
    CHECKIN: '/api/v1/attendance/checkin',
    CHECKOUT: '/api/v1/attendance/checkout',
    CHECK_STATUS: '/api/v1/attendance/today',
    HISTORY: '/api/v1/attendance/history',
    STATS: '/api/v1/attendance/stats',
  },
};

export const getFullURL = (endpoint: string): string => {
  return `${getBaseURL()}${endpoint}`;
};

export const API_CONFIG_HEADERS = {
  'Content-Type': 'application/json',
  'X-Admin-Override': 'DIMAS-ANJAY-MABAR',
};

export const getAuthHeaders = (token: string) => ({
  ...API_CONFIG_HEADERS,
  Authorization: `Bearer ${token}`,
});
