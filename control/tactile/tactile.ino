#include <WiFi.h>
#include <WiFiUdp.h>
#include <ESP32Servo.h>
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define LED_PIN     10
#define SERVO_PIN 6
#define ANGLE_CENTER 90
#define ANGLE_LEFT 140
#define ANGLE_RIGHT 40

#define SERVO_SPEED_DELAY 15 // 每移动1度需要的时间（毫秒），值越小速度越快
Adafruit_NeoPixel pixels(1, LED_PIN, NEO_GRB + NEO_KHZ800);
int targetAngle = ANGLE_CENTER;  // 舵机的目标角度
int currentAngle = ANGLE_CENTER; // 舵机的当前角度
unsigned long lastServoUpdateTime = 0; // 上次舵机更新的时间

const char* ssid = "bourbon";
const char* password = "432mystery";

#define UDP_PORT 12345
WiFiUDP udp;
char incomingPacket[255]; // 用于存储接收到的UDP数据包
Servo myServo;

void setup() {
    // 初始化舵机
  pixels.begin(); // 初始化NeoPixel条
  pixels.setPixelColor(0, pixels.Color(0, 0, 150)); 
  pixels.show();
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myServo.attach(SERVO_PIN, 500, 2500);
  myServo.write(ANGLE_CENTER);
  Serial.begin(115200);
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  Serial.print("正在连接到 ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // 等待Wi-Fi连接成功
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Wi-Fi 连接成功!");

  Serial.print("IP 地址: ");
  Serial.println(WiFi.localIP());

  udp.begin(UDP_PORT);
  Serial.printf("UDP服务已启动, 正在监听端口 %d\n", UDP_PORT);

  digitalWrite(12, HIGH);   // turn the LED on (HIGH is the voltage level)
  digitalWrite(13, HIGH);
}

// the loop function runs over and over again forever
void loop() {
  // --- 第一部分：检查并接收新的指令 ---
  // 这部分逻辑不变，但它不再直接控制舵机，而是更新 targetAngle 变量
  int packetSize = udp.parsePacket();
  if (packetSize) {
    int len = udp.read(incomingPacket, 255);
    if (len > 0) {
      incomingPacket[len] = 0;
    }
    Serial.printf("收到来自 %s 的数据包: %s\n", udp.remoteIP().toString().c_str(), incomingPacket);
    
    char command = incomingPacket[0];
    switch (command) {
      case 'L':
        targetAngle = ANGLE_LEFT;
        pixels.setPixelColor(0, pixels.Color(0, 150, 0)); // 绿色
        pixels.show();
        break;
      case 'R':
        targetAngle = ANGLE_RIGHT;
        pixels.setPixelColor(0, pixels.Color(0, 150, 0)); // 绿色
        pixels.show();
        break;
      case 'S':
      case 'C':
        targetAngle = ANGLE_CENTER;
        pixels.setPixelColor(0, pixels.Color(150, 0, 0)); // 红色
        pixels.show();   // 更新条上的LED颜色
        break;
    }
  }

  // --- 第二部分：平滑更新舵机角度 ---
  // 这部分逻辑会在每次loop循环时执行，以固定的速度驱动舵机
  if (millis() - lastServoUpdateTime > SERVO_SPEED_DELAY) {
    lastServoUpdateTime = millis(); // 更新时间戳

    if (currentAngle < targetAngle) {
      currentAngle++; // 从当前角度向目标角度移动1度
      myServo.write(currentAngle);
    } 
    else if (currentAngle > targetAngle) {
      currentAngle--; // 从当前角度向目标角度移动1度
      myServo.write(currentAngle);
    }
    // 如果 currentAngle == targetAngle，则什么也不做，舵机保持静止
  }
}


  //Serial.println("Hello");

