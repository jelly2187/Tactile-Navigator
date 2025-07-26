import cv2

# 打开摄像头（0 表示默认摄像头）
cap = cv2.VideoCapture(2, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("无法打开摄像头")
    exit()

while True:
    # 逐帧捕获
    ret, frame = cap.read()

    # 检查是否成功读取帧
    if not ret:
        print("无法接收帧（可能是流的末尾）。退出...")
        break

    # 显示当前帧
    cv2.imshow('CAMERA', frame)

    # 按下 'q' 键退出
    if cv2.waitKey(1) == ord('q'):
        break

# 释放资源并关闭窗口
cap.release()
cv2.destroyAllWindows()
