import cv2
import socket
import time
from ultralytics import YOLO
import os

# --- 主模式选择 ---
# 'camera' -> 实时摄像头检测与无线控制
# 'video'  -> 检测本地视频文件并保存结果
MODE = 'video'

# --- 视频文件配置 (仅在 MODE = 'video' 时生效) ---
VIDEO_INPUT_PATH = "E:\\Desktop\\workplace\\adventurex\\YOLO\\datasets\\videos\\test1.mp4"  # <--- 修改为你的视频路径
VIDEO_OUTPUT_PATH = "output/result_video.mp4"  # <--- 处理后视频的保存路径

# --- 网络配置 (仅在 MODE = 'camera' 时生效) ---
ESP32_IP = "192.168.1.105"
ESP32_PORT = 12345

# --- YOLO模型与跟踪配置 ---
MODEL_PATH = 'weights/yolo11n.pt'
CONFIDENCE_THRESHOLD = 0.5
OBSTACLE_CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck']

# --- 检测与避障逻辑配置 ---
CENTER_DEAD_ZONE_PERCENT = 0.4
MIN_AREA_THRESHOLD = 8000
AVOIDANCE_DIRECTION = 'L'

# --- 状态机配置 ---
STATE_SEARCHING = "SEARCHING"
STATE_AVOIDING = "AVOIDING"


def find_closest_obstacle(detections):
    """从所有检测到的障碍物中，找到面积最大的那一个"""
    closest_obstacle = None
    max_area = 0
    if not detections:
        return None
    for obstacle in detections:
        box = obstacle['box']
        area = (box[2] - box[0]) * (box[3] - box[1])
        if area > max_area:
            max_area = area
            closest_obstacle = obstacle
    return closest_obstacle


def process_live_camera(model):
    """【模式一】处理实时摄像头流，实现智能避障并发送UDP指令"""
    current_state = STATE_SEARCHING
    tracked_obstacle_id = None

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    esp32_address = (ESP32_IP, ESP32_PORT)
    print(f"摄像头模式启动，将向 {ESP32_IP}:{ESP32_PORT} 发送数据")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("错误: 无法打开摄像头。");
        return

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    dead_zone_width = frame_width * CENTER_DEAD_ZONE_PERCENT
    left_bound = (frame_width / 2) - (dead_zone_width / 2)
    right_bound = (frame_width / 2) + (dead_zone_width / 2)

    last_signal_time = 0
    signal_interval = 0.2

    try:
        while True:
            success, frame = cap.read()
            if not success: break

            results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)

            detections = []
            if results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
                ids = results[0].boxes.id.cpu().numpy().astype(int)
                confs = results[0].boxes.conf.cpu().numpy()
                clss = results[0].boxes.cls.cpu().numpy().astype(int)
                for i, box in enumerate(boxes):
                    class_name = model.names[clss[i]]
                    area = (box[2] - box[0]) * (box[3] - box[1])
                    if confs[i] > CONFIDENCE_THRESHOLD and class_name in OBSTACLE_CLASSES and area > MIN_AREA_THRESHOLD:
                        detections.append({'id': ids[i], 'box': box, 'center_x': (box[0] + box[2]) / 2})

            closest_obstacle = find_closest_obstacle(detections)
            command = 'C'

            if current_state == STATE_SEARCHING:
                command = 'C'
                if closest_obstacle and left_bound < closest_obstacle['center_x'] < right_bound:
                    current_state = STATE_AVOIDING
                    tracked_obstacle_id = closest_obstacle['id']
                    command = AVOIDANCE_DIRECTION
            elif current_state == STATE_AVOIDING:
                command = AVOIDANCE_DIRECTION
                obstacle_passed = True
                for obs in detections:
                    if obs['id'] == tracked_obstacle_id:
                        obstacle_passed = False
                        if obs['center_x'] < left_bound or obs['center_x'] > right_bound:
                            current_state = STATE_SEARCHING
                            tracked_obstacle_id = None
                            command = 'C'
                        break
                if obstacle_passed:
                    current_state = STATE_SEARCHING
                    tracked_obstacle_id = None
                    command = 'C'

            current_time = time.time()
            if current_time - last_signal_time > signal_interval:
                sock.sendto(command.encode(), esp32_address)
                last_signal_time = current_time

            annotated_frame = results[0].plot()
            cv2.line(annotated_frame, (int(left_bound), 0), (int(left_bound), annotated_frame.shape[0]), (255, 0, 0), 2)
            cv2.line(annotated_frame, (int(right_bound), 0), (int(right_bound), annotated_frame.shape[0]), (255, 0, 0),
                     2)
            cv2.putText(annotated_frame, f"State: {current_state}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (0, 255, 255), 2)
            cv2.putText(annotated_frame, f"Tracking ID: {tracked_obstacle_id}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (0, 255, 255), 2)
            cv2.putText(annotated_frame, f"Command: {command}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255),
                        2)

            cv2.imshow("YOLOv8 Live Avoidance", annotated_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                sock.sendto('C'.encode(), esp32_address)
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        sock.close()


def process_video_file(model):
    """【模式二】处理本地视频文件，应用智能避障逻辑并保存结果"""
    current_state = STATE_SEARCHING
    tracked_obstacle_id = None

    cap = cv2.VideoCapture(VIDEO_INPUT_PATH)
    if not cap.isOpened():
        print(f"错误: 无法打开视频文件 {VIDEO_INPUT_PATH}");
        return

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # 确保输出目录存在
    output_dir = os.path.dirname(VIDEO_OUTPUT_PATH)
    if not os.path.exists(output_dir) and output_dir != '':
        os.makedirs(output_dir)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(VIDEO_OUTPUT_PATH, fourcc, fps, (frame_width, frame_height))

    print(f"视频处理模式启动，输入: {VIDEO_INPUT_PATH}, 输出: {VIDEO_OUTPUT_PATH}")

    dead_zone_width = frame_width * CENTER_DEAD_ZONE_PERCENT
    left_bound = (frame_width / 2) - (dead_zone_width / 2)
    right_bound = (frame_width / 2) + (dead_zone_width / 2)

    while True:
        success, frame = cap.read()
        if not success: break

        # 核心逻辑与摄像头模式完全相同
        results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)

        detections = []
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
            ids = results[0].boxes.id.cpu().numpy().astype(int)
            confs = results[0].boxes.conf.cpu().numpy()
            clss = results[0].boxes.cls.cpu().numpy().astype(int)
            for i, box in enumerate(boxes):
                class_name = model.names[clss[i]]
                area = (box[2] - box[0]) * (box[3] - box[1])
                if confs[i] > CONFIDENCE_THRESHOLD and class_name in OBSTACLE_CLASSES and area > MIN_AREA_THRESHOLD:
                    detections.append({'id': ids[i], 'box': box, 'center_x': (box[0] + box[2]) / 2})

        closest_obstacle = find_closest_obstacle(detections)
        command = 'C'  # 默认决策

        if current_state == STATE_SEARCHING:
            command = 'C'
            if closest_obstacle and left_bound < closest_obstacle['center_x'] < right_bound:
                current_state = STATE_AVOIDING
                tracked_obstacle_id = closest_obstacle['id']
                command = AVOIDANCE_DIRECTION
        elif current_state == STATE_AVOIDING:
            command = AVOIDANCE_DIRECTION
            obstacle_passed = True
            if closest_obstacle and closest_obstacle['id'] == tracked_obstacle_id:
                obstacle_passed = False
                if closest_obstacle['center_x'] < left_bound or closest_obstacle['center_x'] > right_bound:
                    current_state = STATE_SEARCHING
                    tracked_obstacle_id = None
                    command = 'C'
            if obstacle_passed:
                current_state = STATE_SEARCHING
                tracked_obstacle_id = None
                command = 'C'

        # 可视化
        annotated_frame = results[0].plot()
        cv2.line(annotated_frame, (int(left_bound), 0), (int(left_bound), annotated_frame.shape[0]), (255, 0, 0), 2)
        cv2.line(annotated_frame, (int(right_bound), 0), (int(right_bound), annotated_frame.shape[0]), (255, 0, 0), 2)
        cv2.putText(annotated_frame, f"State: {current_state}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(annotated_frame, f"Tracking ID: {tracked_obstacle_id}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 255), 2)
        cv2.putText(annotated_frame, f"Decision: {command}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        # 写入并显示
        out.write(annotated_frame)
        cv2.imshow('YOLOv8 Video Processing', annotated_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print(f"视频处理完成，结果已保存到 {VIDEO_OUTPUT_PATH}")


if __name__ == "__main__":
    yolo_model = YOLO(MODEL_PATH)
    print("YOLOv8 模型加载成功.")

    if MODE == 'camera':
        process_live_camera(yolo_model)
    elif MODE == 'video':
        process_video_file(yolo_model)
    else:
        print(f"错误: 未知的模式 '{MODE}'。请选择 'camera' 或 'video'。")