import * as mqtt from 'mqtt';
import { SmartHomeService, DeviceStatus } from '...';

// MQTT connection settings
const mqttBrokerUrl = 'wss://test.mosquitto.org:8081';
const options = {
  clientId: 'mqtt_sensor_dashboard_' + Math.random().toString(16).substr(2, 8),
  clean: true,
};

// MQTT topics 
const TOPIC_TEMPERATURE = 'yolouno/sensor/temperature';
const TOPIC_HUMIDITY = 'yolouno/sensor/humidity';
const TOPIC_LIGHT = 'yolouno/sensor/light';
const TOPIC_DOOR = 'yolouno/control/door';
const TOPIC_ALARM = 'yolouno/control/alarm';
const TOPIC_FAN = 'yolouno/control/fan';
const TOPIC_RGB = 'yolouno/control/rgb';
const TOPIC_DOOR_STATUS = 'yolouno/status/door';
const TOPIC_ALARM_STATUS = 'yolouno/status/alarm';
const TOPIC_FAN_STATUS = 'yolouno/status/fan';
const TOPIC_RGB_COLOR = 'yolouno/status/rgb';

// Temperature threshold for alarm (match uiwwht Arduino code)
const TEMP_THRESHOLD = 30.0;

const client = mqtt.connect(mqttBrokerUrl, options);

const smartHome = new SmartHomeService(client);

const DEFAULT_HOUSE_ID = 'default';

// Map for device IDs
const deviceIdMap = {
  door: 1,
  alarm: 2,
  fan: 3,
  rgb: 4
};

smartHome.TopicMapping(DEFAULT_HOUSE_ID);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    //document.getElementById('connection-status')!.innerText = 'Đã kết nối';
    //document.getElementById('connection-status')!.style.color = 'green';
    
    // Subscribe to sensor topics
    client.subscribe(TOPIC_TEMPERATURE);
    client.subscribe(TOPIC_HUMIDITY);
    client.subscribe(TOPIC_LIGHT);
    
    // Subscribe to status topics
    client.subscribe(TOPIC_DOOR_STATUS);
    client.subscribe(TOPIC_ALARM_STATUS);
    client.subscribe(TOPIC_FAN_STATUS);
    client.subscribe(TOPIC_RGB_COLOR);
    
    //...
});