import { createSlice } from '@reduxjs/toolkit';

// Tài khoản mẫu
const mockUser = {
  auth: {
    uid: 'mock-user-id',
    auth_code: 'mock-auth-code'
  },
  house_id: 'mock-house-id',
  root_owner: true,
  name: 'Người dùng mẫu',
  age: 25,
  phone_number: '0123456789',
  email: 'mock@example.com',
  notifications: {
    total: 2,
    unread: 1,
    notices: [
      {
        id: '1',
        time: new Date().toISOString(),
        content: 'Chào mừng bạn đến với Smart House',
        read: true
      },
      {
        id: '2',
        time: new Date().toISOString(),
        content: 'Có thiết bị mới được thêm vào',
        read: false
      }
    ]
  }
};

const initialState = {
  auth: null,
  house_id: null,
  root_owner: false,
  name: '',
  age: null,
  phone_number: null,
  email: '',
  notifications: {
    total: 0,
    unread: 0,
    notices: []
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Nếu action.payload là 'mock', sử dụng tài khoản mẫu
      if (action.payload === 'mock') {
        return mockUser;
      }
      const { uid, own_house, root_owner, house_id, name, age, phone_number, email } = action.payload;
      return {
        ...state,
        auth: {
          uid,
          auth_code: localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).auth_code : null
        },
        house_id,
        root_owner,
        name: name || '',
        age: age || null,
        phone_number: phone_number || null,
        email: email || ''
      };
    },
    updateUserInfo: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.notices.find(
        (notice) => notice.id === action.payload
      );
      if (notification) {
        notification.read = true;
        state.notifications.unread--;
      }
    },
    logout: () => initialState
  }
});

export const {
  setUser,
  updateUserInfo,
  setNotifications,
  markNotificationAsRead,
  logout
} = userSlice.actions;

export default userSlice.reducer; 