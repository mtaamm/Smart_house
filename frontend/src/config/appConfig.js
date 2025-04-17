// Cấu hình API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    GET_MAP: '/house/getmap',
    UPDATE: '/house/update',
    SAVE_MAP: '/house/savemap'
  }
};

// Cấu hình người dùng và nhà
export const USER_CONFIG = {
  UID: '90709bb0-814b-4e32-b8be-9819f0617a26',
  HOUSE_ID: 'e0f1ba9c-aa1d-452e-b928-d2cc3c5eedf6'
};

// Cấu hình mặc định cho các phần tử
export const DEFAULT_CONFIG = {
  FLOOR_ID: 1,
  DEFAULT_COLORS: {
    ROOM: '0000ff',
    DEVICE: 'ff0000',
    SENSOR: '00ff00'
  }
}; 