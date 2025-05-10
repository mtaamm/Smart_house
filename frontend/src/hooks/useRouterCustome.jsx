
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { setUser } from '../redux/slices/userSlice';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Devices from '../pages/Devices';
import Sensors from '../pages/Sensors';
import Settings from '../pages/Settings';
import Member from '../pages/Member';
import MainTemplate from '../templates/MainTemplate';


const useRouterCustome = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = localStorage.getItem('auth');
      if (auth && !user.auth) {
        try {
          const authData = JSON.parse(auth);
          const userInfoResponse = await axios.get('http://localhost:3000/user/get', {
            params: {
              uid: authData.uid,
              auth_code: authData.auth_code
            }
          });
          
          if (userInfoResponse.data.status === 'successful') {
            const userInfo = userInfoResponse.data.data;
            dispatch(setUser({
              uid: authData.uid,
              own_house: !!userInfo.house_id,
              root_owner: userInfo.root_owner,
              house_id: userInfo.house_id,
              name: userInfo.name,
              age: userInfo.age,
              phone_number: userInfo.phone_number,
              email: userInfo.email
            }));
          }
        } catch (error) {
          console.error('Error auto-login:', error);
          localStorage.removeItem('auth');
        }
      }
    };

    checkAuth();
  }, [dispatch, user.auth]);

  const PrivateRoute = ({ children }) => {
    const auth = localStorage.getItem("auth");
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
