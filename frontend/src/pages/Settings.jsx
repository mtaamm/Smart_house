import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/slices/userSlice';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone_number: '',
    email: ''
  });
  const [houseData, setHouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user.auth) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      console.log('Bắt đầu tải dữ liệu người dùng...');
      
      // Kiểm tra xem user có tồn tại và có thông tin xác thực không
      if (!user || !user.uid || !user.auth_code) {
        console.log('Không tìm thấy thông tin xác thực, chuyển hướng đến trang đăng nhập');
        navigate('/login');
        return;
      }

      const auth = {
        uid: user.uid,
        auth_code: user.auth_code
      };

      const userResponse = await axios.get('http://localhost:3000/user/get', {
        data: {
          auth: auth
        }
      });
      console.log('Dữ liệu người dùng:', userResponse.data);
      
      if (!userResponse.data || userResponse.data.status !== 'successful') {
        throw new Error(userResponse.data?.message || 'Không thể tải thông tin người dùng');
      }

      const userData = userResponse.data.data;
      if (!userData) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      setFormData({
        name: userData.name || '',
        age: userData.age || '',
        phone_number: userData.phone_number || '',
        email: userData.email || ''
      });

      // Nếu user có house_id, lấy thông tin nhà
      if (userData.house_id) {
        console.log('Đang tải thông tin nhà...');
        try {
          const houseResponse = await axios.get(`http://localhost:3000/house/get-members?house_id=${userData.house_id}`, {
            data: {
              auth: auth
            }
          });
          console.log('Dữ liệu nhà:', houseResponse.data);
          if (houseResponse.data && houseResponse.data.status === 'successful') {
            setHouseData(houseResponse.data.data);
          }
        } catch (houseError) {
          console.error('Lỗi khi tải thông tin nhà:', houseError);
          // Không set error ở đây vì đây là thông tin phụ
        }
      }
      
      // Cập nhật thông tin người dùng trong Redux store
      dispatch(setUser({ ...user, ...userData }));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      if (error.response) {
        setError(`Lỗi: ${error.response.data?.message || 'Không thể tải thông tin người dùng'}`);
      } else if (error.request) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        setError('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      console.log('Kết thúc tải dữ liệu');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:3000/user/update', formData);
      // Cập nhật thông tin người dùng trong Redux store
      dispatch(setUser({ ...user, ...response.data }));
      setSuccess('Cập nhật thông tin thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Không thể cập nhật thông tin');
    }
  };

  const handleJoinHouse = async (e) => {
    e.preventDefault();
    try {
      const houseId = e.target.houseId.value;
      const response = await axios.post('http://localhost:3000/user/verify-house', {
        house_id: houseId
      });
      
      // Cập nhật house_id trong Redux store
      dispatch(setUser({ ...user, house_id: houseId }));
      
      // Lấy thông tin nhà mới
      const houseResponse = await axios.get(`http://localhost:3000/house/get-members?house_id=${houseId}`);
      if (houseResponse && houseResponse.data) {
        setHouseData(houseResponse.data);
      }
      
      setSuccess('Tham gia nhà thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Không thể tham gia nhà');
    }
  };

  const handleLeaveHouse = async () => {
    try {
      await axios.post('http://localhost:3000/house/delete-member', {
        house_id: user.house_id
      });
      
      // Cập nhật Redux store
      dispatch(setUser({ ...user, house_id: null }));
      setHouseData(null);
      
      setSuccess('Rời nhà thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Không thể rời nhà');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tuổi
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Cập nhật thông tin
              </button>
            </form>
          </div>

          {/* Quản lý nhà */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Quản lý nhà</h2>
            {houseData ? (
              <div>
                <h3 className="font-semibold mb-2">Thông tin nhà hiện tại</h3>
                <p>Tên nhà: {houseData.name}</p>
                <p>Địa chỉ: {houseData.address}</p>
                <p>Vai trò: {user.root_owner ? 'Chủ nhà' : 'Thành viên'}</p>
                <button
                  onClick={handleLeaveHouse}
                  className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                >
                  Rời nhà
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinHouse}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Mã nhà
                  </label>
                  <input
                    type="text"
                    name="houseId"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  Tham gia nhà
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 