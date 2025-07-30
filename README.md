# Tactile-Navigator
A real-time tactile navigation device developed for the blind.

## 🔧 Project Architecture

The project consists of a Host PC and an ESP32 Client, which communicate over a local Wi-Fi network.

```
[Camera / Video File]
       |
       | (Video Stream)
       v
+-----------------------------+   (UDP Commands: 'L', 'R', 'C')     +-------------------------+
|        Host PC              | ----------------------------------> |      ESP32-C3 Client    |
| - Python                    |                                     | - Arduino               |
| - OpenCV                    |                                     | - Wi-Fi UDP Receiver    |
| - YOLOv8 (Detect & Track)   |                                     | - Smooth Servo Control  |
| - Avoidance State Machine   |                                     |                         |
+-----------------------------+                                     +------------+------------+
                                                                                 | (PWM Signal)
                                                                                 |
                                                                                 v
                                                                            [ Servo Motor ]
```

## 🛠️ Hardware and Software Requirements

### Hardware List

* **PC**: A reasonably powerful PC (a model with an NVIDIA GPU is recommended for YOLOv8 acceleration).
* **Camera**: A standard USB webcam.
* **ESP32**: An ESP32-C3 development board (or any other ESP32 model that supports Wi-Fi).
* **Servo Motor**: A standard servo, such as an SG90 or MG90S.
* **Power Supply**: A separate 5V external power supply for the servo is highly recommended.
* **Cables**: A USB data cable and several jumper wires.

### Software List

* **PC Side**:
    * Python (3.8+).
    * `pip` package manager.
    * Git.
* **ESP32 Side**:
    * Arduino IDE (2.0+).
    * ESP32 board support package in the Arduino IDE.
    * `ESP32Servo` library.

## 🚀 Deployment and Usage

Follow these steps to deploy and run the project.

### Step 0: **Clone the Repository**:

```bash
git clone https://github.com/jelly2187/Tactile-Navigator.git
cd /control
```
    
### Step 1: Hardware Connection

**IMPORTANT**: Servos can draw significant current. It is strongly recommended to power the servo with an external 5V power supply. Ensure that the grounds of the external power supply, the ESP32, and the servo are all connected (common ground).

1.  **ESP32 `GND`** -> **Servo `GND`** (Brown wire)
2.  **ESP32 `+5V`** -> **Servo `VCC`** (Red wire)
3.  **ESP32 `GPIO06`** (configurable) -> **Servo `Signal`** (Orange wire)

### Step 2: ESP32 Firmware Deployment

1.  **Setup Environment**:
    * Open the Arduino IDE.
    * Install `esp32` board support via the "Boards Manager".
    * Search for and install the `ESP32Servo` library via the "Library Manager".
2.  **Modify the Code**:
    * Open the ESP32 firmware sketch (`tactile.ino`).
    * Modify the Wi-Fi credentials at the top of the file:
        ```cpp
        const char* ssid = "YOUR_WIFI_SSID";       // Replace with your Wi-Fi name
        const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your Wi-Fi password
        ```
3.  **Upload the Firmware**:
    * Connect the ESP32 to your PC via USB.
    * In the Arduino IDE, select the correct board (e.g., `ESP32C3 Dev Module`) and Port (COM port).
    * **IMPORTANT: flash mode:DIO**
    * Click the "Upload" button.
4.  **Get the IP Address**:
    * After the upload is successful, open the **Serial Monitor** in the Arduino IDE (set the baud rate to 115200).
    * The ESP32 will connect to your Wi-Fi and print its IP address. **Take note of this IP address** for the next step.
        ```
        Wi-Fi connected!
        IP Address: 192.168.1.105  <-- Note this address
        ```

### Step 3: PC Environment Setup

1.  **Create a Virtual Environment (Recommended) or use conda**:
    ```bash
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install Dependencies**:
    Run the following command to install all necessary Python libraries:
    ```bash
    pip install ultralytics opencv-python numpy
    ```

### Step 4: Running the Project

1.  **Configure the Script**:
    * Open the main PC script, `demo_v3.py`.
    * Modify the configuration section at the top according to your needs:
        ```python
        # --- Main Mode Selection ---
        MODE = 'camera'  # 'camera' or 'video'

        # --- Video File Configuration (only for 'video' mode) ---
        VIDEO_INPUT_PATH = "path/to/your/test_video.mp4"
        VIDEO_OUTPUT_PATH = "output/result_video.mp4"

        # --- Network Configuration (only for 'camera' mode) ---
        ESP32_IP = "192.168.1.105" # <-- !!! Replace with the IP address of your ESP32 from Step 2 !!!
        ```
2.  **Run the Script**:
    ```bash
    python demo_v3.py
    ```
    * If `MODE` is `'camera'`, the script will start the webcam, connect to the ESP32, and begin real-time obstacle avoidance.
    * If `MODE` is `'video'`, the script will process the specified video file and save the output with visualizations to the `VIDEO_OUTPUT_PATH`.

## ⚙️ Configuration and Tuning

You can adjust the following parameters in the configuration section of `obstacle_detector_final.py` to suit different scenarios:

| Parameter                  | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `MODE`                     | `'camera'` or `'video'`, selects the operating mode of the program.                                     |
| `ESP32_IP`                 | The IP address of the ESP32 client.                                                                     |
| `OBSTACLE_CLASSES`         | A list of object classes from the YOLOv8 model that should be considered as obstacles.                    |
| `CENTER_DEAD_ZONE_PERCENT` | The width percentage of the central "forward" zone. An obstacle inside this zone will trigger an avoidance maneuver. |
| `MIN_AREA_THRESHOLD`       | The minimum pixel area of a bounding box to be considered a valid obstacle. Used to filter out distant objects. |
| `AVOIDANCE_DIRECTION`      | `'L'` or `'R'`, sets the default turning direction when an avoidance maneuver is initiated.             |

## Future Improvements

* **Dynamic Path Planning**: Instead of a fixed turn direction, dynamically calculate the optimal avoidance path and angle based on the obstacle's position and size.
* **Multi-Sensor Fusion**: Integrate data from other sensors like ultrasonic or LiDAR to compensate for the limitations of pure vision in distance measurement and low-light conditions.
* **Edge Computing Deployment**: Optimize the YOLOv8 model (e.g., using YOLOv8-Nano) and deploy it on a more powerful edge device like a Jetson Nano to create a PC-independent system.
* **More Complex Robot Platforms**: Port this system to robots with more advanced mobility, such as those with mecanum wheels or bipedal robots, to enable more flexible movement and avoidance strategies.

---
