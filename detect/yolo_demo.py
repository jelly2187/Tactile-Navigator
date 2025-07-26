from ultralytics import YOLO

# Load a model
model = YOLO("weights/yolo11n.pt")  # load an official model
# model = YOLO("path/to/best.pt")  # load a custom model

# Predict with the model
results = model("E:\\Desktop\workplace\\adventurex\\YOLO\datasets\\demo\\test.jpeg", save=True)  # predict on an image