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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_id: null,
    name: '',
    type: '',
    color: 'ffffff',
    floor_id: 1,
    room_id: -1,
    x: 0,
    y: 0
  });
  const [newDeviceError, setNewDeviceError] = useState('');

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
      console.log(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStatus = (status) => {
    if (!status) return false;
    return status.power === 1 || status.value === 1 || status.on === true;
  };

  const toggleDevice = async (device) => {
    try {
      const isActive = getDeviceStatus(device.status);
      const action = isActive ? 'off' : 'on';
      const response = await axios.post('http://localhost:3000/device/control', {
        uid: user.auth.uid,
        house_id: user.house_id,
        device_id: device.device_id,
        action: action
      });

      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Không thể điều khiển thiết bị');
        return;
      }

      const detailResponse = await axios.get('http://localhost:3000/device/detail', {
        params: {
          uid: user.auth.uid,
          house_id: user.house_id,
          device_id: device.device_id
        }
      });
      if (detailResponse.data?.status === 'successful') {
        const deviceDetail = detailResponse.data.data.device;
        setDevices(prevDevices => prevDevices.map(d => d.device_id === device.device_id ? { ...d, status: deviceDetail.status } : d));
      } else {
        fetchDevices();
      }
    } catch (error) {
      console.error('Error controlling device:', error);
      setError('Không thể cập nhật trạng thái thiết bị');
    }
  };

  const deleteDevice = async (deviceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

    try {
      const response = await axios.post('http://localhost:3000/device/delete', {
        uid: user.auth.uid,
        house_id: user.house_id,
        device_id: deviceId
      });

      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Không thể xóa thiết bị');
        return;
      }

      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      setError('Không thể xóa thiết bị');
    }
  };

  const addDevice = async () => {
    // Kiểm tra tên thiết bị
    if (!newDevice.name.trim()) {
      setNewDeviceError('Vui lòng nhập tên thiết bị');
      return;
    }
    setNewDeviceError('');

    try {
      const response = await axios.post('http://localhost:3000/device/add', {
        uid: user.auth.uid,
        house_id: user.house_id,
        ...newDevice
      });

      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Không thể thêm thiết bị');
        return;
      }

      setShowAddModal(false);
      setNewDevice({
        name: '',
        type: '',
        color: 'ffffff',
        floor_id: 1,
        room_id: -1,
        x: 0,
        y: 0
      });
      fetchDevices();
    } catch (error) {
      console.error('Error adding device:', error);
      setError('Không thể thêm thiết bị');
    }
  };

  const updateDevicePosition = async (deviceId, floorId, roomId, x, y) => {
    try {
      const response = await axios.post('http://localhost:3000/device/update', {
        uid: user.auth.uid,
        house_id: user.house_id,
        device_id: deviceId,
        floor_id: floorId,
        room_id: roomId,
        x,
        y
      });

      if (response.data.status === 'unsuccessful') {
        setError(response.data.message || 'Không thể cập nhật vị trí thiết bị');
        return;
      }

      fetchDevices();
    } catch (error) {
      console.error('Error updating device position:', error);
      setError('Không thể cập nhật vị trí thiết bị');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Thêm thiết bị mới
          </button>
        </div>
        
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
                    <h2 className="text-xl font-semibold mb-2">{device.device_name}</h2>
                    <p className="text-gray-600">Loại: {device.device_type}</p>
                    <p className="text-gray-600">Vị trí: Tầng {device.floor_id} - Phòng {device.room_id || 'Chung'}</p>
                    <p className="text-gray-600">Tọa độ: {device.x?'('+device.x+',' +device.y+')':'Phòng' + device.room_id }</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* <button
                      onClick={() => toggleDevice(device)}
                      className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {device.device_type === 'fan' || device.device_type === 'rgb'
                        ? (getDeviceStatus(device.status) ? 'Tắt' : 'Bật')
                        : device.device_type === 'door'
                          ? (getDeviceStatus(device.status) ? 'Đóng' : 'Mở')
                          : 'Điều khiển'}
                    </button> */}
                    <button
                      onClick={() => deleteDevice(device.device_id)}
                      className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-500">Chưa có thiết bị nào được thêm vào</p>
            </div>
          )}
        </div>

        {/* Modal thêm thiết bị mới */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Thêm thiết bị mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cổng điều khiển</label>
                  <input
                    type="number"
                    value={newDevice.device_id}
                    onChange={(e) => {
                      setNewDevice({...newDevice, device_id: e.target.value});
                      setNewDeviceError(''); // Xóa lỗi khi người dùng bắt đầu nhập
                    }}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      newDeviceError ? 'border-red-500' : ''
                    }`}
                  />
                  {newDeviceError && (
                    <p className="mt-1 text-sm text-red-600">{newDeviceError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên thiết bị</label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => {
                      setNewDevice({...newDevice, name: e.target.value});
                      setNewDeviceError(''); // Xóa lỗi khi người dùng bắt đầu nhập
                    }}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      newDeviceError ? 'border-red-500' : ''
                    }`}
                  />
                  {newDeviceError && (
                    <p className="mt-1 text-sm text-red-600">{newDeviceError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại thiết bị</label>
                  <select
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại thiết bị</option>
                    <option value="door">Cửa</option>
                    <option value="fan">Quạt</option>
                    <option value="rgb">Đèn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                  <select
                    value={newDevice.color}
                    onChange={(e) => setNewDevice({...newDevice, color: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ff0000">Đỏ</option>
                    <option value="0000ff">Xanh dương</option>
                    <option value="00ff00">Xanh lá</option>
                    <option value="ffff00">Vàng</option>
                    <option value="800080">Tím</option>
                    <option value="ffa500">Cam</option>
                    <option value="000000">Đen</option>
                    <option value="ffffff">Trắng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tầng</label>
                  <input
                    type="number"
                    value={newDevice.floor_id}
                    onChange={(e) => setNewDevice({...newDevice, floor_id: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phòng (-1 cho khu vực chung)</label>
                  <input
                    type="number"
                    value={newDevice.room_id}
                    onChange={(e) => setNewDevice({...newDevice, room_id: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={addDevice}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Devices; 