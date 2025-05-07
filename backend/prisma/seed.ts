import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  // Tạo 2 user
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  const houseId = "e0f1ba9c-aa1d-452e-b928-d2cc3c5eedf6"; // ID của ngôi nhà

  // Tạo nhà
  await prisma.house.create({
    data: {
      house_id: houseId,
      length: 20,
      width: 10,
      init_time: new Date(),
      verify_code: null,
      verify_time: null,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        uid: user1Id,
        username: "mt",
        password: "mt",
        age: 21,
        email: "emchuaconguoiyeu1@gmail.com",
        phone: "+84898416893",
        name: "Nguyễn Đoàn Minh Tâm",
        root_owner: true,
        house_id: houseId,
        create_time: new Date(),
      },
      {
        uid: user2Id,
        username: "user2",
        password: "password2",
        age: 21,
        email: "user2@example.com",
        phone: "0987654321",
        name: "Đặng Văn Tân",
        root_owner: false,
        house_id: houseId,
        create_time: new Date(),
      },
    ],
  });

  // Tạo 2 tầng
  await prisma.floor.createMany({
    data: [
      { floor_id: 1, house_id: houseId },
      { floor_id: 2, house_id: houseId },
    ],
  });

  // Tạo 2 phòng
  const rooms = [
    { room_id: 1, floor_id: 1, house_id: houseId, name: "Phòng 101", length: 5, width: 5, x: 2, y: 2, color: "0033ff" },
    { room_id: 2, floor_id: 2, house_id: houseId, name: "Phòng 102", length: 5, width: 5, x: 6, y: 2, color: "ff0000" },
  ];
  await prisma.room.createMany({ data: rooms });

  // Tạo 3 cửa, 3 đèn, 3 quạt
  const devices = [
    { device_id: 7, house_id: houseId, floor_id: 1, name: "Cửa nhà chính", type: "door", x: 7, y: 0, color: "ffffff", init_time: new Date() },
    { device_id: 8, house_id: houseId, floor_id: 1, name: "Cửa nhà phụ", type: "door", x: 7, y: 10, color: "ffffff", init_time: new Date() },
    { device_id: 9, house_id: houseId, floor_id: 1, name: "Cửa phòng 1", type: "door", room_id: 1, color: "ffffff", init_time: new Date() },
    { device_id: 10, house_id: houseId, floor_id: 2, name: "Cửa phòng 2", type: "door", room_id: 2, color: "ffffff", init_time: new Date() },
    { device_id: 11, house_id: houseId, floor_id: 1, name: "Quạt tầng 1", type: "fan", x: 8, y: 5, color: "ffffff", init_time: new Date() },
    { device_id: 12, house_id: houseId, floor_id: 1, name: "Quạt phòng 1", type: "fan", room_id: 1, color: "ffffff", init_time: new Date() },
    { device_id: 13, house_id: houseId, floor_id: 2, name: "Quạt phòng 2", type: "fan", room_id: 2, color: "ffffff", init_time: new Date() },
    { device_id: 14, house_id: houseId, floor_id: 1, name: "Đèn tầng 1", type: "rgb", x: 10, y: 5, color: "ffffff", init_time: new Date() },
    { device_id: 15, house_id: houseId, floor_id: 1, name: "Đèn phòng 1", type: "rgb", room_id: 1, color: "ffffff", init_time: new Date() },
    { device_id: 16, house_id: houseId, floor_id: 2, name: "Đèn phòng 2", type: "rgb", room_id: 2, color: "ffffff", init_time: new Date() },
  ];
  await prisma.device.createMany({ data: devices });

  // Tạo 3 cảm biến ánh sáng, 3 temp_humi
  const sensors = [
    { sensor_id: 1, house_id: houseId, floor_id: 1, name: "Cảm biến nhiệt độ-độ ẩm tầng 1", type: "temp_humi", x: 6, y: 7, color: "ffffff", init_time: new Date() },
    { sensor_id: 2, house_id: houseId, floor_id: 1, name: "Cảm biến nhiệt độ-độ ẩm phòng 1", type: "temp_humi", room_id: 1, color: "ffffff", init_time: new Date() },
    { sensor_id: 3, house_id: houseId, floor_id: 2, name: "Cảm biến nhiệt độ-độ ẩm phòng 2", type: "temp_humi", room_id: 2, color: "ffffff", init_time: new Date() },
    { sensor_id: 4, house_id: houseId, floor_id: 1, name: "Cảm biến ánh sáng tầng 1", type: "light", x: 6, y: 10, room_id: null, color: "ffffff", init_time: new Date() },
    { sensor_id: 5, house_id: houseId, floor_id: 1, name: "Cảm biến ánh sáng phòng 1", type: "light", room_id: 1, color: "ffffff", init_time: new Date() },
    { sensor_id: 6, house_id: houseId, floor_id: 2, name: "Cảm biến ánh sáng phòng 2", type: "light", room_id: 2, color: "ffffff", init_time: new Date() },
  ];
  await prisma.sensor.createMany({ data: sensors });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
