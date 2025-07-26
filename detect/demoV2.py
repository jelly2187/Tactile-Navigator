import cv2
import socket
import time
from ultralytics import YOLO
import numpy as np

# --- 主模式选择 ---
# 'camera' -> 实时摄像头检测与无线控制
# 'video'  -> 检测本地视频文件并保存结果
MODE = 'camera'

# --- 视频文件配置 (仅在 MODE = 'video' 时生效) ---
VIDEO_INPUT_PATH = "path/to/your/video.mp4"  # <--- 修改为你的视频路径
VIDEO_OUTPUT_PATH = "output/result_video.mp4"  # <--- 处理后视频的保存路径

# --- 网络配置 (仅在 MODE = 'camera' 时生效) ---
ESP32_IP = "192.168.147.27"  # <--- !!! 修改为你的ESP32的实际IP地址 !!!
ESP32_PORT = 12345

# --- YOLO模型配置 ---
MODEL_PATH = 'yolov8n.pt'
CONFIDENCE_THRESHOLD = 0.5
OBSTACLE_CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck','chair','dog','cat','potted plant']

# 1. 中心死区配置 (百分比)
#    画面中心 30% 的区域被视为“正前方”，不触发左右转向。
#    例如，0.3 表示从 35% 到 65% 的区域是死区 ( (1-0.3)/2 -> 0.35 )
CENTER_DEAD_ZONE_PERCENT = 0.2

# 2. 最小障碍物面积阈值
#    边界框的面积必须大于此值才被认为是有效障碍物 (像素^2)
#    这个值需要根据你的摄像头分辨率和实际场景进行调整。
MIN_AREA_THRESHOLD = 5000


def process_frame(frame, model):
    """
    处理单帧图像，返回检测结果和绘制了边界框的图像。
    """
    # 图像预处理可以放在这里

    # 使用YOLOv8进行检测
    results = model(frame, stream=True, verbose=False)

    detected_obstacles = []

    # 分析检测结果
    for r in results:
        boxes = r.boxes
        for box in boxes:
            conf = box.conf[0]
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]

            # 筛选：置信度、类别、面积
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            box_area = (x2 - x1) * (y2 - y1)

            if conf > CONFIDENCE_THRESHOLD and class_name in OBSTACLE_CLASSES and box_area > MIN_AREA_THRESHOLD:
                # 存储有效障碍物信息
                detected_obstacles.append({
                    'center_x': (x1 + x2) / 2,
                    'box': (x1, y1, x2, y2),
                    'class_name': class_name,
                    'confidence': conf
                })

                # 在图像上绘制边界框和标签
                label = f"{class_name} {conf:.2f} Area:{box_area}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return frame, detected_obstacles


def process_live_camera(model):
    """
    处理实时摄像头流，并发送UDP指令。
    """
    # 初始化网络
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    esp32_address = (ESP32_IP, ESP32_PORT)
    print(f"UDP模式启动，将向 {ESP32_IP}:{ESP32_PORT} 发送数据")

    # 打开摄像头
    cap = cv2.VideoCapture(2, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("错误: 无法打开摄像头。")
        return

    # 获取画面尺寸用于计算边界
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    dead_zone_width = frame_width * CENTER_DEAD_ZONE_PERCENT
    left_bound = (frame_width / 2) - (dead_zone_width / 2)
    right_bound = (frame_width / 2) + (dead_zone_width / 2)

    last_signal_time = 0
    signal_interval = 0.2

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            # 绘制辅助线
            cv2.line(frame, (int(left_bound), 0), (int(left_bound), frame.shape[0]), (255, 0, 0), 1)
            cv2.line(frame, (int(right_bound), 0), (int(right_bound), frame.shape[0]), (255, 0, 0), 1)

            # 处理帧并获取检测结果
            processed_frame, obstacles = process_frame(frame, model)

            command = 'C'  # 默认指令：回中
            if obstacles:
                # 只考虑最近的（通常是最大的）或最中间的障碍物，这里简化为列表中的第一个
                main_obstacle = obstacles[0]

                if main_obstacle['center_x'] < left_bound:
                    command = 'R'  # 障碍物在左，向右避障
                elif main_obstacle['center_x'] > right_bound:
                    command = 'L'  # 障碍物在右，向左避障
                else:
                    command = 'S'  # 【新指令】障碍物在正前方，可以定义为减速或停止

            # 发送信号
            current_time = time.time()
            if current_time - last_signal_time > signal_interval:
                sock.sendto(command.encode(), esp32_address)
                print(f"发送指令: {command}")
                last_signal_time = current_time

            # 显示图像
            cv2.imshow("YOLOv8 Live Detection", processed_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                sock.sendto('C'.encode(), esp32_address)  # 退出前让舵机回中
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        sock.close()
        print("摄像头模式结束。")


def process_video_file(model):
    """
    处理本地视频文件并保存结果。
    """
    cap = cv2.VideoCapture(VIDEO_INPUT_PATH)
    if not cap.isOpened():
        print(f"错误: 无法打开视频文件 {VIDEO_INPUT_PATH}")
        return

    # 获取视频属性用于创建输出文件
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # 定义视频编码器和创建VideoWriter对象
    # 使用 'mp4v' 编码器来保存为 .mp4 文件
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(VIDEO_OUTPUT_PATH, fourcc, fps, (frame_width, frame_height))

    print(f"视频处理模式启动，输入: {VIDEO_INPUT_PATH}, 输出: {VIDEO_OUTPUT_PATH}")

    while True:
        success, frame = cap.read()
        if not success:
            break

        # 处理帧
        processed_frame, _ = process_frame(frame, model)

        # 写入输出视频
        out.write(processed_frame)

        # 显示处理过程
        cv2.imshow('YOLOv8 Video Processing', processed_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):  # 按q可提前中止
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("视频处理完成。")


if __name__ == "__main__":
    # 加载YOLOv8模型
    yolo_model = YOLO(MODEL_PATH)
    print("YOLOv8 模型加载成功.")

    if MODE == 'camera':
        process_live_camera(yolo_model)
    elif MODE == 'video':
        process_video_file(yolo_model)
    else:
        print(f"错误: 未知的模式 '{MODE}'。请选择 'camera' 或 'video'。")