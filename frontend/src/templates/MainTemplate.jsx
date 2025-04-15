import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainTemplate = () => {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6 ml-20">
        <Outlet />
      </div>
    </div>
  );
};

export default MainTemplate;