import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Devices from '../pages/Devices';
import Sensors from '../pages/Sensors';
import Settings from '../pages/Settings';
import Member from '../pages/Member';
import MainTemplate from '../templates/MainTemplate';

const useRouterCustome = () => {
  const user = useSelector((state) => state.user);

  const PrivateRoute = ({ children }) => {
    const auth = localStorage.getItem('auth');
    return auth ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainTemplate />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="devices" element={<Devices />} />
        <Route path="sensors" element={<Sensors />} />
        <Route path="settings" element={<Settings />} />
        <Route path="member" element={<Member />} />
      </Route>
    </Routes>
  );
};

export default useRouterCustome;