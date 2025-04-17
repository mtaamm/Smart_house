import useStore from "./useStore";

export default function template() {
  return {
    rectangle: (num) => {
      return {
        id: `rectangle-${num}`,
        type: "rectangle",
        x: 0,
        y: 0,
        z: useStore.getState().items.length,
        width: 100,
        height: 100,
        label: `Rectangle ${num}`,
        color: "0000ff",
      };
    },
  
    sensor: (num) => {
      return {
        id: `sensor-${num}`,
        type: "sensor",
        x: 0,
        y: 0,
        z: useStore.getState().items.length,
        width: 50,
        height: 50,
        label: `Sensor ${num}`,
        color: "00ff00",
        data: null,
      };
    },
  
    device: (num) => {
      return {
        id: `device-${num}`,
        type: "device",
        x: 0,
        y: 0,
        z: useStore.getState().items.length,
        width: 50,
        height: 50,
        label: `Device ${num}`,
        color: "ff0000",
        data: null,
      };
    },

    importRectangle: (room) => {
      return {
        id: `rectangle-${room.room_id}`,
        type: "rectangle",
        x: room.x,
        y: room.y,
        z: useStore.getState().items.length,
        width: room.width * 50,
        height: room.length * 50,
        label: room.room_name,
        color: room.color ? room.color : "0000ff",
      };
    },

    importSensor: (sensor) => {
      return {
        id: `sensor-${sensor.sensor_id}`,
        type: "sensor",
        x: sensor.x,
        y: sensor.y,
        z: useStore.getState().items.length,
        width: 50,
        height: 50,
        label: sensor.sensor_name,
        color: sensor.color ? sensor.color : "00ff00",
        data: sensor.value ? sensor.value : null,
      };
    },

    importDevice: (device) => {
      return {
        id: `device-${device.device_id}`,
        type: "device",
        x: device.x,
        y: device.y,
        z: useStore.getState().items.length,
        width: 50,
        height: 50,
        label: device.device_name,
        color: device.color? device.color : "ff0000",
        data: device.status ? device.status : null,
      };
    },

    importFloor: (floor) => {
      // return [];
      const itemsInRooms = floor.rooms.reduce((acc, room) => {
        return acc.concat(
          template().importRectangle(room),
          ...room.devices.map(template().importDevice),
          ...room.sensors.map(template().importSensor)
        );
      }, []);
    
      floor.devices.map((device) => console.log(`device ${JSON.stringify(device)}`));
      
      const devicesInFloor = floor.devices.reduce((acc, device) => {
        return [...acc, template().importDevice(device)]
      }, []);
      const sensorsInFloor = floor.sensors.reduce((acc, sensor) => {
        return [...acc, template().importSensor(sensor)]
      }, []);

      return [...itemsInRooms, ...devicesInFloor, ...sensorsInFloor];
    }
  };
}