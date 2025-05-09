import React, { useRef } from "react";
import { useHouseData } from "../utils/useHouseData";
import useStore from "../utils/useStore";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Component có thể kéo thả
const DraggableItem = ({ id, item, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    backgroundColor: item.color ? `#${item.color}` : "transparent",
    border: item.type === "rectangle" ? "1px solid #000" : "none",
    zIndex: item.z,
    position: "absolute",
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const HouseMap = () => {
  const { loading, error, items } = useHouseData();
  const { selectElement, selectedElement, updateElement } = useStore();
  const containerRef = useRef(null);
  const { setNodeRef } = useDroppable({
    id: "droppable-container",
  });

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const id = active.id;
    const draggedItem = items.find((item) => item.id === id);

    if (draggedItem) {
      const newX = draggedItem.x + delta.x;
      const newY = draggedItem.y + delta.y;
      updateElement(id, newX, newY);

      // Tự động chọn phần tử sau khi kéo thả
      selectElement(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen  bg-purple-50">
      <div className="">
        <h1 className="text-2xl font-bold py-4 pl-4 text-purple-700">
          Bản đồ nhà thông minh
        </h1>

        <DndContext onDragEnd={handleDragEnd} className="border-2">
          <div
            ref={(node) => {
              setNodeRef(node);
              containerRef.current = node;
            }}
            className="relative border border-gray-300 rounded-lg bg-white"
            style={{ height: "calc(100vh - 120px)" }}
          >
            {items.map((item) => (
              <DraggableItem key={item.id} id={item.id} item={item}>
                <div
                  className={`cursor-pointer ${
                    selectedElement && selectedElement.id === item.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => selectElement(item.id)}
                >
                  <div className="text-xs text-center mt-1">{item.label}</div>

                  {item.type === "device" && (
                    <div className="flex justify-center items-center h-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                  )}

                  {item.type === "sensor" && (
                    <div className="flex justify-center items-center h-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                  )}
                </div>
              </DraggableItem>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default HouseMap;
