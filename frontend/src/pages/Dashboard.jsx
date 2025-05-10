import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const getDeviceIcon = (deviceType) => {
  switch (deviceType.toLowerCase()) {
    case 'door':
      return '🚪';
    case 'rgb':
      return '💡';
    case 'fan':
      return '💨';
    default:
      return '📱';
  }
};

const getDeviceTypeName = (deviceType) => {
  switch (deviceType.toLowerCase()) {
    case 'door':
      return 'Cửa';
    case 'rgb':
      return 'Đèn';
    case 'fan':
      return 'Quạt';
    default:
      return 'Thiết bị';
  }
};

const getDeviceStatus = (status) => {
  if (!status) return false;
  return status.power === 1 || status.value === 1;
};

const getDeviceStatusText = (deviceType, isActive) => {
  if (deviceType.toLowerCase() === 'door') {
    return isActive ? 'Đang mở' : 'Đang đóng';
  }
  return isActive ? 'Đang hoạt động' : 'Đã tắt';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [houseData, setHouseData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [temperature, setTemperature] = useState(25);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user.auth) {
      navigate('/login');
      return;
    }

    // Sử dụng dữ liệu mẫu nếu là tài khoản demo
    if (user.auth.uid === 'mock-user-id') {
      setHouseData(mockHouseData);
      setDevices(mockDevices);
      setSensors(mockSensors);
      setMembers(mockMembers);
      setRooms(mockRooms);
      setSelectedRoom(mockRooms[0]?.room_id?.toString() || '');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (!user.auth.uid || !user.house_id) {
          console.error('Thiếu thông tin người dùng hoặc nhà');
          return;
        }

        const [houseResponse, devicesResponse, sensorsResponse, membersResponse] = await Promise.all([
          axios.get(`http://localhost:3000/house/getmap?uid=${user.auth.uid}&house_id=${user.house_id}`),
          axios.get(`http://localhost:3000/device/getlist?uid=${user.auth.uid}&house_id=${user.house_id}`),
          axios.get(`http://localhost:3000/sensor/getlist?uid=${user.auth.uid}&house_id=${user.house_id}`),
          axios.get(`http://localhost:3000/house/get-members?uid=${user.auth.uid}&house_id=${user.house_id}`)
        ]);

        if (houseResponse.data?.status === 'error') {
          console.error('Lỗi khi lấy thông tin nhà:', houseResponse.data.message);
          return;
        }

        if (devicesResponse.data?.status === 'error') {
          console.error('Lỗi khi lấy danh sách thiết bị:', devicesResponse.data.message);
          return;
        }

        if (sensorsResponse.data?.status === 'error') {
          console.error('Lỗi khi lấy danh sách cảm biến:', sensorsResponse.data.message);
          return;
        }

        if (membersResponse.data?.status === 'error') {
          console.error('Lỗi khi lấy danh sách thành viên:', membersResponse.data.message);
          return;
        }

        const houseData = houseResponse.data.data;
        console.log('House data:', houseData);
        setHouseData(houseData);
        
        // Lấy danh sách phòng từ floors
        if (houseData.floors && Array.isArray(houseData.floors)) {
          // Tạo danh sách phòng từ tất cả các tầng
          const allRooms = houseData.floors.flatMap((floor, floorIndex) => {
            if (floor.rooms && Array.isArray(floor.rooms)) {
              return floor.rooms.map(room => ({
                ...room,
                floor_id: floorIndex + 1
              }));
            }
            return [];
          });

          console.log('All rooms:', allRooms);
          if (allRooms.length > 0) {
            setRooms(allRooms);
            setSelectedRoom(allRooms[0]?.room_id?.toString() || '');
          } else {
            console.error('Không tìm thấy phòng trong các tầng');
          }
        } else {
          console.error('Không tìm thấy dữ liệu tầng:', houseData);
        }

        if (devicesResponse.data && devicesResponse.data.status === 'successful') {
          const devicesData = devicesResponse.data.data;
          console.log('Devices data:', devicesData);
          
          // Lấy thông tin chi tiết cho từng thiết bị
          const devicesWithDetails = await Promise.all(
            devicesData.map(async (device) => {
              try {
                const detailResponse = await axios.get('http://localhost:3000/device/detail', {
                  params: {
                    uid: user.auth.uid,
                    house_id: user.house_id,
                    device_id: device.device_id
                  }
                });
                
                if (detailResponse.data?.status === 'successful') {
                  const lastLog = detailResponse.data.data.logs[0];
                  return {
                    ...device,
                    status: {
                      ...device.status,
                      power: lastLog?.action === 'on' ? 1 : 0,
                      value: lastLog?.action === 'on' ? 1 : 0
                    }
                  };
                }
                return device;
              } catch (error) {
                console.error(`Lỗi khi lấy thông tin chi tiết thiết bị ${device.device_id}:`, error);
                return device;
              }
            })
          );
          
          setDevices(devicesWithDetails);
        }

        if (sensorsResponse.data && sensorsResponse.data.status === 'successful') {
          setSensors(sensorsResponse.data.data);
        }
        if (membersResponse.data && membersResponse.data.status === 'successful') {
          setMembers(membersResponse.data.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Token hết hạn, chuyển hướng về trang login
          navigate('/login');
          return;
        }
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleTemperatureChange = (change) => {
    setTemperature(prev => Math.min(Math.max(prev + change, 5), 30));
  };

  const handleDeviceControl = async (deviceId, currentStatus) => {
    try {
      if (!user.auth.uid || !user.house_id) {
        console.error('Thiếu thông tin người dùng hoặc nhà');
        return;
      }

      setControlLoading(prev => ({ ...prev, [deviceId]: true }));

      const newStatus = !getDeviceStatus(currentStatus);
      const response = await axios.post('http://localhost:3000/device/control', {
        uid: user.auth.uid,
        house_id: user.house_id,
        device_id: deviceId,
        action: newStatus ? 'on' : 'off'
      });

      if (response.data?.status === 'error') {
        console.error('Lỗi khi điều khiển thiết bị:', response.data.message);
        return;
      }

      // Lấy thông tin chi tiết thiết bị sau khi điều khiển
      const detailResponse = await axios.get('http://localhost:3000/device/detail', {
        params: {
          uid: user.auth.uid,
          house_id: user.house_id,
          device_id: deviceId
        }
      });

      if (detailResponse.data?.status === 'successful') {
        const deviceDetail = detailResponse.data.data.device;
        const lastLog = detailResponse.data.data.logs[0]; // Lấy log cuối cùng

        // Cập nhật trạng thái thiết bị trong state
        setDevices(prevDevices => 
          prevDevices.map(device => {
            if (device.device_id === deviceId) {
              return {
                ...device,
                status: {
                  ...device.status,
                  power: lastLog.action === 'on' ? 1 : 0,
                  value: lastLog.action === 'on' ? 1 : 0
                }
              };
            }
            return device;
          })
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      console.error('Lỗi khi điều khiển thiết bị:', error);
    } finally {
      setControlLoading(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Lấy cảm biến cho phòng được chọn
  const roomSensors = sensors;
  const roomTemperature = roomSensors.find(sensor => sensor.type === 'temp_humi')?.value.temp || temperature;
  const roomHumidity = roomSensors.find(sensor => sensor.type === 'temp_humi')?.value.humi || 35;

  // Lọc thiết bị theo phòng được chọn
  const roomDevices = devices.filter(device => device.room_id?.toString() === selectedRoom);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search"
            className="w-96 px-4 py-2 rounded-full bg-white shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">⚙️</button>
          <button className="p-2 rounded-full hover:bg-gray-100">🔔</button>
          <div className="flex items-center gap-2">
            <img src={user.avatar || '👤'} alt="avatar" className="w-8 h-8 rounded-full" />
            <span className="font-medium">{user.name || 'Scarlett'}</span>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-orange-50 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold mb-2">Hello, {user.name || 'Scarlett'}!</h1>
          <p className="text-gray-600 mb-4">
            Welcome Home! The air quality is good & fresh you can go out today.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌡️</span>
              <span className="font-medium">+{sensors[0]?.value?.temp||25}°C</span>
              <span className="text-gray-500">Outdoor temperature</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">☁️</span>
              <span className="text-gray-500">Fuzzy cloudy weather</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0">
          <img src="/walking-illustration.png" alt="illustration" className="h-48" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{houseData?.name || "Smart Home"}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>💧</span>
                <span>{sensors[0]?.value?.humi||75}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌡️</span>
                <span>{sensors[0]?.value?.temp||25}°C</span>
              </div>
              <select 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white shadow-sm"
              >
                {rooms.length > 0 ? (
                  rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {`Phòng ${room.name || room.room_id} - Tầng ${room.floor_id}`}
                    </option>
                  ))
                ) : (
                  <option value="">Không có phòng</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {roomDevices.length > 0 ? (
              roomDevices.map(device => (
                <div 
                  key={device.device_id} 
                  className={`bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md
                    ${getDeviceStatus(device.status) ? 'border-2 border-blue-500' : 'border-2 border-gray-200'}`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-4xl mb-2">{getDeviceIcon(device.device_type)}</div>
                    <div className="text-center">
                      <div className="font-medium text-lg mb-1">{device.device_name}</div>
                      <div className="text-sm text-gray-500 capitalize">{device.device_type}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-2">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={getDeviceStatus(device.status)}
                        onChange={() => handleDeviceControl(device.device_id, device.status)}
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500">Không có thiết bị nào trong phòng này</p>
              </div>
            )}
          </div>

          {/* Temperature Control */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium mb-1">Nhiệt độ {rooms.find(r => r.room_id.toString() === selectedRoom)?.name || ''}</h3>

              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-xl">
              
              <div className="text-center">
                <div className="text-5xl font-light mb-2">{sensors[0]?.value?.temp||25}°C</div>
                <div className="text-sm text-gray-500">Nhiệt độ hiện tại</div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* My Devices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Thiết bị của tôi</h3>
              <select 
                className="text-sm bg-transparent border border-gray-200 rounded-lg px-2 py-1"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="on">Đang bật</option>
                <option value="off">Đã tắt</option>
              </select>
            </div>
            <div className="space-y-3">
              {devices
                .filter(device => {
                  if (filterStatus === 'all') return true;
                  const isActive = getDeviceStatus(device.status);
                  return filterStatus === 'on' ? isActive : !isActive;
                })
                .map(device => {
                const isActive = getDeviceStatus(device.status);
                const isLoading = controlLoading[device.device_id];
                return (
                  <div 
                    key={device.device_id} 
                    className={`bg-white p-4 rounded-xl shadow-sm flex items-center justify-between
                      ${isActive ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-200'}
                      ${isLoading ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getDeviceIcon(device.device_type)}</div>
                      <div>
                        <div className="font-medium">{device.device_name}</div>
                        <div className="text-sm text-gray-500">
                          {getDeviceTypeName(device.device_type)} - Tầng {device.floor_id}
                        </div>
                        <div className="text-xs text-gray-400">
                          {isLoading ? 'Đang xử lý...' : getDeviceStatusText(device.device_type, isActive)}
                        </div>
                      </div>
                    </div>
                    <label className={`relative inline-flex items-center ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isActive}
                        disabled={isLoading}
                        onChange={() => handleDeviceControl(device.device_id, device.status)}
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isLoading ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>
                );
              })}
              {devices.length === 0 && (
                <div className="text-center py-6 bg-white rounded-xl">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-gray-500">Chưa có thiết bị nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Thành viên</h3>
              <button className="text-blue-500 text-sm">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.role === 'Admin' ? '👩‍💼' : '👤'}</span>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Consumed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Power Consumed</h3>
              <select className="text-sm bg-transparent">
                <option>Month</option>
                <option>Week</option>
                <option>Day</option>
              </select>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚡</span>
                  <span>Electricity Consumed</span>
                </div>
                <span className="text-sm">73% Spending</span>
              </div>
              {/* Giả lập biểu đồ */}
              <div className="h-32 bg-gradient-to-t from-orange-100 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 