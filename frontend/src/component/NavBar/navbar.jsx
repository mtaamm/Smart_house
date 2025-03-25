import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, LayoutGrid, Lamp, Shield, MapPin, Users, BarChart3, LogOut } from "lucide-react";

export default function NavigationBar() {
  const [activeItem, setActiveItem] = useState("home");

  const menuItems = [
    { id: "home", icon: Home, to: "/" },
    { id: "dashboard", icon: LayoutGrid, to: "/dashboard" },
    { id: "lighting", icon: Lamp, to: "/lighting" },
    { id: "security", icon: Shield, to: "/security" },
    { id: "location", icon: MapPin, to: "/location" },
    { id: "users", icon: Users, to: "/users" },
    { id: "analytics", icon: BarChart3, to: "/analytics" },
    { id: "logout", icon: LogOut, to: "/logout" },
  ];

  return (
    <div className="w-24 bg-purple-600 flex flex-col items-center py-6 space-y-8 h-full fixed left-0 top-0">
      <div className="flex flex-col items-center space-y-8">
        {menuItems.slice(0, 7).map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            to={item.to}
            isActive={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center">
        <NavItem
          icon={menuItems[7].icon}
          to={menuItems[7].to}
          isActive={activeItem === menuItems[7].id}
          onClick={() => setActiveItem(menuItems[7].id)}
        />
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, to, isActive, onClick }) {
  return (
    <Link
      to={to}
      className={`${isActive ? 'bg-white' : 'text-white'} p-3 rounded-lg`}
      onClick={onClick}
    >
      <Icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : ''}`} />
    </Link>
  );
}