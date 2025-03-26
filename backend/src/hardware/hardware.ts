import * as mqtt from 'mqtt';

// Interfaces for data structures
interface SensorData {
  temp?: number;
  humi?: number;
  light?: number;
  timestamp: number;
}

interface DeviceData {
  type: string;
  on: boolean;
  lock?: boolean;
  timestamp: number;
  value?: string;
}

interface Lock {
  locked: boolean;
  queue: Array<() => void>;
}

interface TopicFormats {
  [key: string]: string;
}

interface SensorCache {
  [houseId: string]: {
    [sensorId: string]: SensorData;
  };
}

interface DeviceCache {
  [houseId: string]: {
    [deviceId: string]: DeviceData;
  };
}

interface DeviceLocks {
  [key: string]: Lock;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface DeviceStatus {
  type: string;
  on: boolean;
  lock: boolean;
  value?: string;
}

interface HardwareModule {
  init(): Promise<void>;
  getTempHumi(
    houseId: string,
    sensorId: number | string,
  ): Promise<{ temp?: number; humi?: number }>;
  getLight(
    houseId: string,
    sensorId: number | string,
  ): Promise<{ light?: number }>;
  getStatus(houseId: string, deviceId: number | string): Promise<DeviceStatus>;
  controlDevice(
    houseId: string,
    deviceId: number | string,
    type: string,
    on: boolean,
    lock?: boolean,
  ): Promise<boolean>;
  setRgbColor(
    houseId: string,
    deviceId: number | string,
    r: number,
    g: number,
    b: number,
  ): Promise<boolean>;
  listDevices(): {
    [houseId: string]: {
      [deviceId: string]: DeviceStatus & { lastUpdate: number };
    };
  };
  listSensors(): {
    [houseId: string]: {
      [sensorId: string]: {
        temp?: number;
        humi?: number;
        light?: number;
        lastUpdate: number;
      };
    };
  };
}

const hardware = (() => {
  const mqttBrokerUrl: string = 'wss://test.mosquitto.org:8081';
  const options: mqtt.IClientOptions = {
    clientId: 'mqtt_hardware_module_' + Math.random().toString(16).substr(2, 8),
    clean: true,
  };

  let client: mqtt.MqttClient;
  let connected: boolean = false;

  const sensorCache: SensorCache = {};
  const deviceCache: DeviceCache = {};
  const deviceLocks: DeviceLocks = {};

  const topicFormats: TopicFormats = {
    temperature: 'yolouno/{houseId}/sensor/temperature/{sensorId}',
    humidity: 'yolouno/{houseId}/sensor/humidity/{sensorId}',
    light: 'yolouno/{houseId}/sensor/light/{sensorId}',

    doorControl: 'yolouno/{houseId}/control/door/{deviceId}',
    alarmControl: 'yolouno/{houseId}/control/alarm/{deviceId}',
    fanControl: 'yolouno/{houseId}/control/fan/{deviceId}',
    rgbControl: 'yolouno/{houseId}/control/rgb/{deviceId}',

    doorStatus: 'yolouno/{houseId}/status/door/{deviceId}',
    alarmStatus: 'yolouno/{houseId}/status/alarm/{deviceId}',
    fanStatus: 'yolouno/{houseId}/status/fan/{deviceId}',
    rgbStatus: 'yolouno/{houseId}/status/rgb/{deviceId}',
  };

  const formatTopic = (
    topicTemplate: string,
    params: { [key: string]: string | number },
  ): string => {
    let result = topicTemplate;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, String(value));
    }
    return result;
  };

  const init = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      client = mqtt.connect(mqttBrokerUrl, options);

      client.on('connect', () => {
        connected = true;
        subscribeToAllTopics();
        resolve();
      });

      client.on('error', (err: Error) => {
        reject(err);
      });

      client.on('message', handleIncomingMessage);
    });
  };

  const subscribeToAllTopics = (): void => {
    client.subscribe('yolouno/+/sensor/+/+');
    client.subscribe('yolouno/+/status/+/+');
    console.log('Subscribed to all sensor and status topics');
  };

  const handleIncomingMessage = (topic: string, message: Buffer): void => {
    const parts = topic.split('/');

    if (parts.length !== 5) return;

    const houseId = parts[1];
    const category = parts[2];
    const type = parts[3];
    const deviceId = parseInt(parts[4], 10);

    if (!sensorCache[houseId]) sensorCache[houseId] = {};
    if (!deviceCache[houseId]) deviceCache[houseId] = {};

    const value = message.toString();

    if (category === 'sensor') {
      if (!sensorCache[houseId][deviceId]) {
        sensorCache[houseId][deviceId] = { timestamp: Date.now() };
      }

      if (type === 'temperature') {
        sensorCache[houseId][deviceId].temp = parseFloat(value);
      } else if (type === 'humidity') {
        sensorCache[houseId][deviceId].humi = parseFloat(value);
      } else if (type === 'light') {
        sensorCache[houseId][deviceId].light = parseFloat(value);
      }
      sensorCache[houseId][deviceId].timestamp = Date.now();
    } else if (category === 'status') {
      if (!deviceCache[houseId][deviceId]) {
        deviceCache[houseId][deviceId] = {
          type: '',
          on: false,
          timestamp: Date.now(),
        };
      }

      deviceCache[houseId][deviceId].type = type;
      deviceCache[houseId][deviceId].on = value === 'ON';
      deviceCache[houseId][deviceId].timestamp = Date.now();
    }
  };

  const getLockKey = (houseId: string, deviceId: number | string): string =>
    `${houseId}_${deviceId}`;

  const acquireLock = (
    houseId: string,
    deviceId: number | string,
  ): Promise<void> => {
    return new Promise<void>((resolve) => {
      const key = getLockKey(houseId, deviceId);
      if (!deviceLocks[key]) {
        deviceLocks[key] = { locked: false, queue: [] };
      }

      if (deviceLocks[key].locked) {
        deviceLocks[key].queue.push(resolve);
      } else {
        deviceLocks[key].locked = true;
        resolve();
      }
    });
  };

  const releaseLock = (houseId: string, deviceId: number | string): void => {
    const key = getLockKey(houseId, deviceId);

    if (deviceLocks[key] && deviceLocks[key].locked) {
      deviceLocks[key].locked = false;
      if (deviceLocks[key].queue.length > 0) {
        const next = deviceLocks[key].queue.shift();
        if (next) next();
      }
    }
  };

  const ensureConnection = (): void => {
    if (!connected) {
      throw new Error('Not connected to MQTT broker');
    }
  };

  const getTempHumi = async (
    houseId: string,
    sensorId: number | string,
  ): Promise<{ temp?: number; humi?: number }> => {
    ensureConnection();

    if (!sensorCache[houseId] || !sensorCache[houseId][sensorId]) {
      throw new Error('Sensor data not available');
    }

    return {
      temp: sensorCache[houseId][sensorId].temp,
      humi: sensorCache[houseId][sensorId].humi,
    };
  };

  const getLight = async (
    houseId: string,
    sensorId: number | string,
  ): Promise<{ light?: number }> => {
    ensureConnection();

    if (!sensorCache[houseId] || !sensorCache[houseId][sensorId]) {
      throw new Error('Light data not available');
    }

    return { light: sensorCache[houseId][sensorId].light };
  };

  const getStatus = async (
    houseId: string,
    deviceId: number | string,
  ): Promise<DeviceStatus> => {
    ensureConnection();

    if (!deviceCache[houseId] || !deviceCache[houseId][deviceId]) {
      throw new Error('Device status not available');
    }

    return {
      type: deviceCache[houseId][deviceId].type,
      on: deviceCache[houseId][deviceId].on,
      lock: deviceCache[houseId][deviceId].lock || false,
      value: deviceCache[houseId][deviceId].value,
    };
  };

  const controlDevice = async (
    houseId: string,
    deviceId: number | string,
    type: string,
    on: boolean,
    lock: boolean = false,
  ): Promise<boolean> => {
    ensureConnection();

    await acquireLock(houseId, deviceId);

    try {
      let controlTopic: string;
      let message: string;

      switch (type) {
        case 'door':
          message = lock ? 'LOCK' : 'UNLOCK';
          controlTopic = formatTopic(topicFormats.doorControl, {
            houseId,
            deviceId,
          });
          break;
        case 'alarm':
          message = on ? 'ON' : 'OFF';
          controlTopic = formatTopic(topicFormats.alarmControl, {
            houseId,
            deviceId,
          });
          break;
        case 'fan':
          message = on ? 'ON' : 'OFF';
          controlTopic = formatTopic(topicFormats.fanControl, {
            houseId,
            deviceId,
          });
          break;
        case 'rgb':
          message = on ? 'ON' : 'OFF';
          controlTopic = formatTopic(topicFormats.rgbControl, {
            houseId,
            deviceId,
          });
          break;
        default:
          throw new Error(`Unknown device type: ${type}`);
      }

      client.publish(controlTopic, message);

      return true;
    } catch (error) {
      console.error('Error controlling device:', error);
      return false;
    } finally {
      releaseLock(houseId, deviceId);
    }
  };

  const setRgbColor = async (
    houseId: string,
    deviceId: number | string,
    r: number,
    g: number,
    b: number,
  ): Promise<boolean> => {
    ensureConnection();

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    const colorMsg = `${r},${g},${b}`;

    await acquireLock(houseId, deviceId);

    try {
      const controlTopic = formatTopic(topicFormats.rgbControl, {
        houseId,
        deviceId,
      });
      client.publish(controlTopic, colorMsg);
      return true;
    } catch (error) {
      console.error('Error setting RGB color:', error);
      return false;
    } finally {
      releaseLock(houseId, deviceId);
    }
  };

  return {
    init,
    getTempHumi,
    getLight,
    getStatus,
    controlDevice,
    setRgbColor,
  };
})();

export default hardware;
