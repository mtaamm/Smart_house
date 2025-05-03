import axios from 'axios';
import { API_CONFIG, USER_CONFIG, DEFAULT_CONFIG } from '../config/appConfig';

// API endpoint
const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_MAP}?uid=${USER_CONFIG.UID}&house_id=${USER_CONFIG.HOUSE_ID}`;
const SAVE_API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_MAP}`;

// Hàm chuyển đổi dữ liệu từ API thành định dạng initialItems
export const convertApiDataToItems = (apiData) => {
  const items = [];
  
  // Xử lý dữ liệu từ API
  if (apiData && apiData.data && apiData.data.floors) {
    // Lấy tầng đầu tiên (hoặc có thể chọn tầng cụ thể)
    const floor = apiData.data.floors[0];
    
    if (floor) {
      // Xử lý các phòng (rooms)
      if (floor.rooms && floor.rooms.length > 0) {
        floor.rooms.forEach((room, index) => {
          items.push({
            id: `rectangle-${room.room_id}`,
            type: 'rectangle',
            x: room.x || 50 + index * 250,
            y: room.y || 50,
            z: 0,
            width: room.width || 200,
            height: room.length || 150,
            label: room.name || `Room ${room.room_id}`,
            color: room.color || '0000ff'
          });
          
          // Xử lý các thiết bị trong phòng
          if (room.devices && room.devices.length > 0) {
            room.devices.forEach((device, deviceIndex) => {
              items.push({
                id: `device-${device.device_id}`,
                type: 'device',
                x: room.x + 50 + deviceIndex * 60 || 300 + deviceIndex * 100,
                y: room.y + 50 || 50,
                z: deviceIndex + 1,
                width: 50,
                height: 50,
                label: device.device_name || `Device ${device.device_id}`,
                color: device.color || 'ff0000',
                data: device.status || null
              });
            });
          }
          
          // Xử lý các cảm biến trong phòng
          if (room.sensors && room.sensors.length > 0) {
            room.sensors.forEach((sensor, sensorIndex) => {
              items.push({
                id: `sensor-${sensor.sensor_id}`,
                type: 'sensor',
                x: room.x + 50 + sensorIndex * 60 || 50 + sensorIndex * 100,
                y: room.y + 150 || 300,
                z: sensorIndex + 10,
                width: 50,
                height: 50,
                label: sensor.sensor_name || `Sensor ${sensor.sensor_id}`,
                color: sensor.color || '00ff00',
                data: sensor.value || null
              });
            });
          }
        });
      }
      
      // Xử lý các thiết bị ở tầng (không nằm trong phòng)
      if (floor.devices && floor.devices.length > 0) {
        floor.devices.forEach((device, index) => {
          // Chỉ thêm thiết bị nếu nó không nằm trong phòng nào
          const isDeviceInRoom = floor.rooms.some(room => 
            room.devices.some(roomDevice => roomDevice.device_id === device.device_id)
          );
          
          if (!isDeviceInRoom) {
            items.push({
              id: `device-${device.device_id}`,
              type: 'device',
              x: device.x || 300 + (index % 3) * 100,
              y: device.y || 50 + Math.floor(index / 3) * 100,
              z: index + 1,
              width: 50,
              height: 50,
              label: device.device_name || `Device ${device.device_id}`,
              color: device.color || 'ff0000',
              data: device.status || null
            });
          }
        });
      }
      
      // Xử lý các cảm biến ở tầng (không nằm trong phòng)
      if (floor.sensors && floor.sensors.length > 0) {
        floor.sensors.forEach((sensor, index) => {
          // Chỉ thêm cảm biến nếu nó không nằm trong phòng nào
          const isSensorInRoom = floor.rooms.some(room => 
            room.sensors.some(roomSensor => roomSensor.sensor_id === sensor.sensor_id)
          );
          
          if (!isSensorInRoom) {
            items.push({
              id: `sensor-${sensor.sensor_id}`,
              type: 'sensor',
              x: sensor.x || 50 + index * 100,
              y: sensor.y || 300,
              z: index + 10,
              width: 50,
              height: 50,
              label: sensor.sensor_name || `Sensor ${sensor.sensor_id}`,
              color: sensor.color || '00ff00',
              data: sensor.value || null
            });
          }
        });
      }
    }
  }
  
  return items;
};

// Hàm fetch dữ liệu từ API
export const fetchHouseMap = async () => {
  try {
    const uid = JSON.parse(localStorage.getItem("auth")).uid;
    const house_id = localStorage.getItem("house_id");
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_MAP}?uid=${uid}&house_id=${house_id}`;

    const response = await axios.get(url);
    // alert("Res\n" + JSON.stringify(response, null, 2))
    return response.data;
  } catch (error) {
    console.error('Error fetching house map:', error);
    throw error;
  }
};

// Hàm chính để lấy dữ liệu và chuyển đổi
export const getHouseItems = async () => {
  try {
    const apiData = await fetchHouseMap();
    return convertApiDataToItems(apiData);
  } catch (error) {
    console.error('Error getting house items:', error);
    return [];
  }
};

// Hàm chuyển đổi items thành định dạng API
export const convertItemsToApiData = (items) => {
  // Tạo cấu trúc dữ liệu API từ items
  const rooms = [];
  const devices = [];
  const sensors = [];
  
  items.forEach(item => {
    if (item.type === 'rectangle') {
      // Lấy room_id từ localId hoặc từ id nếu không có localId
      const roomId = item.localId || parseInt(item.id.split('-')[1]);
      
      rooms.push({
        room_id: roomId,
        name: item.label || `room-${roomId}`,
        length: item.height,
        width: item.width,
        x: item.x,
        y: item.y,
        color: item.color || DEFAULT_CONFIG.DEFAULT_COLORS.ROOM,
        devices: [],
        sensors: []
      });
    } else if (item.type === 'device') {
      // Lấy device_id từ localId hoặc từ id nếu không có localId
      const deviceId = item.localId || parseInt(item.id.split('-')[1]);
      
      devices.push({
        device_id: deviceId,
        device_type: "",
        device_name: item.label || `device-${deviceId}`,
        color: item.color || DEFAULT_CONFIG.DEFAULT_COLORS.DEVICE,
        status: item.data || {},
        x: item.x,
        y: item.y
      });
    } else if (item.type === 'sensor') {
      // Lấy sensor_id từ localId hoặc từ id nếu không có localId
      const sensorId = item.localId || parseInt(item.id.split('-')[1]);
      
      sensors.push({
        sensor_id: sensorId,
        sensor_type: "",
        sensor_name: item.label || `sensor-${sensorId}`,
        color: item.color || DEFAULT_CONFIG.DEFAULT_COLORS.SENSOR,
        value: item.data || {},
        x: item.x,
        y: item.y
      });
    }
  });
  
  // Tạo cấu trúc dữ liệu API
  const apiData = {
    house_id: USER_CONFIG.HOUSE_ID,
    length: 0,
    width: 0,
    floors: [
      {
        floor_id: DEFAULT_CONFIG.FLOOR_ID,
        rooms: rooms,
        devices: devices,
        sensors: sensors
      }
    ]
  };
  
  return apiData;
};

// Hàm lưu dữ liệu lên server
export const saveHouseMap = async (items) => {
  try {
    const apiData = convertItemsToApiData(items);
    
    // Gọi API để lưu dữ liệu

    const response = await axios.post(SAVE_API_URL, apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving house map:', error);
    throw error;
  }
};

// Hàm mới để fetch dữ liệu từ API và cập nhật useStore
export const fetchHouseData = async (setItemsFromApi) => {
  try {
    const items = await getHouseItems();
    // alert("Get " + JSON.stringify(items, null, 2))

    setItemsFromApi(items);
    return true;
    // if (items && items.length > 0) {
    //   setItemsFromApi(items);
    //   return true;
    // }
    // return false;
  } catch (error) {
    console.error('Error fetching house data:', error);
    return false;
  }
}; 