import cv2
import socket
import time
from ultralytics import YOLO

# --- 配置区 ---
# ESP32的IP地址和端口 (ESP32连接Wi-Fi后会通过串口监视器显示其IP地址)
ESP32_IP = "192.168.147.27"  # <--- !!! 重要：请修改为你的ESP32的实际IP地址 !!!
ESP32_PORT = 12345

# YOLO模型配置
MODEL_PATH = 'weights/yolo11n.pt'
CONFIDENCE_THRESHOLD = 0.5

# 摄像头配置
# CAMERA_INDEX = 0

# 障碍物类别定义
OBSTACLE_CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck', 'cat', 'dog', 'chair',
                    'potted plant']

# --- 初始化 ---
# 创建UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print(f"UDP Socket创建成功，将向 {ESP32_IP}:{ESP32_PORT} 发送数据")

# 加载YOLOv8模型
model = YOLO(MODEL_PATH)
# print("YOLOv8 模型加载成功.")

# 打开摄像头
cap = cv2.VideoCapture(2, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("错误: 无法打开摄像头.")
    exit()

print("摄像头已启动，开始检测...")

# --- 主循环 ---
last_signal_time = 0
signal_interval = 0.2  # 无线通信可以适当提高发送频率


def send_command(command):
    """通过UDP发送指令"""
    sock.sendto(command.encode(), (ESP32_IP, ESP32_PORT))
    print(f"发送指令: {command}")


try:
    while True:
        success, frame = cap.read()
        if not success:
            break

        # YOLOv8检测
        results = model(frame, stream=True, verbose=False)

        obstacle_detected = False
        obstacle_center_x = 0

        # 分析结果
        for r in results:
            boxes = r.boxes
            for box in boxes:
                conf = box.conf[0]
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]

                if conf > CONFIDENCE_THRESHOLD and class_name in OBSTACLE_CLASSES:
                    obstacle_detected = True
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    obstacle_center_x = (x1 + x2) / 2

                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label = f"{class_name} {conf:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                    break
            if obstacle_detected:
                break

        # 发送信号
        current_time = time.time()
        if current_time - last_signal_time > signal_interval:
            if obstacle_detected:
                frame_center_x = frame.shape[1] / 2
                if obstacle_center_x < frame_center_x:
                    send_command('R')  # 障碍物在左，向右避障
                else:
                    send_command('L')  # 障碍物在右，向左避障
            else:
                send_command('C')  # 无障碍物，回中
            last_signal_time = current_time

        # 显示图像
        cv2.imshow("YOLOv8 Obstacle Detection (WiFi)", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            send_command('C')  # 退出前让舵机回中
            break

finally:
    # 释放资源
    cap.release()
    cv2.destroyAllWindows()
    sock.close()
    print("程序已退出，资源已释放。")