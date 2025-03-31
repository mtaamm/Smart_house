import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  // Tạo 2 user
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  const houseId = uuidv4();

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

  // Tạo 4 phòng
  const rooms = [
    { room_id: 1, floor_id: 1, house_id: houseId, name: "Phòng 101", length: 5, width: 5, x: 2, y: 2, color: "0033ff" },
    { room_id: 2, floor_id: 1, house_id: houseId, name: "Phòng 102", length: 5, width: 5, x: 6, y: 2, color: "ff0000" },
    { room_id: 3, floor_id: 2, house_id: houseId, name: "Phòng 201", length: 5, width: 5, x: 2, y: 6, color: "ff0000" },
    { room_id: 4, floor_id: 2, house_id: houseId, name: "Phòng 202", length: 5, width: 5, x: 6, y: 6, color: "ff0000" },
  ];
  await prisma.room.createMany({ data: rooms });

  // Tạo 4 cửa, 2 đèn, 2 quạt
  const devices = [
    { device_id: 1, house_id: houseId, floor_id: 1, name: "Cửa phòng 1", type: "door", x: null, y: null, room_id: 1, color: "ffffff", init_time: new Date() },
    { device_id: 2, house_id: houseId, floor_id: 1, name: "Cửa phòng 2", type: "door", x: null, y: null, room_id: 2, color: "ffffff", init_time: new Date() },
    { device_id: 3, house_id: houseId, floor_id: 2, name: "Cửa phòng 3", type: "door", x: null, y: null, room_id: 3, color: "ffffff", init_time: new Date() },
    { device_id: 4, house_id: houseId, floor_id: 2, name: "Cửa phòng 4", type: "door", x: null, y: null, room_id: 4, color: "ffffff", init_time: new Date() },
    { device_id: 5, house_id: houseId, floor_id: 1, name: "Đèn tầng 1", type: "rgb", x: 10, y: 5, color: "ffffff", init_time: new Date() },
    { device_id: 6, house_id: houseId, floor_id: 2, name: "Đèn tầng 2", type: "rgb", x: 10, y: 5, color: "ffffff", init_time: new Date() },
    { device_id: 7, house_id: houseId, floor_id: 1, name: "Quạt tầng 1", type: "fan", x: 10, y: 5, color: "ffffff", init_time: new Date() },
    { device_id: 8, house_id: houseId, floor_id: 2, name: "Quạt tầng 2", type: "fan", x: 10, y: 5, color: "ffffff", init_time: new Date() },
  ];
  await prisma.device.createMany({ data: devices });

  // Tạo 4 cảm biến ánh sáng. 1 temp_humi
  const sensors = [
    { sensor_id: 1, house_id: houseId, floor_id: 1, name: "Cảm biến 1", type: "light", x: null, y: null, room_id: 1, color: "ffffff", init_time: new Date() },
    { sensor_id: 2, house_id: houseId, floor_id: 1, name: "Cảm biến 2", type: "light", x: null, y: null, room_id: 2, color: "ffffff", init_time: new Date() },
    { sensor_id: 3, house_id: houseId, floor_id: 2, name: "Cảm biến 3", type: "light", x: null, y: null, room_id: 3, color: "ffffff", init_time: new Date() },
    { sensor_id: 4, house_id: houseId, floor_id: 2, name: "Cảm biến 4", type: "light", x: null, y: null, room_id: 4, color: "ffffff", init_time: new Date() },
    { sensor_id: 5, house_id: houseId, floor_id: 1, name: "Cảm biến 5", type: "temp_humi", x: 6, y: 7, room_id: null, color: "ffffff", init_time: new Date() },
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
