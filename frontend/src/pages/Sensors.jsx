import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { RefreshCw } from 'react-feather';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Sensors = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [refreshingSensors, setRefreshingSensors] = useState({});

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User auth:', user?.auth);
    console.log('User auth uid:', user?.auth?.uid);
    console.log('User house_id:', user?.house_id);

    if (!user?.auth) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login');
      return;
    }

    console.log('Calling fetchSensors...');
    fetchSensors();
  }, [user, navigate]);

  const fetchSensors = async () => {
    try {
      console.log('Starting fetchSensors...');
      console.log('User state:', {
        uid: user?.auth?.uid,
        house_id: user?.house_id,
        isAuthenticated: !!user?.auth
      });

      if (!user?.auth?.uid) {
        console.log('No uid found, showing error');
        setError('Vui lòng đăng nhập để xem danh sách cảm biến');
        setLoading(false);
        return;
      }

      if (!user?.house_id) {
        console.log('No house_id found, showing error');
        setError('Vui lòng chọn nhà để xem danh sách cảm biến');
        setLoading(false);
        return;
      }

      const requestParams = {
        uid: user.auth.uid,
        house_id: user.house_id
      };
      console.log('Making API request with params:', requestParams);

      const response = await axios.get(`http://localhost:3000/sensor/getlist`, {
        params: requestParams
      });
      
      console.log('Raw API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.status === 'successful' && response.data.data) {
        console.log('API call successful, processing data...');
        const sensorsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];

        console.log('Sensors data before processing:', sensorsData);

        const processedSensors = sensorsData.map(sensor => {
          console.log('Processing sensor:', sensor);
          let displayValue = '';
          let displayUnit = '';

          if (sensor.sensor_type === 'temp_humi') {
            displayValue = `${sensor.value.temp}°C / ${sensor.value.humi}%`;
            displayUnit = '';
          } else {
            displayValue = sensor.value;
            displayUnit = sensor.unit || '';
          }

          return {
            ...sensor,
            displayName: `${sensor.sensor_name || 'Cảm biến'} ${sensor.sensor_type ? `(${sensor.sensor_type})` : ''}`,
            location: `Tầng ${sensor.floor || 'N/A'}${sensor.room_id ? `, Phòng ${sensor.room_id}` : ''}`,
            displayValue,
            displayUnit
          };
        });

        console.log('Final processed sensors:', processedSensors);
        setSensors(processedSensors);
      } else {
        console.error('API Error:', {
          status: response.data.status,
          message: response.data.message,
          data: response.data.data
        });
        setError(response.data.message || 'Không thể tải danh sách cảm biến');
        setSensors([]);
      }
    } catch (error) {
      console.error('Error in fetchSensors:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError('Không thể tải danh sách cảm biến');
      setSensors([]);
    } finally {
      console.log('fetchSensors completed');
      setLoading(false);
    }
  };

  const fetchSensorHistory = async (sensorId) => {
    try {
      if (!user?.auth?.uid || !user?.auth?.house_id) {
        setError('Vui lòng đăng nhập và chọn nhà để xem lịch sử cảm biến');
        return;
      }

      const response = await axios.get(`http://localhost:3000/sensor/detail`, {
        params: { 
          sensor_id: parseInt(sensorId, 10),
          uid: user.auth.uid,
          house_id: user.auth.house_id
        }
      });
      
      if (response.data.status === 'successful' && response.data.data) {
        const historyData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        setSensorHistory(historyData);
      } else {
        console.error('API Error:', response.data.message);
        setError(response.data.message || 'Không thể tải lịch sử cảm biến');
        setSensorHistory([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử cảm biến:', error);
      setError('Không thể tải lịch sử cảm biến');
      setSensorHistory([]);
    }
  };

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    fetchSensorHistory(sensor.sensor_id);
  };

  const refreshSensor = async (sensorId) => {
    try {
      if (!user?.auth?.uid) {
        setError('Vui lòng đăng nhập để cập nhật cảm biến');
        return;
      }

      if (!user?.auth?.house_id) {
        setError('Vui lòng chọn nhà để cập nhật cảm biến');
        return;
      }

      setRefreshingSensors(prev => ({ ...prev, [sensorId]: true }));
      const response = await axios.get(`http://localhost:3000/sensor/detail`, {
        params: { 
          sensor_id: parseInt(sensorId, 10),
          uid: user.auth.uid,
          house_id: user.auth.house_id
        }
      });
      
      if (response.data.status === 'successful' && response.data.data) {
        setSensors(prev => prev.map(sensor => 
          sensor.sensor_id === sensorId ? response.data.data : sensor
        ));
      } else {
        console.error('API Error:', response.data.message);
        setError(response.data.message || 'Không thể cập nhật cảm biến');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật cảm biến:', error);
      setError('Không thể cập nhật cảm biến');
    } finally {
      setRefreshingSensors(prev => ({ ...prev, [sensorId]: false }));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (!Array.isArray(sensors)) {
    console.error('Sensors is not an array:', sensors);
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Quản lý cảm biến</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Có lỗi xảy ra khi tải dữ liệu cảm biến
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: sensorHistory.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Giá trị',
        data: sensorHistory.map((data) => data.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Biểu đồ giá trị cảm biến'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Quản lý cảm biến</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Danh sách cảm biến */}
          <div className="space-y-4">
            {sensors && sensors.length > 0 ? (
              sensors.map((sensor) => (
                <div
                  key={sensor.sensor_id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedSensor?.sensor_id === sensor.sensor_id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSensorClick(sensor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">{sensor.displayName}</h2>
                      <p className="text-gray-600">Vị trí: {sensor.location}</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold">
                            Giá trị hiện tại: 
                          </p>
                          <span className={`text-xl font-bold ${
                            sensor.value > (sensor.threshold || 0) ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {sensor.displayValue} {sensor.displayUnit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Cập nhật lần cuối: {new Date(sensor.last_update || Date.now()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshSensor(sensor.sensor_id);
                      }}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        refreshingSensors[sensor.sensor_id] ? 'animate-spin' : ''
                      }`}
                      disabled={refreshingSensors[sensor.sensor_id]}
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có cảm biến nào được thêm vào</p>
              </div>
            )}
          </div>

          {/* Biểu đồ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedSensor ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Biểu đồ {selectedSensor.displayName}
                </h2>
                <div className="h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">Chọn một cảm biến để xem biểu đồ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sensors; 