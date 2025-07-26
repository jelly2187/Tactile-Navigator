import cv2
import socket
import time
from ultralytics import YOLO

# --- 主模式选择 ---
MODE = 'camera'

# --- 网络配置 ---
ESP32_IP = "192.168.147.27"  # <--- !!! 修改为你的ESP32的实际IP地址 !!!
ESP32_PORT = 12345

# --- YOLO模型与跟踪配置 ---
MODEL_PATH = 'yolov8n.pt'
CONFIDENCE_THRESHOLD = 0.5
OBSTACLE_CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck']

# --- 检测与避障逻辑配置 ---
CENTER_DEAD_ZONE_PERCENT = 0.4  # 中央区域占比扩大到40%
MIN_AREA_THRESHOLD = 8000  # 最小障碍物面积阈值，根据实际情况调整
AVOIDANCE_DIRECTION = 'L'  # 默认的避障转向：'L' 或 'R'

# --- 【新增】状态机配置 ---
STATE_SEARCHING = "SEARCHING"
STATE_AVOIDING = "AVOIDING"
current_state = STATE_SEARCHING
tracked_obstacle_id = None


def find_closest_obstacle(detections):
    """从所有检测到的障碍物中，找到面积最大的那一个（作为最近的代表）"""
    closest_obstacle = None
    max_area = 0

    for obstacle in detections:
        x1, y1, x2, y2 = obstacle['box']
        area = (x2 - x1) * (y2 - y1)
        if area > max_area:
            max_area = area
            closest_obstacle = obstacle

    return closest_obstacle


def process_live_camera(model):
    """
    处理实时摄像头流，实现基于状态机和对象跟踪的智能避障。
    """
    global current_state, tracked_obstacle_id

    # 初始化网络
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    esp32_address = (ESP32_IP, ESP32_PORT)
    print(f"UDP模式启动，将向 {ESP32_IP}:{ESP32_PORT} 发送数据")

    cap = cv2.VideoCapture(2, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("错误: 无法打开摄像头。")
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

            # 【核心改变】使用 model.track() 而不是 model()
            results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)

            # 提取所有有效的检测结果
            detections = []
            if results[0].boxes.id is not None:  # 检查是否有跟踪ID
                boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
                ids = results[0].boxes.id.cpu().numpy().astype(int)
                confs = results[0].boxes.conf.cpu().numpy()
                clss = results[0].boxes.cls.cpu().numpy().astype(int)

                for i, box in enumerate(boxes):
                    class_name = model.names[clss[i]]
                    area = (box[2] - box[0]) * (box[3] - box[1])
                    if confs[i] > CONFIDENCE_THRESHOLD and class_name in OBSTACLE_CLASSES and area > MIN_AREA_THRESHOLD:
                        detections.append({
                            'id': ids[i],
                            'box': box,
                            'center_x': (box[0] + box[2]) / 2
                        })

            # 找到最近的障碍物
            closest_obstacle = find_closest_obstacle(detections)
            command = 'C'  # 默认指令

            # --- 状态机逻辑 ---
            if current_state == STATE_SEARCHING:
                command = 'C'  # 保持直行
                if closest_obstacle:
                    # 如果最近的障碍物在中央区域，则启动避障
                    if left_bound < closest_obstacle['center_x'] < right_bound:
                        current_state = STATE_AVOIDING
                        tracked_obstacle_id = closest_obstacle['id']
                        command = AVOIDANCE_DIRECTION  # 发送转向指令
                        print(f"--- 状态切换: SEARCHING -> AVOIDING (ID: {tracked_obstacle_id}) ---")

            elif current_state == STATE_AVOIDING:
                command = AVOIDANCE_DIRECTION  # 保持转向
                obstacle_passed = True  # 假设已经越过

                # 检查被跟踪的障碍物是否还在
                for obs in detections:
                    if obs['id'] == tracked_obstacle_id:
                        obstacle_passed = False  # 还没越过
                        # 如果障碍物已经移动到侧方，说明避障成功
                        if obs['center_x'] < left_bound or obs['center_x'] > right_bound:
                            current_state = STATE_SEARCHING
                            tracked_obstacle_id = None
                            command = 'C'
                            print(f"--- 状态切换: AVOIDING -> SEARCHING (成功越过 ID: {obs['id']}) ---")
                        break  # 找到了就不用再找了

                # 如果被跟踪的障碍物已经消失，也认为避障成功
                if obstacle_passed:
                    current_state = STATE_SEARCHING
                    tracked_obstacle_id = None
                    command = 'C'
                    print(f"--- 状态切换: AVOIDING -> SEARCHING (目标 ID 消失) ---")

            # 发送信号
            current_time = time.time()
            if current_time - last_signal_time > signal_interval:
                sock.sendto(command.encode(), esp32_address)
                # print(f"状态: {current_state}, 跟踪ID: {tracked_obstacle_id}, 指令: {command}")
                last_signal_time = current_time

            # --- 可视化 ---
            # 绘制辅助线和状态信息
            cv2.line(frame, (int(left_bound), 0), (int(left_bound), frame.shape[0]), (255, 0, 0), 1)
            cv2.line(frame, (int(right_bound), 0), (int(right_bound), frame.shape[0]), (255, 0, 0), 1)
            cv2.putText(frame, f"State: {current_state}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(frame, f"Tracking ID: {tracked_obstacle_id}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (0, 255, 255), 2)
            # 绘制检测框和ID
            if results[0].boxes.id is not None:
                annotated_frame = results[0].plot()
            else:
                annotated_frame = frame

            cv2.imshow("YOLOv8 Advanced Obstacle Avoidance", annotated_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                sock.sendto('C'.encode(), esp32_address)
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        sock.close()


if __name__ == "__main__":
    yolo_model = YOLO(MODEL_PATH)
    print("YOLOv8 模型加载成功.")
    process_live_camera(yolo_model)