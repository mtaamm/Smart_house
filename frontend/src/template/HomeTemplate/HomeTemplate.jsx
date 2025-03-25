import React from "react";
import NavigationBar from "../../component/NavBar/navbar.jsx"; // Use default export
import { Outlet } from "react-router-dom";

const HomeTemplate = () => {
  return (
    <div>
      <NavigationBar />
      <div className="mb-11">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeTemplate;
