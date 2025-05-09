import * as mqtt from 'mqtt';

// Các định nghĩa cho device IDs
const TEMP_HUMI_ID_MIN = 1;
const TEMP_HUMI_ID_MAX = 3;
const LIGHT_ID_MIN = 4;
const LIGHT_ID_MAX = 6;
const DOOR_ID_MIN = 7;
const DOOR_ID_MAX = 9;
const FAN_ID_MIN = 10;
const FAN_ID_MAX = 13;
const RGB_ID_MIN = 14;
const RGB_ID_MAX = 16;

// Cấu trúc cho các loại dữ liệu cảm biến
interface SensorData {
  temp: number;
  humi: number;
  light: number;
}

// Cấu trúc dữ liệu cho các cảm biến cụ thể
interface SpecificSensorData {
  value: number;
  timestamp: number;
}

interface DeviceStatus {
  type: string;
  on: boolean;
  lock?: boolean;
}

// Lưu trữ dữ liệu cảm biến và trạng thái thiết bị
const sensorData: Record<string, SensorData> = {};
// Lưu trữ dữ liệu cảm biến theo ID cụ thể
const specificSensorData: Record<string, Record<number, SpecificSensorData>> = {};
const deviceStatus: Record<string, Record<number, DeviceStatus>> = {};

// Kết nối MQTT client
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org:1883');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe đến tất cả các topics của các nhà (houses)
  mqttClient.subscribe('yolouno/+/sensors');
  mqttClient.subscribe('yolouno/+/status/#');
  mqttClient.subscribe('yolouno/+/sensor/#'); // Thêm subscription cho dữ liệu cảm biến cụ thể
});

mqttClient.on('message', (topic, message) => {
  const topicParts = topic.split('/');
  const houseId = topicParts[1];
  
  // Xử lý dữ liệu cảm biến tổng hợp
  if (topic === `yolouno/${houseId}/sensors`) {
    try {
      const data = JSON.parse(message.toString());
      if (!sensorData[houseId]) {
        sensorData[houseId] = { temp: 0, humi: 0, light: 0 };
      }
      sensorData[houseId] = { 
        temp: data.temp || sensorData[houseId].temp,
        humi: data.humi || sensorData[houseId].humi,
        light: data.light || sensorData[houseId].light
      };
      
      // Cập nhật dữ liệu cho các cảm biến ánh sáng mặc định (ID 4, 5, 6)
      if (!specificSensorData[houseId]) {
        specificSensorData[houseId] = {};
      }
      
      // Cập nhật giá trị của các cảm biến ánh sáng
      for (let i = LIGHT_ID_MIN; i <= LIGHT_ID_MAX; i++) {
        specificSensorData[houseId][i] = {
          value: data.light || 0,
          timestamp: Date.now()
        };
      }
      
      console.log(`Received general sensor data for ${houseId}: temp=${data.temp}, humi=${data.humi}, light=${data.light}`);
    } catch (error) {
      console.error('Error parsing sensor data:', error);
    }
  }
  // Xử lý dữ liệu cảm biến cụ thể
  else if (topicParts[2] === 'sensor') {
    const sensorType = topicParts[3];
    const sensorId = parseInt(topicParts[4]);
    const value = parseFloat(message.toString());
    
    if (!specificSensorData[houseId]) {
      specificSensorData[houseId] = {};
    }
    
    specificSensorData[houseId][sensorId] = {
      value: value,
      timestamp: Date.now()
    };
    
    console.log(`Received specific sensor data: house=${houseId}, type=${sensorType}, id=${sensorId}, value=${value}`);
  }
  // Xử lý trạng thái thiết bị
  else if (topicParts[2] === 'status') {
    const deviceType = topicParts[3];
    const deviceId = parseInt(topicParts[4]);
    const status = message.toString();
    
    if (!deviceStatus[houseId]) {
      deviceStatus[houseId] = {};
    }
    
    // Xử lý từng loại thiết bị
    switch (deviceType) {
      case 'door':
        deviceStatus[houseId][deviceId] = {
          type: 'door',
          on: status === 'OPEN',
          lock: false // Default, door lock không được gửi trong mã ESP32 hiện tại
        };
        break;
      case 'fan':
        deviceStatus[houseId][deviceId] = {
          type: 'fan',
          on: status === 'ON'
        };
        break;
      case 'rgb':
        deviceStatus[houseId][deviceId] = {
          type: 'rgb',
          on: status !== '0,0,0' // Giả sử LED tắt khi tất cả các giá trị RGB là 0
        };
        break;
      case 'alarm':
        deviceStatus[houseId][deviceId] = {
          type: 'alarm',
          on: status === 'ON'
        };
        break;
    }
  }
});

/**
 * Lấy dữ liệu nhiệt độ và độ ẩm
 * @param houseId ID của ngôi nhà
 * @returns Đối tượng chứa nhiệt độ và độ ẩm
 */
export function getTempHumi(houseId: string): { temp: number; humi: number } {
  if (!sensorData[houseId]) {
    return { temp: 0, humi: 0 };
  }
  
  return {
    temp: sensorData[houseId].temp,
    humi: sensorData[houseId].humi
  };
}

/**
 * Lấy dữ liệu ánh sáng
 * @param houseId ID của ngôi nhà
 * @param deviceId ID của thiết bị ánh sáng
 * @returns Giá trị ánh sáng
 */
export function getLight(houseId: string, deviceId: number): number {
  // Kiểm tra xem device ID có phải là ID cảm biến ánh sáng hợp lệ
  if (deviceId < LIGHT_ID_MIN || deviceId > LIGHT_ID_MAX) {
    console.log(`Invalid light sensor ID: ${deviceId}`);
    return 0;
  }
  
  // Kiểm tra xem có dữ liệu cụ thể cho cảm biến này không
  if (specificSensorData[houseId] && specificSensorData[houseId][deviceId]) {
    console.log(`Using specific sensor data for houseId=${houseId}, deviceId=${deviceId}: ${specificSensorData[houseId][deviceId].value}`);
    return specificSensorData[houseId][deviceId].value;
  }
  
  // Nếu không có dữ liệu cụ thể, sử dụng dữ liệu tổng hợp
  if (sensorData[houseId]) {
    console.log(`Using general sensor data for houseId=${houseId}: ${sensorData[houseId].light}`);
    return sensorData[houseId].light;
  }
  
  console.log(`No sensor data found for houseId=${houseId}, deviceId=${deviceId}`);
  return 0;
}

/**
 * Lấy trạng thái của một thiết bị
 * @param houseId ID của ngôi nhà
 * @param deviceId ID của thiết bị
 * @returns Trạng thái thiết bị
 */
export function getStatus(houseId: string, deviceId: number): DeviceStatus {
  if (!deviceStatus[houseId] || !deviceStatus[houseId][deviceId]) {
    // Trạng thái mặc định nếu chưa có dữ liệu
    let type = "unknown";
    
    if (deviceId >= DOOR_ID_MIN && deviceId <= DOOR_ID_MAX) type = "door";
    else if (deviceId >= FAN_ID_MIN && deviceId <= FAN_ID_MAX) type = "fan";
    else if (deviceId >= RGB_ID_MIN && deviceId <= RGB_ID_MAX) type = "rgb";
    
    return { 
      type: type,
      on: false,
      lock: deviceId >= DOOR_ID_MIN && deviceId <= DOOR_ID_MAX ? false : undefined
    };
  }
  
  return deviceStatus[houseId][deviceId];
}

/**
 * Điều khiển một thiết bị
 * @param houseId ID của ngôi nhà
 * @param deviceType Loại thiết bị (door, fan, rgb, alarm)
 * @param deviceId ID của thiết bị
 * @param command Lệnh điều khiển
 */
export function controlDevice(houseId: string, deviceType: string, deviceId: number, command: string): void {
  // Kiểm tra tính hợp lệ của tham số
  if (!houseId || !deviceType || !deviceId || !command) {
    console.error('Invalid parameters for device control');
    return;
  }
  
  // Tạo message theo định dạng: "house_id:device_type:device_id:command"
  const message = `${houseId}:${deviceType}:${deviceId}:${command}`;
  
  // Gửi lệnh đến topic điều khiển
  const controlTopic = `yolouno/${houseId}/controls`;
  mqttClient.publish(controlTopic, message);
  
  console.log(`Control command sent: ${message} to topic: ${controlTopic}`);
}

/**
 * Lấy tất cả các thiết bị của một nhà
 * @param houseId ID của ngôi nhà
 * @returns Danh sách các thiết bị và trạng thái
 */
export function getAllDevices(houseId: string): Record<number, DeviceStatus> {
  if (!deviceStatus[houseId]) {
    return {};
  }
  
  return deviceStatus[houseId];
}

/**
 * Lấy tất cả dữ liệu cảm biến của một nhà
 * @param houseId ID của ngôi nhà
 * @returns Dữ liệu cảm biến
 */
export function getAllSensorData(houseId: string): SensorData {
  if (!sensorData[houseId]) {
    return { temp: 0, humi: 0, light: 0 };
  }
  
  return sensorData[houseId];
}

// Cấu trúc gọi về để điều khiển thiết bị, lấy status, dữ liệu cảm biến
// Cấu trúc để điều khiển:
// - Topic: yolouno/HOUSEID/controls |||| Ví dụ: yolouno/house1/controls
// - message: HOUSEID:DeviceType:DeviceID:command |||| Ví dụ:house1:door:7:open
// Cấu trúc lấy status:
// - Tất cả các thiết bị: yolouno/HOUSEID/status/#
// - Tất cả các cửa: yolouno/HOUSEID/status/door/#
// - Tất cả đèn RGB: yolouno/HOUSEID/status/rgb/#
// - Lấy riêng 1 thiết bị cụ thể: yolouno/HOUSEID/status/DeviceType/DeviceID
// Cấu trúc lấy dữ liệu:
// - Lấy toàn bộ dữ liệu yolouno/house1/sensors



// Luồng Dữ Liệu Từ Mạch ESP32 đến Backend
// Mạch ESP32 gửi dữ liệu qua MQTT với các topics:

// // Dữ liệu cảm biến tổng hợp
// yolouno/house1/sensors → {"temp":27.50,"humi":65.30,"light":512}

// // Dữ liệu nhiệt độ theo device ID
// yolouno/house1/status/temp/1 → "27.50"
// yolouno/house1/status/temp/2 → "27.50"
// yolouno/house1/status/temp/3 → "27.50"

// // Dữ liệu độ ẩm theo device ID
// yolouno/house1/status/humi/1 → "65.30"

// // Dữ liệu ánh sáng theo device ID
// yolouno/house1/status/light/4 → "512"

// // Trạng thái cửa
// yolouno/house1/status/door/7 → "OPEN"

// // Trạng thái quạt
// yolouno/house1/status/fan/10 → "ON"

// // Trạng thái RGB
// yolouno/house1/status/rgb/14 → "255,0,0"