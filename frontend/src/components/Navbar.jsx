import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import axios from 'axios';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const authData = JSON.parse(auth);
        await axios.post('http://localhost:3000/user/logout', {
          auth: authData
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('auth');
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-purple-600 flex flex-col items-center py-8 text-white">
      {/* Logo */}
      {/* <NavLink to="/dashboard" className="text-3xl mb-12">
        
      </NavLink> */}

      {/* Main Navigation */}
      <nav className="flex flex-col items-center space-y-8">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${
              isActive ? 'bg-white text-purple-600' : 'hover:bg-purple-500'
            }`
          }
        >
          <span className="text-2xl">🏠</span>
        </NavLink>

        <NavLink
          to="/devices"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${
              isActive ? 'bg-white text-purple-600' : 'hover:bg-purple-500'
            }`
          }
        >
          <span className="text-2xl">💡</span>
        </NavLink>

        <NavLink
          to="/sensors"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${
              isActive ? 'bg-white text-purple-600' : 'hover:bg-purple-500'
            }`
          }
        >
          <span className="text-2xl">🌡️</span>
        </NavLink>

        <NavLink
          to="/member"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${
              isActive ? 'bg-white text-purple-600' : 'hover:bg-purple-500'
            }`
          }
        >
          <span className="text-2xl">👥</span>
        </NavLink>


        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${
              isActive ? 'bg-white text-purple-600' : 'hover:bg-purple-500'
            }`
          }
        >
          <span className="text-2xl">⚙️</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl hover:bg-purple-500 transition-colors"
        >
          <span className="text-2xl">🚪</span>
        </button>
      </nav>
    </div>
  );
};

export default Navbar; 