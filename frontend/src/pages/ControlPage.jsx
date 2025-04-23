import NavigationBar from "../component/NavBar/navbar.jsx";
import Navbar from "../components/Navbar.jsx";
import ItemPanel from "../components/ItemPanel.jsx";
import template from "../utils/dragable_template.js";
import { API_CONFIG, USER_CONFIG, DEFAULT_CONFIG } from "../config/appConfig";

import { useEffect, useState } from "react";
import useStore from "../utils/useStore.js";
import HouseMap from "../components/HouseMap.jsx";
import { useHouseData } from "../utils/useHouseData.js";
import axios from "axios";
import { fetchHouseData } from "../utils/apiService.js";

// Hàm tạo số ID ngẫu nhiên 6 chữ số
const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Tạo số ngẫu nhiên 6 chữ số (100000-999999)
};

function ControlPage() {
  // Ensure useStore is correctly used
  const storage = useStore();
  const shapeTemplate = template();
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    success: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch dữ liệu từ API khi trang web được tải hoặc refresh
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const success = await fetchHouseData(storage.setItemsFromApi);
        if (!success) {
          setFetchError(
            "Không thể tải dữ liệu từ API. Sử dụng dữ liệu mặc định."
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setFetchError(
          "Lỗi khi tải dữ liệu: " + (error.message || "Không xác định")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storage.setItemsFromApi]);

  function addRectangle() {
    const roomCount = storage.getElementCount("rectangle") + 1;
    const randomId = generateRandomId();
    const newRoom = {
      id: `rectangle-${randomId}`,
      type: "rectangle",
      x: 50 + (roomCount - 1) * 220,
      y: 50,
      z: 0,
      width: 200,
      height: 150,
      label: `Phòng ${roomCount}`,
      color: "b19cd9", // Màu tím pastel nhạt
      localId: roomCount, // Lưu ID cục bộ để hiển thị
    };
    storage.addElement(newRoom);
  }

  function addSensor() {
    const sensorCount = storage.getElementCount("sensor") + 1;
    const randomId = generateRandomId();
    const newSensor = {
      id: `sensor-${randomId}`,
      type: "sensor",
      x: 50 + (sensorCount - 1) * 70,
      y: 50,
      z: sensorCount + 10,
      width: 50,
      height: 50,
      label: `Cảm biến ${sensorCount}`,
      color: "a8d5ba", // Màu xanh lá pastel nhạt
      data: null,
      localId: sensorCount, // Lưu ID cục bộ để hiển thị
    };
    storage.addElement(newSensor);
  }

  function addDevice() {
    const deviceCount = storage.getElementCount("device") + 1;
    const randomId = generateRandomId();
    const newDevice = {
      id: `device-${randomId}`,
      type: "device",
      x: 300 + ((deviceCount - 1) % 3) * 100,
      y: 50 + Math.floor((deviceCount - 1) / 3) * 100,
      z: deviceCount,
      width: 50,
      height: 50,
      label: `Thiết bị ${deviceCount}`,
      color: "f7cac9", // Màu hồng pastel nhạt
      data: null,
      localId: deviceCount, // Lưu ID cục bộ để hiển thị
    };
    storage.addElement(newDevice);
  }

  function resetLocalStorage() {
    // storage.resetLocalStorage();
    localStorage.removeItem("floors");
  }

  const handleSave = async () => {
    setSaveStatus({ saving: true, success: false, message: "Đang lưu..." });

    try {
      // Lấy dữ liệu từ useStore
      const items = storage.items;

      // Chuyển đổi dữ liệu sang định dạng API
      let apiData = {
        uid: USER_CONFIG.UID,
        house_id: USER_CONFIG.HOUSE_ID,
        length: 0,
        width: 0,
        floors: [
          {
            floor_id: DEFAULT_CONFIG.FLOOR_ID,
            rooms: [],
            devices: [],
            sensors: [],
          },
        ],
      };

      // Phân loại các phần tử
      const rooms = [];
      const devices = [];
      const sensors = [];

      items.forEach((item) => {
        if (item.type === "rectangle") {
          // Lấy room_id từ id (rectangle-1 -> 1)
          const roomId = parseInt(item.id.split("-")[1]);

          rooms.push({
            room_id: roomId,
            name: item.label || `room-${roomId}`,
            length: item.height,
            width: item.width,
            x: item.x,
            y: item.y,
            color: item.color,
            devices: [],
            sensors: [],
          });
        } else if (item.type === "device") {
          // Lấy device_id từ id (device-1 -> 1)
          const deviceId = parseInt(item.id.split("-")[1]);

          devices.push({
            device_id: deviceId,
            device_type: "",
            device_name: item.label || `device-${deviceId}`,
            color: item.color,
            status: {},
            x: item.x,
            y: item.y,
          });
        } else if (item.type === "sensor") {
          // Lấy sensor_id từ id (sensor-1 -> 1)
          const sensorId = parseInt(item.id.split("-")[1]);

          sensors.push({
            sensor_id: sensorId,
            sensor_type: "",
            sensor_name: item.label || `sensor-${sensorId}`,
            color: item.color,
            x: item.x,
            y: item.y,
          });
        }
      });

      // Cập nhật dữ liệu API
      apiData.floors[0].rooms = rooms;
      apiData.floors[0].devices = devices;
      apiData.floors[0].sensors = sensors;

      console.log("Before send\n" + JSON.stringify(apiData, null, 2));

      // Gửi dữ liệu lên API
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE}`,
        apiData
      );

      console.log("Res\n" + JSON.stringify(response.data, null, 2));

      if (response.status === 201) {
        setSaveStatus({
          saving: false,
          success: true,
          message: "Đã lưu thành công!",
        });

        // Đánh dấu đã lưu trong useStore
        storage.markAsSaved();

        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
          setSaveStatus({ saving: false, success: false, message: "" });
        }, 3000);
      } else {
        throw new Error("Lỗi khi lưu dữ liệu");
      }
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      setSaveStatus({
        saving: false,
        success: false,
        message: "Lỗi khi lưu dữ liệu: " + (error.message || "Không xác định"),
      });
    }
  };

  return (
    <div className="flex flex-row gap-4 w-screen h-screen bg-purple-50">
      <Navbar></Navbar>
      <div className="w-20 flex-shrink-0"></div>

      <section className="mid flex flex-col gap-4 flex-grow h-full">
        <div className="w-full h-[90vh] flex-grow-0 overflow-hidden bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-xl font-bold">Đang tải dữ liệu...</div>
            </div>
          ) : fetchError ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-xl font-bold text-red-500">{fetchError}</div>
            </div>
          ) : (
            <div className="w-full h-full">
              <HouseMap />
            </div>
          )}
        </div>

        <div
          id="control__panel"
          className="bg-white rounded-lg shadow-md flex-grow-1 flex flex-row mt-4 h-32 p-4"
        >
          <div className="buttons flex flex-row gap-4 mt-4 ml-4 w-full justify-center items-center">
            <button
              onClick={addSensor}
              className="btn btn-warning h-10 w-1/5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-yellow-500 text-white font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Add sensor
            </button>
            <button
              onClick={addDevice}
              className="btn btn-warning h-10 w-1/5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-yellow-500 text-white font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              Add device
            </button>
            <button
              onClick={addRectangle}
              className="btn btn-warning h-10 w-1/5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-yellow-500 text-white font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Add room
            </button>
            <button
              className="btn btn-success h-10 w-1/5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-green-600 text-white font-medium"
              onClick={handleSave}
              disabled={saveStatus.saving}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              {saveStatus.saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            {saveStatus.message && (
              <div
                className={`mt-2 p-2 rounded ${
                  saveStatus.success
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {saveStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="right flex-grow bg-white rounded-lg shadow-md h-screen p-4">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-purple-700">
          Selected Elements
        </h2>
        <div className="bg-purple-50 rounded-lg p-4 shadow-inner">
          <ItemPanel></ItemPanel>
        </div>
      </section>
    </div>
  );
}

export default ControlPage;
