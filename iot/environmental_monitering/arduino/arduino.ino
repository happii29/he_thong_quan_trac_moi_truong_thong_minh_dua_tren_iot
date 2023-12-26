// Include the library files
#include <DHT.h>
#include <string>
#include <UrlEncode.h>

// blynk
#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <WiFiClientSecure.h>
WidgetLED LED_WIDGET_LIGHT(V3);
WidgetLED LED_WIDGET_RAIN(V4);

// setup for mqtt with esp8266
#include <PubSubClient.h>
#include <ArduinoJson.h>
const char *mqtt_server = "192.168.1.28";
WiFiClient espClient;
PubSubClient client(espClient);

//(DHT sensor pin,sensor type)
DHT dht(D3, DHT11);

// Define Rain and LDR pins
#define rain D1
#define light D0

// gas sensor
#define gas A0

// control led
#define controlLED1 D5
#define controlLED2 D6
#define controlLED3 D7
int ledState = 0;

// blynk verify
char auth[] = "YZut-l9_GQkKdE3wTZ6CJqlZe3eeWawi"; // Enter your Auth token
char ssid[] = "BIN";                              // Enter your WIFI name
char pass[] = "123456789";                        // Enter your WIFI password

// infobip verify
String infobipUserName = "vuongankhang1606";
String infobipPassword = "A6vodich@123456789";
String infobipPhoneNumber = "84868718744";
String infobipHost = "9lk4r3.api.infobip.com";
String infoBipApiUrl = "/sms/1/text/query?username=" + infobipUserName + "&password=" + infobipPassword + "&from=EnvironmentalMonitering&to=" + infobipPhoneNumber;

// sercure client
WiFiClientSecure wifiClient;

// DEFINE gap time send sms message (2 minute)
unsigned long lastSendSMS = 60000 * 2;
unsigned long SMSInterval = 60000 * 2;

// DEFINE gap time send data to backend to save DATABASE (1 minute)
unsigned long lastSendToBackendToSaveDB = -1 * 60000;
unsigned long sendToBackendToSaveDBInterval = 60000 * 1;

void setup()
{
  Serial.begin(9600);

  dht.begin();

  // Set the rain sensor pin as an input
  pinMode(rain, INPUT);

  // set the light sensor pin as a input
  pinMode(light, INPUT);

  // set gas sensor setup
  pinMode(gas, INPUT);

  // setup for control led
  client.subscribe("changeLed");
  pinMode(controlLED1, OUTPUT);
  pinMode(controlLED2, OUTPUT);
  pinMode(controlLED3, OUTPUT);

  digitalWrite(controlLED1, LOW);
  digitalWrite(controlLED2, LOW);
  digitalWrite(controlLED3, LOW);
  ledState = 0;

  // Blynk begin
  Blynk.begin(auth, ssid, pass, "blynk.cloud", 80);
  WiFi.begin(ssid, pass);

  // sercure client to send sms
  wifiClient.setInsecure();

  // connect MQTT broker
  client.setServer(mqtt_server, 1883);
  client.setCallback(callbackMQTT);
  reconnectMQTT();
}

void loop()
{
  delay(100);

  if (!client.connected())
  {
    reconnectMQTT();
  }

  client.loop();

  Blynk.run(); // Run the Blynk library

  unsigned long now = millis();

  // Read data from all sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  bool lightValue = digitalRead(light);
  int rainValue = digitalRead(rain);
  int gasValue = map(analogRead(gas), 0, 1024, 0, 100);

  // start send data to backend realtime
  // Tạo đối tượng JSON
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["humidity"] = humidity;
  jsonDoc["temperature"] = temperature;
  jsonDoc["light"] = lightValue;
  jsonDoc["rain"] = rainValue;
  jsonDoc["gas"] = gasValue;
  jsonDoc["ledState"] = ledState;

  // Chuyển đối tượng JSON thành chuỗi JSON
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Gửi chuỗi JSON tới MQTT topic
  client.publish("sensorRealtime", jsonString.c_str());
  // end send data to backend realtime

  // save data to db after 1 minute
  if (now - lastSendToBackendToSaveDB > sendToBackendToSaveDBInterval)
  {
    client.publish("saveDB", jsonString.c_str());

    lastSendToBackendToSaveDB = now;
  }

  // send value to blynk app
  Blynk.virtualWrite(V0, temperature);
  Blynk.virtualWrite(V1, humidity);

  if (lightValue == 0)
  {
    LED_WIDGET_LIGHT.on();
  }
  else
  {
    LED_WIDGET_LIGHT.off();
  }

  if (rainValue == 0)
  {
    LED_WIDGET_RAIN.on();
  }
  else
  {
    LED_WIDGET_RAIN.off();
  }
  Blynk.virtualWrite(V2, gasValue);

  // send notification to blynk and sms after 2 minute (if has event)
  if (now - lastSendSMS > SMSInterval)
  {
    if (temperature > 50)
    {
      Blynk.logEvent("temperature", "Nhiệt độ hiện tại là " + String(temperature) + " °C. Hãy cẩn thận, quá nóng!");
      sendSms("Cảnh báo! Hiện tại nhiệt độ là " + String(temperature) + " °C. Hãy cẩn thận, quá nóng!");
      lastSendSMS = now;
    }

    if (humidity > 80)
    {
      Blynk.logEvent("humidity", "Độ ẩm hiện tại là " + String(humidity) + " %. Không khí quá ẩm, hãy đảm bảo thông thoáng.");
      sendSms("Cảnh báo! Độ ẩm hiện tại là " + String(humidity) + " %. Không khí quá ẩm, hãy đảm bảo thông thoáng.");
      lastSendSMS = now;
    }

    if (rainValue == 0)
    {
      Blynk.logEvent("rain", "Đã có mưa. Đừng quên đem ô khi ra ngoài!");
      sendSms("Cảnh báo! Trời đang mưa. Đừng quên đem ô khi ra ngoài!");
      lastSendSMS = now;
    }

    if (gasValue > 60)
    {
      Blynk.logEvent("gas", "Đã phát hiện khí gas!");
      sendSms("Cảnh báo! Đã phát hiện khí gas!");
      lastSendSMS = now;
    }
  }
}

void reconnectMQTT()
{
  // Kết nối lại tới MQTT broker
  while (!client.connected())
  {
    Serial.print("Connecting to MQTT broker...");
    if (client.connect("ESP8266Client"))
    {
      Serial.println("Connect to MQTT success");
      client.subscribe("changeLed");
    }
    else
    {
      Serial.print("Connect to MQTT failed. Try again after 5 second...");
      delay(5000);
    }
  }
}

void callbackMQTT(char *topic, byte *payload, unsigned int length)
{
  Serial.println("recevie message from mqtt");

  String message;
  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i]; // Convert *byte to string
  }

  if (message == "on")
  {
    digitalWrite(controlLED1, HIGH);
    digitalWrite(controlLED2, HIGH);
    digitalWrite(controlLED3, HIGH);
    ledState = 1;
  }
  else
  {
    digitalWrite(controlLED1, LOW);
    digitalWrite(controlLED2, LOW);
    digitalWrite(controlLED3, LOW);
    ledState = 0;
  }
}

// void send sms
void sendSms(String message)
{
  if (wifiClient.connect(infobipHost, 443))
  {
    // Send HTTP request
    wifiClient.print(F("GET "));

    wifiClient.print(infoBipApiUrl + "&text=" + urlEncode(message));

    wifiClient.println(F(" HTTP/1.0"));

    // Headers
    wifiClient.print(F("Host: "));
    wifiClient.println(infobipHost);

    wifiClient.println(F("Cache-Control: no-cache"));

    if (wifiClient.println() == 0)
    {
      Serial.println(F("Failed to send request"));
      return;
    }
  }
}