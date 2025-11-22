import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isSidebarOpen: boolean;
  audioPlayerVisible: boolean;
}

const initialState: UIState = {
  isSidebarOpen: false,
  audioPlayerVisible: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setAudioVisible: (state, action: PayloadAction<boolean>) => {
      state.audioPlayerVisible = action.payload;
    },
  },
});

export const { toggleSidebar, setAudioVisible } = uiSlice.actions;
export default uiSlice.reducer;
