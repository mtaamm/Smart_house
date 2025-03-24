// Define types and interfaces
export interface SensorData {
    temperature: number;
    humidity: number;
    light: number;
  }
  
  export interface TempHumiData {
    temp: number;
    humi: number;
  }
  
  export interface DeviceStatus {
    type: string;
    on: boolean; 
    lock?: boolean; 
    color?: string; 
  }
  
  export interface DeviceControl {
    type: string;
    on: boolean;
    open?: boolean;
  }
  
  // Cache to store latest sensor and device status data
  class DeviceCache {
    private sensorData: Map<string, SensorData> = new Map();
    private deviceStatus: Map<string, DeviceStatus> = new Map();
    
    // Update sensor data in cache
    public updateSensorData(houseId: string, sensorId: number, data: Partial<SensorData>): void {
      const key = `${houseId}_${sensorId}`;
      
      if (!this.sensorData.has(key)) {
        this.sensorData.set(key, {
          temperature: 0,
          humidity: 0,
          light: 0
        });
      }
      
      const currentData = this.sensorData.get(key)!;
      this.sensorData.set(key, { ...currentData, ...data });
    }
    
    // Get sensor data from cache
    public getSensorData(houseId: string, sensorId: number): SensorData | undefined {
      return this.sensorData.get(`${houseId}_${sensorId}`);
    }
    
    // Update device status in cache
    public updateDeviceStatus(houseId: string, deviceId: number, status: DeviceStatus): void {
      const key = `${houseId}_${deviceId}`;
      this.deviceStatus.set(key, status);
    }
    
    // Get device status from cache
    public getDeviceStatus(houseId: string, deviceId: number): DeviceStatus | undefined {
      return this.deviceStatus.get(`${houseId}_${deviceId}`);
    }
  }
  
  export class SmartHomeService {
    private cache: DeviceCache = new DeviceCache();
    private mqttClient: any;
    private pendingControls: Map<string, number> = new Map(); 
    private controlTimeout: number = 5000; 
    private topicMappings: { [key: string]: { deviceId: number, type: string } } = {}; 
    
    constructor(mqttClient: any) {
      this.mqttClient = mqttClient;
      this.receivemessage();
    }
    
    private receivemessage(): void {

        this.mqttClient.on('message', (topic: string, message: Buffer) => {
        const data = message.toString();
        
        const topicParts = topic.split('/');
        if (topicParts.length >= 5 && topicParts[0] === 'house' && topicParts[2] === 'sensor') {
          const houseId = topicParts[1];
          const sensorId = parseInt(topicParts[3], 10);
          const sensorType = topicParts[4];
          
          if (sensorType === 'temperature') {
            this.cache.updateSensorData(houseId, sensorId, { temperature: parseFloat(data) });
          } else if (sensorType === 'humidity') {
            this.cache.updateSensorData(houseId, sensorId, { humidity: parseFloat(data) });
          } else if (sensorType === 'light') {
            this.cache.updateSensorData(houseId, sensorId, { light: parseFloat(data) });
          }
        }
        
        if (topicParts.length >= 5 && topicParts[0] === 'house' && topicParts[2] === 'device') {
          const houseId = topicParts[1];
          const deviceId = parseInt(topicParts[3], 10);
          const statusType = topicParts[4];
          
          const currentStatus = this.cache.getDeviceStatus(houseId, deviceId) || {
            type: 'unknown',
            on: false
          };
          
          if (statusType === 'door') {
            currentStatus.type = 'door';
            currentStatus.on = data === 'OPEN';
            currentStatus.lock = data === 'LOCKED';
          } else if (statusType === 'fan' || statusType === 'alarm') {
            currentStatus.type = statusType;
            currentStatus.on = data === 'ON';
          } else if (statusType === 'rgb') {
            currentStatus.type = 'rgb';
            currentStatus.color = data;
            currentStatus.on = true;
          }
          
          this.cache.updateDeviceStatus(houseId, deviceId, currentStatus);
          
          const pendingKey = `${houseId}_${deviceId}`;
          if (this.pendingControls.has(pendingKey)) {
            clearTimeout(this.pendingControls.get(pendingKey));
            this.pendingControls.delete(pendingKey);
          }
        }
      });
    }
    // Trả về Nhiệt độ
    public getTempHumi(houseId: string, sensorId: number): TempHumiData {
      const data = this.cache.getSensorData(houseId, sensorId);
      return {
        temp: data?.temperature || 0,
        humi: data?.humidity || 0
      };
    }
    // Trả về ánh sáng
    public getLight(houseId: string, sensorId: number): number {
      const data = this.cache.getSensorData(houseId, sensorId);
      return data?.light || 0;
    }
    //Trả về trạng thái
    public getStatus(houseId: string, deviceId: number): DeviceStatus {
      const status = this.cache.getDeviceStatus(houseId, deviceId);
      if (!status) {
        return {
          type: 'unknown',
          on: false
        };
      }
      return status;
    }
    
    public async controlDevice(
      houseId: string, 
      deviceId: number, 
      type: string, 
      on: boolean, 
      open?: boolean
    ): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const pendingKey = `${houseId}_${deviceId}`;
        const currentStatus = this.cache.getDeviceStatus(houseId, deviceId);
        
        if (this.pendingControls.has(pendingKey)) {
          reject(new Error("Another control operation is in progress for this device"));
          return;
        }
        
        if (currentStatus) {
          if (type !== 'door' && currentStatus.on === on) {
            console.log(`Device ${deviceId} is already ${on ? 'on' : 'off'}`);
            resolve(true);
            return;
          }
          
          if (type === 'door' && open !== undefined && 
              ((open && currentStatus.on) || (!open && !currentStatus.on))) {
            console.log(`Door ${deviceId} is already ${open ? 'open' : 'closed'}`);
            resolve(true);
            return;
          }
        }
        
        let topic: string;
        let message: string;
        
        switch (type) {
          case 'fan':
            topic = `house/${houseId}/control/fan`;
            message = on ? 'ON' : 'OFF';
            break;
          case 'alarm':
            topic = `house/${houseId}/control/alarm`;
            message = on ? 'ON' : 'OFF';
            break;
          case 'door':
            topic = `house/${houseId}/control/door`;
            message = open !== undefined ? (open ? 'OPEN' : 'CLOSE') : '1234'; 
            break;
          case 'rgb':
            topic = `house/${houseId}/control/rgb`;
            message = on ? '0,255,0' : '0,0,0'; 
            break;
          default:
            reject(new Error(`Unsupported device type: ${type}`));
            return;
        }
        
        const timeoutId = setTimeout(() => {
          this.pendingControls.delete(pendingKey);
          reject(new Error("Device control operation timed out"));
        }, this.controlTimeout);
        
        this.pendingControls.set(pendingKey, timeoutId as unknown as number);
        
        try {
          this.mqttClient.publish(topic, message);
          
          const optimisticStatus: DeviceStatus = {
            type,
            on: type === 'door' ? (open || false) : on,
          };
          
          if (type === 'door') {
            optimisticStatus.lock = !open;
          }
          
          this.cache.updateDeviceStatus(houseId, deviceId, optimisticStatus);
          
          resolve(true);
        } catch (error) {
          clearTimeout(timeoutId);
          this.pendingControls.delete(pendingKey);
          reject(error);
        }
      });
    }
//---------------------------------------------------------------------------//    
    //Phần này để cập nhật id của các thiết bị cũng như đáp ứng thêm thiết bị mới vào trong hệ thống
    public updateDeviceMapping(deviceMappings: Array<{
        topic: string, 
        deviceId: number, 
        type: string
      }>): void {
        // Xóa mapping cũ và thêm mapping mới từ database
        this.topicMappings = {};
        
        deviceMappings.forEach(mapping => {
          this.topicMappings[mapping.topic] = {
            deviceId: mapping.deviceId,
            type: mapping.type
          };
        });
      }

    // Hàm TopicMapping để ánh xạ các topic theo cấu trúc cũ.
    public TopicMapping(houseId: string): void {
    this.topicMappings = {};
    this.fetchMappingsFromDatabase(houseId).then(mappings => {
    this.updateDeviceMapping(mappings);
      });
      const topicMappings: { [key: string]: { sensorId?: number, deviceId?: number, type: string } } = {
        'yolouno/sensor/temperature': { sensorId: 1, type: 'temperature' },
        'yolouno/sensor/humidity': { sensorId: 1, type: 'humidity' },
        'yolouno/sensor/light': { sensorId: 2, type: 'light' },
        'yolouno/status/door': { deviceId: 1, type: 'door' },
        'yolouno/status/alarm': { deviceId: 2, type: 'alarm' },
        'yolouno/status/fan': { deviceId: 3, type: 'fan' },
        'yolouno/status/rgb': { deviceId: 4, type: 'rgb' }
      };
      
      this.mqttClient.on('message', (topic: string, message: Buffer) => {
        const mapping = topicMappings[topic];
        if (!mapping) return;
        
        const data = message.toString();
        
        if (mapping.sensorId !== undefined) {

          if (mapping.type === 'temperature') {
            this.cache.updateSensorData(houseId, mapping.sensorId, { temperature: parseFloat(data) });
          } else if (mapping.type === 'humidity') {
            this.cache.updateSensorData(houseId, mapping.sensorId, { humidity: parseFloat(data) });
          } else if (mapping.type === 'light') {
            this.cache.updateSensorData(houseId, mapping.sensorId, { light: parseFloat(data) });
          }
        } else if (mapping.deviceId !== undefined) {
          const deviceStatus: DeviceStatus = { type: mapping.type, on: false };
          
          if (mapping.type === 'door') {
            deviceStatus.on = data === 'OPEN';
            deviceStatus.lock = data === 'LOCKED';
          } else if (mapping.type === 'fan' || mapping.type === 'alarm') {
            deviceStatus.on = data === 'ON';
          } else if (mapping.type === 'rgb') {
            deviceStatus.on = true; 
            deviceStatus.color = data;
          }
          
          this.cache.updateDeviceStatus(houseId, mapping.deviceId, deviceStatus);
        }
      });
    }
    public registerNewDevice(
        houseId: string, 
        deviceId: number, 
        type: string, 
        topics: {control: string, status: string}
      ): void {
        // Đăng ký topic thiết bị mới
        this.mqttClient.subscribe(topics.status);
        
        // Thêm vào mapping
        this.topicMappings[topics.status] = {
          deviceId: deviceId,
          type: type
        };
        
        // Có thể lưu mapping mới vào database
      }
    // private async fetchMappingsFromDatabase(houseId: string):{
    //     Gọi API hoặc truy vấn database để lấy mapping cho houseId
    //     Phần này tui chịu =)))))
    // }
  }