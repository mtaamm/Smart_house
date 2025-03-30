// test.ts
import * as hardware from './backendhelper';
import * as mqtt from 'mqtt';

// Hàm để xuất tất cả thông tin từ backendhelper
function logAllData() {
  console.log('\n--- Trạng thái hiện tại ---');
  // Lấy dữ liệu từ nhà house1
  const tempHumi = hardware.getTempHumi('house1');
  console.log('Nhiệt độ:', tempHumi.temp, '°C');
  console.log('Độ ẩm:', tempHumi.humi, '%');
  
  // Lấy dữ liệu ánh sáng từ device 4
  const light = hardware.getLight('house1', 4);
  console.log('Ánh sáng:', light);
  
  // Lấy trạng thái cửa (ID 7)
  const door = hardware.getStatus('house1', 7);
  console.log('Trạng thái cửa ID 7:', door.on ? 'MỞ' : 'ĐÓNG');
  
  // Lấy trạng thái quạt (ID 10)
  const fan = hardware.getStatus('house1', 10);
  console.log('Trạng thái quạt ID 10:', fan.on ? 'BẬT' : 'TẮT');
  
  // Lấy tất cả thiết bị
  const allDevices = hardware.getAllDevices('house1');
  console.log('Số lượng thiết bị:', Object.keys(allDevices).length);
}

// Giả lập một thiết bị IoT để gửi dữ liệu thử nghiệm
function simulateIoTDevice() {
  // Kết nối MQTT client giả lập
  const simulatedClient = mqtt.connect('mqtt://test.mosquitto.org:1883');
  
  simulatedClient.on('connect', () => {
    console.log('Simulated device connected to MQTT broker');
    
    // 1. Gửi dữ liệu cảm biến tổng hợp
    const sensorData = {
      temp: 29.5,
      humi: 68.2,
      light: 420
    };
    
    simulatedClient.publish('yolouno/house1/sensors', JSON.stringify(sensorData));
    console.log('Đã gửi dữ liệu cảm biến tổng hợp');
    
    // 2. Gửi trạng thái cửa
    simulatedClient.publish('yolouno/house1/status/door/7', 'OPEN');
    console.log('Đã gửi trạng thái cửa: MỞ');
    
    // 3. Gửi trạng thái quạt
    simulatedClient.publish('yolouno/house1/status/fan/10', 'ON');
    console.log('Đã gửi trạng thái quạt: BẬT');
    
    // 4. Gửi trạng thái RGB
    simulatedClient.publish('yolouno/house1/status/rgb/14', '255,0,0');
    console.log('Đã gửi trạng thái RGB: màu đỏ');
    
    // Đóng client sau khi gửi tất cả dữ liệu
    setTimeout(() => {
      simulatedClient.end();
      console.log('Đã đóng kết nối MQTT của thiết bị giả lập');
    }, 1000);
  });
}

// Test đơn giản điều khiển thiết bị
function testDeviceControl() {
  // Mở cửa ID 7
  hardware.controlDevice('house1', 'door', 7, 'open');
  
  // Bật quạt ID 10
  hardware.controlDevice('house1', 'fan', 10, 'OFF');
  
  // Đèn RGB ID 14 đổi sang màu xanh lá
  hardware.controlDevice('house1', 'rgb', 14, '192,0,0');
  
  console.log('Đã gửi lệnh điều khiển thử nghiệm');
}

// Chương trình chính
console.log('Bắt đầu test backendhelper...');

// Chờ backendhelper kết nối MQTT trước
setTimeout(() => {
  console.log('Bắt đầu gửi dữ liệu giả lập...');
  simulateIoTDevice();
  
  // Chờ một chút để nhận dữ liệu
  setTimeout(() => {
    logAllData();
    
    // Thử điều khiển thiết bị
    testDeviceControl();
    
    // In log cuối cùng sau khi điều khiển
    setTimeout(logAllData, 2000);
  }, 2000);
}, 1000);