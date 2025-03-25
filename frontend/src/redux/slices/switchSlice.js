import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  devices: {
    light: false,
    fan: false,
    airConditioner: false,
  },
};

const switchSlice = createSlice({
  name: "switch",
  initialState,
  reducers: {
    toggleSwitch: (state, action) => {
      const device = action.payload;
      state.devices[device] = !state.devices[device];
    },
  },
});

export const { toggleSwitch } = switchSlice.actions;
export default switchSlice.reducer;
