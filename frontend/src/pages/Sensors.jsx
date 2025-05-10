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
  const [tempHumiMode, setTempHumiMode] = useState('temp'); // 'temp' hoặc 'humi'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // Thời gian cập nhật (giây)
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

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
      console.log('Response data:', response.data);      if (response.data.status === 'successful' && response.data.data) {
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
            // Kiểm tra cấu trúc của giá trị nhiệt độ/độ ẩm
            if (typeof sensor.value === 'object' && sensor.value !== null) {
              const temp = sensor.value.temp !== undefined ? sensor.value.temp : 'N/A';
              const humi = sensor.value.humi !== undefined ? sensor.value.humi : 'N/A';
              displayValue = `${temp}°C / ${humi}%`;
            } else {
              displayValue = 'N/A';
              console.warn('Invalid temp_humi value format:', sensor.value);
            }
            displayUnit = '';
          } else if (sensor.sensor_type === 'light') {
            // Kiểm tra giá trị ánh sáng
            if (sensor.value !== undefined && sensor.value !== null) {
              displayValue = sensor.value;
            } else {
              displayValue = 'N/A';
              console.warn('Invalid light value:', sensor.value);
            }
            displayUnit = 'lux';
          } else {
            // Các loại cảm biến khác
            displayValue = sensor.value !== undefined && sensor.value !== null ? sensor.value : 'N/A';
            displayUnit = sensor.unit || '';
          }

          return {
            ...sensor,
            displayName: `${sensor.sensor_name || 'Cảm biến'} ${sensor.sensor_type ? `(${sensor.sensor_type})` : ''}`,
            location: `Tầng ${sensor.floor_id || 'N/A'}${sensor.room_id ? `, Phòng ${sensor.room_id}` : ''}`,
            displayValue,
            displayUnit
          };
        });

        console.log('Final processed sensors:', processedSensors);
        setSensors(processedSensors);
        setLastRefreshTime(new Date()); // Cập nhật thời gian làm mới gần nhất
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
      
      // Cải thiện thông báo lỗi
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ đã được khởi động.');
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else if (error.response?.data?.message) {
        setError(`Lỗi: ${error.response.data.message}`);
      } else {
        setError('Không thể tải danh sách cảm biến. Vui lòng thử lại sau.');
      }
      
      setSensors([]);
    } finally {
      console.log('fetchSensors completed');
      setLoading(false);
    }
  };

  // Thiết lập tự động cập nhật dữ liệu
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && !loading) {
      console.log(`Bật chế độ tự động cập nhật mỗi ${refreshInterval} giây`);
      intervalId = setInterval(() => {
        console.log('Đang tự động cập nhật dữ liệu cảm biến...');
        
        // Cập nhật danh sách cảm biến
        fetchSensors();
        
        // Nếu đang xem chi tiết một cảm biến, cập nhật dữ liệu lịch sử
        if (selectedSensor) {
          fetchSensorHistory(selectedSensor.sensor_id);
        }
      }, refreshInterval * 1000); // Chuyển đổi thành mili giây
    }
    
    // Dọn dẹp interval khi component unmount hoặc khi autoRefresh thay đổi
    return () => {
      if (intervalId) {
        console.log('Hủy chế độ tự động cập nhật');
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, loading, selectedSensor]);

  // Hàm trợ giúp để xử lý dữ liệu cảm biến từ API
  const processSensorValue = (value, sensorType) => {
    // Xử lý trường hợp giá trị là JSON string
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        
        if (sensorType === 'temp_humi') {
          if (typeof parsedValue === 'object' && parsedValue !== null) {
            return parsedValue;
          }
          return { temp: 'N/A', humi: 'N/A' };
        } 
        
        if (sensorType === 'light') {
          return typeof parsedValue === 'number' ? parsedValue : 'N/A';
        }
        
        return parsedValue;
      } catch (error) {
        console.warn(`Error parsing sensor value (${sensorType}):`, error, value);
        return sensorType === 'temp_humi' ? { temp: 'N/A', humi: 'N/A' } : 'N/A';
      }
    }
    
    // Trường hợp giá trị đã là object hoặc số
    if (sensorType === 'temp_humi' && (typeof value !== 'object' || value === null)) {
      return { temp: 'N/A', humi: 'N/A' };
    }
    
    return value;
  };

  const fetchSensorHistory = async (sensorId) => {
    try {
      if (!user?.auth?.uid || !user?.house_id) {
        setError('Vui lòng đăng nhập và chọn nhà để xem lịch sử cảm biến');
        return;
      }

      const response = await axios.get(`http://localhost:3000/sensor/detail`, {
        params: { 
          sensor_id: parseInt(sensorId, 10),
          uid: user.auth?.uid,
          house_id: user.house_id
        }
      });
      
      console.log('Sensor history response:', response.data);
        if (response.data.status === 'successful' && response.data.data) {
        // Đảm bảo truy cập đúng cấu trúc dữ liệu
        if (response.data.data.logs) {
          console.log('Setting sensor history from logs:', response.data.data.logs);
          setSensorHistory(response.data.data.logs);
          setLastRefreshTime(new Date()); // Cập nhật thời gian làm mới
        } else {
          console.error('No logs property found in response data:', response.data.data);
          setSensorHistory([]);
        }
      } else {
        console.error('API Error:', response.data.message);
        setError(response.data.message || 'Không thể tải lịch sử cảm biến');
        setSensorHistory([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử cảm biến:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError('Không thể tải lịch sử cảm biến');
      setSensorHistory([]);
    }
  };
  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    // Reset về chế độ nhiệt độ khi chuyển cảm biến
    if (sensor.sensor_type === 'temp_humi') {
      setTempHumiMode('temp');
    }
    fetchSensorHistory(sensor.sensor_id);
  };

  const refreshSensor = async (sensorId) => {
    try {
      if (!user?.auth?.uid) {
        setError('Vui lòng đăng nhập để cập nhật cảm biến');
        return;
      }

      if (!user?.house_id) {
        setError('Vui lòng chọn nhà để cập nhật cảm biến');
        return;
      }      setRefreshingSensors(prev => ({ ...prev, [sensorId]: true }));
      const response = await axios.get(`http://localhost:3000/sensor/detail`, {
        params: { 
          uid: user.auth.uid,
          house_id: user.house_id,
          sensor_id: parseInt(sensorId, 10),
        }
      });
      console.log('Refresh sensor response:', response);
      if (response.data.status === 'successful' && response.data.data) {        const sensor = response.data.data.sensor;
        let displayValue = '';
        let displayUnit = '';
        
        if (sensor.sensor_type === 'temp_humi') {
          // Kiểm tra cấu trúc của giá trị nhiệt độ/độ ẩm
          if (typeof sensor.value === 'object' && sensor.value !== null) {
            const temp = sensor.value.temp !== undefined ? sensor.value.temp : 'N/A';
            const humi = sensor.value.humi !== undefined ? sensor.value.humi : 'N/A';
            displayValue = `${temp}°C / ${humi}%`;
          } else {
            displayValue = 'N/A';
            console.warn('Invalid temp_humi value format:', sensor.value);
          }
          displayUnit = '';        } else if (sensor.sensor_type === 'light') {
          // Kiểm tra giá trị ánh sáng
          if (sensor.value !== undefined && sensor.value !== null) {
            displayValue = sensor.value;
          } else {
            displayValue = 'N/A';
            console.warn('Invalid light value:', sensor.value);
          }
          displayUnit = 'lux';
        } else {
          // Các loại cảm biến khác
          displayValue = sensor.value !== undefined && sensor.value !== null ? sensor.value : 'N/A';
          displayUnit = sensor.unit || '';
        }
        
        setSensors(prev => prev.map(s => 
          s.sensor_id === sensorId ? { 
            ...s, 
            value: sensor.value,
            displayValue,
            displayUnit,          last_update: new Date().toISOString()
          } : s
        ));
        
        // Cập nhật thời gian làm mới
        setLastRefreshTime(new Date());
        
        // Nếu cảm biến này đang được chọn, cập nhật lịch sử
        if (selectedSensor?.sensor_id === sensorId) {
          fetchSensorHistory(sensorId);
        }
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

  const refreshAllSensors = async () => {
    try {
      // Kiểm tra đăng nhập và chọn nhà
      if (!user?.auth?.uid) {
        setError('Vui lòng đăng nhập để cập nhật cảm biến');
        return;
      }

      if (!user?.house_id) {
        setError('Vui lòng chọn nhà để cập nhật cảm biến');
        return;
      }
      
      // Set trạng thái đang làm mới
      setLoading(true);
      
      // Gọi lại fetchSensors để cập nhật tất cả cảm biến
      await fetchSensors();
      
      // Nếu đang có cảm biến đang chọn, cập nhật lịch sử của nó
      if (selectedSensor) {
        await fetchSensorHistory(selectedSensor.sensor_id);
      }
      
    } catch (error) {
      console.error('Lỗi khi cập nhật tất cả cảm biến:', error);
      setError('Không thể cập nhật tất cả cảm biến');
    } finally {
      setLoading(false);
    }
  };

  // Lọc và chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    if (!sensorHistory || !sensorHistory.length || !selectedSensor) {
      return {
        labels: [],
        datasets: [{
          label: 'Giá trị',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    }

    // Lọc dữ liệu hợp lệ
    const validData = sensorHistory.filter(item => {
      if (!item.time) return false;
      
      // Loại bỏ những log chỉ chứa thông tin hành động (thêm/cập nhật)
      if (typeof item.value === 'string' && 
         (item.value.includes('Thêm sensor') || 
          item.value.includes('Thay đổi vị trí'))) {
        return false; 
      }
      return true;
    });

    // Sắp xếp theo thời gian
    validData.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Giới hạn chỉ lấy 20 điểm dữ liệu gần nhất
    const limitedData = validData.slice(-20);    return {
      labels: limitedData.map(data => new Date(data.time).toLocaleTimeString()),
      datasets: [{
        label: selectedSensor.sensor_type === 'temp_humi' 
          ? (tempHumiMode === 'temp' ? 'Nhiệt độ' : 'Độ ẩm')
          : 'Giá trị',
        data: limitedData.map(data => {
          if (typeof data.value === 'string') {
            try {
              const parsedValue = JSON.parse(data.value);
              if (selectedSensor.sensor_type === 'temp_humi') {
                // Với cảm biến nhiệt độ và độ ẩm, kiểm tra mode
                return tempHumiMode === 'temp' 
                  ? (parsedValue.temp || 0)
                  : (parsedValue.humi || 0);
              } else if (selectedSensor.sensor_type === 'light') {
                // Với cảm biến ánh sáng, lấy giá trị ánh sáng
                return typeof parsedValue === 'number' ? parsedValue : 0;
              }
              return typeof parsedValue === 'number' ? parsedValue : 0;
            } catch (e) {
              console.warn('Error parsing sensor value:', e, data.value);
              return 0;
            }
          }
          return typeof data.value === 'number' ? data.value : 0;
        }),
        borderColor: selectedSensor.sensor_type === 'temp_humi'
          ? (tempHumiMode === 'temp' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)') 
          : 'rgb(75, 192, 192)',
        backgroundColor: selectedSensor.sensor_type === 'temp_humi'
          ? (tempHumiMode === 'temp' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)')
          : 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.1
      }]
    };
  };

  const chartData = prepareChartData();  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: selectedSensor 
          ? selectedSensor.sensor_type === 'light' 
            ? 'Biểu đồ ánh sáng theo thời gian'
            : selectedSensor.sensor_type === 'temp_humi'
              ? `Biểu đồ ${tempHumiMode === 'temp' ? 'nhiệt độ' : 'độ ẩm'} theo thời gian`
              : 'Biểu đồ giá trị theo thời gian'
          : 'Biểu đồ giá trị cảm biến'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (selectedSensor?.sensor_type === 'light') {
                label += ' lux';
              } else if (selectedSensor?.sensor_type === 'temp_humi') {
                label += tempHumiMode === 'temp' ? '°C' : '%';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Thời gian'
        }
      },
      y: {
        title: {
          display: true,
          text: selectedSensor
            ? selectedSensor.sensor_type === 'light'
              ? 'Ánh sáng (lux)'
              : selectedSensor.sensor_type === 'temp_humi'
                ? tempHumiMode === 'temp' ? 'Nhiệt độ (°C)' : 'Độ ẩm (%)'
                : 'Giá trị'
            : 'Giá trị'
        },
        beginAtZero: true
      }
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Đang tải dữ liệu cảm biến...</p>
      </div>
    );
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
  }  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý cảm biến</h1>
          
          <div className="flex items-center space-x-4">
            {/* Chức năng tự động cập nhật */}
            <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
              <div className="flex items-center mr-3">
                <input
                  id="auto-refresh"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(prev => !prev)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-refresh" className="ml-2 block text-sm text-gray-700">
                  Tự động cập nhật
                </label>
              </div>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
                className="block text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value={5}>5 giây</option>
                <option value={10}>10 giây</option>
                <option value={30}>30 giây</option>
                <option value={60}>1 phút</option>
              </select>
            </div>
            
            <button 
              onClick={refreshAllSensors}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Đang cập nhật...' : 'Cập nhật tất cả'}
            </button>          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Hiển thị thời gian cập nhật gần nhất */}
        <div className="text-sm text-gray-500 mb-6 flex items-center">
          <span className="mr-2">Cập nhật lần cuối:</span>
          <span className="font-medium">
            {lastRefreshTime.toLocaleTimeString()}
          </span>
          {autoRefresh && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Tự động cập nhật sau {refreshInterval}s
            </span>
          )}
        </div>

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
          </div>          {/* Biểu đồ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedSensor ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Biểu đồ {selectedSensor.displayName}
                  </h2>
                  
                  {/* Chỉ hiển thị các nút chọn khi cảm biến là nhiệt độ-độ ẩm */}
                  {selectedSensor.sensor_type === 'temp_humi' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTempHumiMode('temp')}
                        className={`px-3 py-1 rounded-md ${
                          tempHumiMode === 'temp'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Nhiệt độ
                      </button>
                      <button
                        onClick={() => setTempHumiMode('humi')}
                        className={`px-3 py-1 rounded-md ${
                          tempHumiMode === 'humi'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Độ ẩm
                      </button>
                    </div>
                  )}
                </div>
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