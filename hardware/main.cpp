#define LED_PIN 48
#define SDA_PIN GPIO_NUM_11
#define SCL_PIN GPIO_NUM_12
#define MQTT_MAX_PACKET_SIZE 1024
#define TEMP_HUMI_ID_MIN 1
#define TEMP_HUMI_ID_MAX 3
#define LIGHT_ID_MIN 4
#define LIGHT_ID_MAX 6
#define DOOR_ID_MIN 7
#define DOOR_ID_MAX 10
#define FAN_ID_MIN 11
#define FAN_ID_MAX 13
#define RGB_ID_MIN 14
#define RGB_ID_MAX 16
//Pindefine
#define luxPin1 2   // Pin cho cảm biến ánh sáng 1 (ID 4)
#define luxPin2 3   // Pin cho cảm biến ánh sáng 2 (ID 5)
#define luxPin3 4   // Pin cho cảm biến ánh sáng 3 (ID 6)
#define SERVO_PIN_1 5       // Pin điều khiển Servo
#define SERVO_PIN_2 48
#define SERVO_PIN_3 47
#define SERVO_PIN_4 38   
#define NEOPIXEL_PIN 8  // Chân kết nối đèn NeoPixel
#define NEOPIXEL_COUNT 4 // Số lượng LED
#define FAN_PIN_1 6       // Pin điều khiển quạt 1
#define FAN_PIN_2 10       // Pin điều khiển quạt 2

#define TEMP_THRESHOLD 50.0 

#include <WiFi.h>
#include <Arduino_MQTT_Client.h>
#include <Adafruit_NeoPixel.h>
#include <ThingsBoard.h>
#include "DHT20.h"
#include "Wire.h"
#include <ArduinoOTA.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>  
#include <LiquidCrystal_I2C.h>

WiFiClient wifiClient;
PubSubClient client(wifiClient);
LiquidCrystal_I2C lcd(0x21, 16, 2);
Adafruit_NeoPixel pixels(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

const char* HOUSE_ID = "e0f1ba9c-aa1d-452e-b928-d2cc3c5eedf6"; 

const char* TOPIC_ALL_CONTROLS = "yolouno/%s/controls";      // %s: house_id
const char* TOPIC_ALL_SENSORS = "yolouno/%s/sensors";        // %s: house_id
const char* TOPIC_RGB_STATUS = "yolouno/%s/status/rgb/%s";   // %s: house_id, %s: device_id
const char* TOPIC_DOOR_STATUS = "yolouno/%s/status/door/%s"; // %s: house_id, %s: device_id
const char* TOPIC_ALARM_STATUS = "yolouno/%s/status/alarm/%s"; // %s: house_id, %s: device_id
const char* TOPIC_FAN_STATUS = "yolouno/%s/status/fan/%s";   // %s: house_id, %s: device_id
const char* TOPIC_TEMP_STATUS = "yolouno/%s/status/temp/%s"; // %s: house_id, %s: device_id
const char* TOPIC_HUMI_STATUS = "yolouno/%s/status/humi/%s"; // %s: house_id, %s: device_id
const char* TOPIC_LIGHT_STATUS = "yolouno/%s/status/light/%s"; // %s: house_id, %s: device_id

unsigned long lastimageTime =0;
unsigned long lastSensorTime = 0;            // Lần cập nhật cảm biến gần nhất
unsigned long lastMQTTTime = 0;              // Lần cập nhật MQTT gần nhất
const unsigned long sensorInterval = 15000;   // Cập nhật cảm biến mỗi 5000ms (5s)
const unsigned long mqttInterval = 1000;     // Cập nhật MQTT mỗi 1000ms (1s)
const unsigned long imageInterval = 10000;

const char* ssid = "ACLAB";
const char* password = "ACLAB2023";
const char* mqtt_server = "test.mosquitto.org";

int previousLuxValue = -1;

DHT20 dht20;

// Các biến toàn cục mới
Servo doorServo;         // Đối tượng điều khiển servo
bool doorOpen = false;   // Trạng thái cửa
bool alarmActive = false; // Trạng thái báo động
bool fanActive = false;   // Trạng thái quạt
String doorPassword = "connect";
Servo doorServos[DOOR_ID_MAX - DOOR_ID_MIN + 1];  
bool doorStates[DOOR_ID_MAX - DOOR_ID_MIN + 1] = {false, false, false}; 

void InitWiFi() {
  Serial.println("Connecting to AP ...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to AP");
}

void temperature1() {
  float temp = dht20.getTemperature();
  float hum = dht20.getHumidity();
  
  lcd.setCursor(2, 0);
  lcd.print("     ");  // Xóa giá trị cũ
  lcd.setCursor(2, 0);
  lcd.print(temp, 1);
  
  lcd.setCursor(10, 0);
  lcd.print("     ");  // Xóa giá trị cũ
  lcd.setCursor(10, 0);
  lcd.print(hum, 1);
}

uint32_t currentColor = pixels.Color(0, 0, 255  ); 
// Hàm điều khiển màu đèn RGB với device ID
void setRGBColor(uint8_t r, uint8_t g, uint8_t b, int deviceId) {
  Serial.print("Setting new color for RGB ID ");
  Serial.println(deviceId);

  // Reset tất cả các LED trước
  pixels.clear();
  
  // Tạo màu mới
  currentColor = pixels.Color(r, g, b);
  
  // Hiển thị màu trên tất cả các LED
  for(int i = 0; i < NEOPIXEL_COUNT; i++) {
    pixels.setPixelColor(i, currentColor);
  }
  
  // Hiển thị màu
  pixels.show();
  
  // Gửi trạng thái màu lên MQTT với device ID
  char rgbStatusTopic[60];
  char deviceIdStr[5];
  sprintf(deviceIdStr, "%d", deviceId);
  sprintf(rgbStatusTopic, TOPIC_RGB_STATUS, HOUSE_ID, deviceIdStr);
  
  char colorStr[20];
  sprintf(colorStr, "%d,%d,%d", r, g, b);
  client.publish(rgbStatusTopic, colorStr);

  Serial.print("Đã đổi màu RGB ID ");
  Serial.print(deviceId);
  Serial.print(": ");
  Serial.print(r); Serial.print(",");
  Serial.print(g); Serial.print(",");
  Serial.println(b);
}

void reconnect() {
  while (!client.connected()) {
      Serial.print("Đang kết nối MQTT...");
      if (client.connect("ESP32_YOLOUNO29112004")) {
          Serial.println("Đã kết nối!");
          
          // Create topic with house ID
          char controlTopic[50];
          sprintf(controlTopic, TOPIC_ALL_CONTROLS, HOUSE_ID);
          
          // Subscribe to the single control topic for this house
          client.subscribe(controlTopic);
          
          // Publish status for all default devices
          char deviceIdStr[5];
          char statusTopic[60];
          
          // Gửi trạng thái cho tất cả các cửa
          for (int i = DOOR_ID_MIN; i <= DOOR_ID_MAX; i++) {
            int servoIndex = i - DOOR_ID_MIN;
            sprintf(deviceIdStr, "%d", i);
            sprintf(statusTopic, TOPIC_DOOR_STATUS, HOUSE_ID, deviceIdStr);
            client.publish(statusTopic, doorStates[servoIndex] ? "OPEN" : "CLOSED");
          }
          
          // Alarm status
          sprintf(statusTopic, TOPIC_ALARM_STATUS, HOUSE_ID, "1");
          client.publish(statusTopic, alarmActive ? "ON" : "OFF");
          
          // Fan status
          sprintf(deviceIdStr, "%d", FAN_ID_MIN);
          sprintf(statusTopic, TOPIC_FAN_STATUS, HOUSE_ID, deviceIdStr);
          client.publish(statusTopic, fanActive ? "ON" : "OFF");
          
          // RGB status
          uint8_t r = (currentColor >> 16) & 0xFF;
          uint8_t g = (currentColor >> 8) & 0xFF;
          uint8_t b = currentColor & 0xFF;
          char colorStr[20];
          sprintf(colorStr, "%d,%d,%d", r, g, b);
          
          sprintf(deviceIdStr, "%d", RGB_ID_MIN);
          sprintf(statusTopic, TOPIC_RGB_STATUS, HOUSE_ID, deviceIdStr);
          client.publish(statusTopic, colorStr);
      } else {
          Serial.print("Thất bại, mã lỗi: ");
          Serial.print(client.state());
          Serial.println(" Thử lại sau 10s...");
          delay(10000);
      }
  }
}

// Hàm đọc giá trị từ cảm biến ánh sáng theo ID
int getLightValueById(int deviceId) {
  int lightValue = 0;
  
  switch(deviceId) {
    case 4: // LIGHT_ID_MIN - cảm biến ánh sáng 1
      lightValue = analogRead(luxPin1);
      break;
    case 5: // Cảm biến ánh sáng 2
      lightValue = analogRead(luxPin2);
      break;
    case 6: // LIGHT_ID_MAX - cảm biến ánh sáng 3
      lightValue = analogRead(luxPin3);
      break;
    default:
      Serial.print("ID cảm biến ánh sáng không hợp lệ: ");
      Serial.println(deviceId);
      lightValue = 0;
      break;
  }
  
  return lightValue;
}

int luxSensor() {
  // Chỉ trả về giá trị từ cảm biến ánh sáng 1 để tương thích với code cũ
  int luxValue = analogRead(luxPin1);
  if (luxValue != previousLuxValue) {
    lcd.setCursor(2, 1);
    lcd.print("       ");  // Xóa giá trị cũ
    lcd.setCursor(2, 1);
    lcd.print(luxValue);
    previousLuxValue = luxValue;
  }  
  return luxValue;
}

// Điều khiển cửa

void toggleDoor(int deviceId) {
  // Tính chỉ số trong mảng từ device ID
  int servoIndex = deviceId - DOOR_ID_MIN;
  
  // Kiểm tra chỉ số hợp lệ
  if (servoIndex < 0 || servoIndex >= (DOOR_ID_MAX - DOOR_ID_MIN + 1)) {
    Serial.println("Chỉ số servo không hợp lệ");
    return;
  }
  
  // Đảo trạng thái cửa
  doorStates[servoIndex] = !doorStates[servoIndex];
  
  // Cập nhật biến doorOpen để tương thích với code cũ
  if (deviceId == DOOR_ID_MIN) {
    doorOpen = doorStates[servoIndex];
  }
  
  // Điều khiển servo tương ứng
  if (doorStates[servoIndex]) {
    doorServos[servoIndex].write(90);  // Mở cửa
    Serial.print("Cửa ID ");
    Serial.print(deviceId);
    Serial.println(" đã mở");
  } else {
    doorServos[servoIndex].write(0);   // Đóng cửa
    Serial.print("Cửa ID ");
    Serial.print(deviceId);
    Serial.println(" đã đóng");
  }
  
  // Gửi trạng thái lên MQTT
  char doorStatusTopic[60];
  char deviceIdStr[5];
  sprintf(deviceIdStr, "%d", deviceId);
  sprintf(doorStatusTopic, TOPIC_DOOR_STATUS, HOUSE_ID, deviceIdStr);
  client.publish(doorStatusTopic, doorStates[servoIndex] ? "OPEN" : "CLOSED");
}

// Điều chỉnh hàm setAlarm để hỗ trợ device ID
void setAlarm(bool state) {
  alarmActive = state;
  if (alarmActive) {
    // Đèn đỏ khi báo động
    setRGBColor(255, 0, 0, RGB_ID_MIN);  // Sử dụng RGB đầu tiên cho báo động
    Serial.println("Báo động BẬT");
  } else {
    // Đèn xanh lá khi bình thường
    setRGBColor(0, 255, 0, RGB_ID_MIN);
    Serial.println("Báo động TẮT");
  }
  
  // Gửi trạng thái báo động lên MQTT với house ID
  char alarmStatusTopic[60];
  sprintf(alarmStatusTopic, TOPIC_ALARM_STATUS, HOUSE_ID, "1");  // Alarm ID mặc định là 1
  client.publish(alarmStatusTopic, alarmActive ? "ON" : "OFF");
}

// Điều khiển quạt với device ID
void setFan(bool state, int deviceId) {
  // Map device ID to the correct pin
  int fanPin;
  if (deviceId == 11) {
    fanPin = FAN_PIN_1;
  } 
  else if (deviceId == 12) {
    fanPin = FAN_PIN_2;
  }
  else {
    Serial.println("Fan ID not mapped to a pin");
    return;
  }
  
  // Keep track of each fan state in an array or separate variables
  if (deviceId == FAN_ID_MIN) {
    fanActive = state;  // For backwards compatibility with your existing code
  }
  
  // Control the appropriate pin
  digitalWrite(fanPin, state ? HIGH : LOW);
  
  Serial.print("Quạt ID ");
  Serial.print(deviceId);
  Serial.println(state ? " BẬT" : " TẮT");
  
  // Publish status to MQTT
  char fanStatusTopic[60];
  char deviceIdStr[5];
  sprintf(deviceIdStr, "%d", deviceId);
  sprintf(fanStatusTopic, TOPIC_FAN_STATUS, HOUSE_ID, deviceIdStr);
  client.publish(fanStatusTopic, state ? "ON" : "OFF");
}

// Only process if it's our control topic
void callback(char* topic, byte* payload, unsigned int length) {
  // Limit message size to prevent buffer overflow
  if (length >= 255) {
    Serial.println("Message too large, rejecting");
    return;
  }
  
  // Safely copy payload with bounds checking
  char message[256]; // Large enough buffer with room for null terminator
  size_t copyLength = length < sizeof(message)-1 ? length : sizeof(message)-1;
  memcpy(message, payload, copyLength);
  message[copyLength] = '\0';
  
  String strMessage = String(message);
  String strTopic = String(topic);
  
  Serial.print("Message arrived on topic: ");
  Serial.print(strTopic);
  Serial.print(". Message: ");
  Serial.println(strMessage);

  char ourControlTopic[100]; 
  sprintf(ourControlTopic, TOPIC_ALL_CONTROLS, HOUSE_ID);

  if (strTopic == ourControlTopic) {
    // Message format: "house_id:device_type:device_id:command"
    
    int firstColon = strMessage.indexOf(':');
    int secondColon = strMessage.indexOf(':', firstColon + 1);
    int thirdColon = strMessage.indexOf(':', secondColon + 1);

    if (firstColon > 0 && secondColon > firstColon && thirdColon > secondColon) {
      String houseId = strMessage.substring(0, firstColon);
      String deviceType = strMessage.substring(firstColon + 1, secondColon);
      String deviceIdStr = strMessage.substring(secondColon + 1, thirdColon);
      String command = strMessage.substring(thirdColon + 1);
      
      int deviceId = deviceIdStr.toInt();
      String lowerCommand = command;
      lowerCommand.toLowerCase();

      Serial.print("House ID: ");
      Serial.print(houseId);
      Serial.print(", Device Type: ");
      Serial.print(deviceType);
      Serial.print(", Device ID: ");
      Serial.print(deviceId);
      Serial.print(", Command: ");
      Serial.println(command);
      
      if (houseId == HOUSE_ID) {
        // Xử lý theo loại thiết bị và device ID
        if (deviceType == "door") {
          if (deviceId >= DOOR_ID_MIN && deviceId <= DOOR_ID_MAX) {
            if (lowerCommand == "open" || lowerCommand == "close" || 
                lowerCommand == "OPEN" || lowerCommand == "CLOSED" || lowerCommand == "on" || lowerCommand == "off" ) {
              toggleDoor(deviceId);
            } else {
              Serial.println("Lệnh cửa không hợp lệ. Sử dụng: open/OPEN hoặc close/CLOSED");
            }
          } else {
            Serial.print("Device ID cửa không hợp lệ. ID nhận được: ");
            Serial.print(deviceId);
            Serial.print(", phạm vi hợp lệ: ");
            Serial.print(DOOR_ID_MIN);
            Serial.print("-");
            Serial.println(DOOR_ID_MAX);
          }
        }
        else if (deviceType == "alarm") {
          if (command == "ON") {
            setAlarm(true);
          } else if (command == "OFF") {
            setAlarm(false);
          } else {
            Serial.println("Lệnh báo động không hợp lệ. Sử dụng: ON hoặc OFF");
          }
        }
        else if (deviceType == "fan") {
          if (deviceId >= FAN_ID_MIN && deviceId <= FAN_ID_MAX) {
            if (command == "ON" || command == "on") {
              setFan(true, deviceId);
            } else if (command == "OFF" || command == "off") {
              setFan(false, deviceId);
            } else {
              Serial.println("Lệnh quạt không hợp lệ. Sử dụng: ON hoặc OFF");
            }
          } else {
            Serial.println("Device ID quạt không hợp lệ");
          }
        }
        else if (deviceType == "rgb") {
          if (deviceId >= RGB_ID_MIN && deviceId <= RGB_ID_MAX) {
            // Xử lý lệnh ON/OFF cho RGB
            if (command == "ON" || command == "on") {
              setRGBColor(254, 254, 254, deviceId);
              Serial.print("Bật đèn RGB ID ");
              Serial.println(deviceId);
            } 
            else if (command == "OFF" || command == "off") {
              setRGBColor(0, 0, 0, deviceId);
              Serial.print("Tắt đèn RGB ID ");
              Serial.println(deviceId);
            }
            // Xử lý lệnh màu sắc cụ thể theo định dạng "R,G,B"
            else {
              // Định dạng: "R,G,B" vd: "255,0,128"
              int firstComma = command.indexOf(',');
              int secondComma = command.lastIndexOf(',');
              
              if (firstComma > 0 && secondComma > firstComma) {
                int r = command.substring(0, firstComma).toInt();
                int g = command.substring(firstComma + 1, secondComma).toInt();
                int b = command.substring(secondComma + 1).toInt();
                
                // Giới hạn giá trị trong khoảng 0-255
                r = constrain(r, 0, 255);
                g = constrain(g, 0, 255);
                b = constrain(b, 0, 255);
                
                // Thiết lập màu mới
                setRGBColor(r, g, b, deviceId);
              } else {
                Serial.println("Định dạng màu không hợp lệ. Sử dụng: R,G,B hoặc ON/OFF");
              }
            }
          } else {
            Serial.println("Device ID RGB không hợp lệ");
          }
        }
        else {
          Serial.print("Loại thiết bị không xác định: ");
          Serial.println(deviceType);
        }
      } else {
        Serial.print("Lệnh không dành cho nhà này. Nhà hiện tại: ");
        Serial.println(HOUSE_ID);
      }
    } else {
      Serial.println("Định dạng lệnh không hợp lệ. Sử dụng: 'house_id:device_type:device_id:command'");
    } 
  }
}

void publishSensorData(float temperature, float humidity, int lightValue) {
  if (client.connected()) {
    char sensorTopic[60];
    char deviceIdStr[5];
    
    // Publish temperature data for each temperature sensor ID (1-3)
    for (int i = TEMP_HUMI_ID_MIN; i <= TEMP_HUMI_ID_MAX; i++) {
      sprintf(deviceIdStr, "%d", i);
      
      // Temperature
      sprintf(sensorTopic, TOPIC_TEMP_STATUS, HOUSE_ID, deviceIdStr);
      char tempStr[10];
      dtostrf(temperature, 1, 2, tempStr);
      client.publish(sensorTopic, tempStr);
      
      // Humidity
      sprintf(sensorTopic, TOPIC_HUMI_STATUS, HOUSE_ID, deviceIdStr);
      char humiStr[10];
      dtostrf(humidity, 1, 2, humiStr);
      client.publish(sensorTopic, humiStr);
    }
    
    // Publish light data for each light sensor ID (4-6) with unique values
    for (int i = LIGHT_ID_MIN; i <= LIGHT_ID_MAX; i++) {
      // Lấy giá trị ánh sáng cụ thể cho từng ID cảm biến
      int specificLightValue = getLightValueById(i);
      
      sprintf(deviceIdStr, "%d", i);
      sprintf(sensorTopic, TOPIC_LIGHT_STATUS, HOUSE_ID, deviceIdStr);
      char lightStr[10];
      sprintf(lightStr, "%d", specificLightValue);
      
      boolean published = client.publish(sensorTopic, lightStr, true);
      
      Serial.print("Đã gửi giá trị ánh sáng cho ID ");
      Serial.print(i);
      Serial.print(": ");
      Serial.print(specificLightValue);
      Serial.print(" - Topic: ");
      Serial.print(sensorTopic);
      Serial.print(" - Thành công: ");
      Serial.println(published ? "YES" : "NO");
    }
    
    sprintf(sensorTopic, TOPIC_ALL_SENSORS, HOUSE_ID);
    char sensorData[100];
    sprintf(sensorData, "{\"temp\":%.2f,\"humi\":%.2f,\"light\":%d}",
            temperature, humidity, lightValue);
    client.publish(sensorTopic, sensorData, true);
    
    Serial.println("Sensor data sent to MQTT broker with device IDs");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting setup...");



  pinMode(FAN_PIN_1, OUTPUT);
  pinMode(FAN_PIN_2, OUTPUT);
  digitalWrite(FAN_PIN_1, LOW);
  digitalWrite(FAN_PIN_2, LOW);
  
  // Khởi tạo servo
  doorServos[0].attach(SERVO_PIN_1); 
  doorServos[0].write(0);            
  
  doorServos[1].attach(SERVO_PIN_2); 
  doorServos[1].write(0);
  
  doorServos[2].attach(SERVO_PIN_3);  
  doorServos[2].write(0);
  
  doorServos[3].attach(SERVO_PIN_4);  
  doorServos[3].write(0);
  // Khởi tạo NeoPixel
  pixels.begin();
  pixels.setBrightness(50);
  pixels.clear(); 
  
  Serial.println("Initializing WiFi...");
  InitWiFi();
  Serial.println("WiFi initialized!");
  Wire.begin(SDA_PIN, SCL_PIN);
  
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  lcd.setCursor(0, 0);
  lcd.print("Smarthome System");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.setCursor(8, 0);
  lcd.print("H:");
  lcd.setCursor(0, 1);
  lcd.print("L:");

  if (dht20.begin()) {
    Serial.println("DHT20 sensor initialized!");
  } else {
    Serial.println("Failed to initialize DHT20 sensor!");
  }
  Serial.println("Setting up MQTT...");
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  if (!client.connected()) {
    reconnect();
  } 
  char statusTopic[60];
  sprintf(statusTopic, "yolouno/%s/status/device", HOUSE_ID);
  client.publish(statusTopic, "Device is online");
  Serial.println("Sent online status message");
  
  Serial.println("Setup completed!");
}

void loop() {
  unsigned long currentMillis = millis();
    
  //--- Update MQTT connection every 1s ---
  if (currentMillis - lastMQTTTime >= mqttInterval) {
    lastMQTTTime = currentMillis;
    if (!client.connected()) {
      reconnect();
    }
    client.loop();  // Always listen for MQTT messages
  }

  if (currentMillis - lastSensorTime >= sensorInterval) {
    lastSensorTime = currentMillis;
    
    dht20.read();
    float temperature = dht20.getTemperature();
    float humidity = dht20.getHumidity();
    int lightValue = luxSensor();
    temperature1();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT20 sensor!");
    } else {
      // Print sensor values to serial
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print(" °C, Humidity: ");
      Serial.print(humidity);
      Serial.print("%, Light: ");
      Serial.println(lightValue);
      
      // Kiểm tra nhiệt độ và kích hoạt báo động nếu cần
      if (temperature > TEMP_THRESHOLD && !alarmActive) {
        setAlarm(true);
        Serial.println("Báo động nhiệt độ cao!");
      }
      
      // Publish sensor data with device IDs
      publishSensorData(temperature, humidity, lightValue);
    }
  }
}
