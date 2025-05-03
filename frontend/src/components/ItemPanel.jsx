import useStore from "../utils/useStore";
import { useState, useEffect } from "react";

export default function ItemPanel() {
  const selectedElement = useStore((state) => state.selectedElement);
  const changeStyle = useStore((state) => state.changeStyle);
  const updateElementData = useStore((state) => state.updateElementData);

  const [formData, setFormData] = useState({
    width: "",
    height: "",
    label: "",
    color: "",
    z: "",
  });

  const [dataForm, setDataForm] = useState({});

  useEffect(() => {
    if (selectedElement) {
      setFormData({
        width: selectedElement.width || "",
        height: selectedElement.height || "",
        label: selectedElement.label || "",
        color: selectedElement.color || "",
        z: selectedElement.z || "",
      });

      // Cập nhật form dữ liệu
      setDataForm(selectedElement.data || {});
    }
  }, [selectedElement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Nếu là trường color, loại bỏ ký tự '#' nếu có
    if (name === "color") {
      processedValue = value.replace("#", "");
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    if (selectedElement?.id) {
      changeStyle(selectedElement.id, { [name]: processedValue });
    }
  };

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({ ...prev, [name]: value }));

    if (selectedElement?.id) {
      updateElementData(selectedElement.id, { [name]: value });
    }
  };

  const renderDataFields = () => {
    if (!selectedElement || !selectedElement.data) return null;

    return (
      <div className="mt-4 p-4 border-t border-gray-300">
        {Object.entries(dataForm).map(([key, value]) => (
          <label key={key} className="flex flex-col mt-2">
            {key}:
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleDataChange}
              className="border p-1 rounded"
            />
          </label>
        ))}
      </div>
    );
  };

  if (!selectedElement) return <p>Không có phần tử nào được chọn</p>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-4 mt-4 w-full">
        {["width", "height", "label", "color", "z"].map((key) => (
          <label key={key} className="flex flex-col">
            {key === "width" && "Chiều rộng:"}
            {key === "height" && "Chiều cao:"}
            {key === "label" && "Nhãn:"}
            {key === "color" && "Màu sắc:"}
            {key === "z" && "Lớp (z-index):"}
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Nhập ${key}`}
              className="border p-1 rounded"
            />
          </label>
        ))}
        <div
          id="item-panel__color-display"
          className="bg-color rounded-2xl text-center"
          style={{
            backgroundColor: selectedElement.color
              ? `#${selectedElement.color}`
              : "transparent",
          }}
        >
          {selectedElement.color}
        </div>
      </div>
      {/* Hiển thị và chỉnh sửa dữ liệu */}
      {renderDataFields()}
      <div className="description mt-3 text-xl">
        <h1 className="font-bold underline">Thông tin phần tử</h1>
        {Object.entries(selectedElement).map(([key, value]) => (
          <p key={key}>
            {key}: {JSON.stringify(value)}
          </p>
        ))}
      </div>{" "}
    </>
  );
}
