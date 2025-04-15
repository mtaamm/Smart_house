import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.auth) {
      navigate('/login');
      return;
    }

    if (!user.house_id) {
      setError('Bạn chưa được thêm vào nhà nào. Vui lòng liên hệ với chủ nhà để được thêm vào.');
      setLoading(false);
      return;
    }

    fetchDevices();
  }, [user, navigate]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('http://localhost:3000/device/getlist', {
        params: {
          uid: user.auth.uid,
          house_id: user.house_id
        }
      });
      
      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Có lỗi xảy ra khi tải danh sách thiết bị');
        setDevices([]);
        return;
      }

      const devicesData = response.data?.data || [];
      
      if (devicesData.length === 0) {
        setError('Không tìm thấy thiết bị nào trong nhà của bạn');
      }
      
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDevice = async (deviceId) => {
    try {
      const response = await axios.post('http://localhost:3000/device/control', {
        uid: user.auth.uid,
        house_id: user.house_id,
        device_id: deviceId,
        action: 'toggle'
      });

      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Không thể điều khiển thiết bị');
        return;
      }

      fetchDevices(); // Refresh device list
    } catch (error) {
      console.error('Error controlling device:', error);
      setError('Không thể cập nhật trạng thái thiết bị');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Quản lý thiết bị</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices && devices.length > 0 ? (
            devices.map((device) => (
              <div key={device.device_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{device.name}</h2>
                    <p className="text-gray-600">{device.type}</p>
                    <p className="text-gray-600">Vị trí: Tầng {device.floor_id} - Phòng {device.room_id || 'Chung'}</p>
                  </div>
                  <button
                    onClick={() => toggleDevice(device.device_id)}
                    className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Điều khiển
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-500">Chưa có thiết bị nào được thêm vào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devices; 