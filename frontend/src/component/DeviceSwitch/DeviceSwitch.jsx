import { useDispatch, useSelector } from "react-redux";
import { toggleSwitch } from "../../redux/slices/switchSlice";

export default function DeviceSwitch({ deviceName, label }) {
  const dispatch = useDispatch();
  const isOn = useSelector((state) => state.switch.devices[deviceName]);

  return (
    <div className="flex items-center space-x-3">
      <span className="text-white">{label}</span>
      <button
        className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition ${
          isOn ? "bg-green-500" : "bg-gray-300"
        }`}
        onClick={() => dispatch(toggleSwitch(deviceName))}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
            isOn ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </button>
    </div>
  );
}
