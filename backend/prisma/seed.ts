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

  // Tạo 5 phòng
  const rooms = [
    { room_id: 1, floor_id: 1, house_id: houseId, length: 5, width: 5, x: 2, y: 2 },
    { room_id: 2, floor_id: 1, house_id: houseId, length: 5, width: 5, x: 6, y: 2 },
    { room_id: 3, floor_id: 2, house_id: houseId, length: 5, width: 5, x: 2, y: 6 },
    { room_id: 4, floor_id: 2, house_id: houseId, length: 5, width: 5, x: 6, y: 6 },
    { room_id: 5, floor_id: 2, house_id: houseId, length: 5, width: 5, x: 10, y: 6 },
  ];
  await prisma.room.createMany({ data: rooms });

  // Tạo 7 thiết bị (đèn)
  const devices = [
    { device_id: 1, house_id: houseId, floor_id: 1, name: "Đèn tầng 1", type: "light", x: 10, y: 5, init_time: new Date() },
    { device_id: 2, house_id: houseId, floor_id: 2, name: "Đèn tầng 2", type: "light", x: 10, y: 5, init_time: new Date() },
    ...rooms.map((room, index) => ({
      device_id: index + 3,
      house_id: houseId,
      floor_id: room.floor_id,
      room_id: room.room_id,
      name: `Đèn phòng ${room.room_id}`,
      type: "light",
      x: room.x,
      y: room.y,
      init_time: new Date(),
    })),
  ];
  await prisma.device.createMany({ data: devices });

  // Tạo 2 cảm biến nhiệt độ, độ ẩm
  const sensors = [
    { sensor_id: 1, house_id: houseId, floor_id: 1, name: "Cảm biến tầng 1", type: "temperature_humidity", x: 2, y: 1, init_time: new Date() },
    { sensor_id: 2, house_id: houseId, floor_id: 2, name: "Cảm biến tầng 2", type: "temperature_humidity", x: 2, y: 1, init_time: new Date() },
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
