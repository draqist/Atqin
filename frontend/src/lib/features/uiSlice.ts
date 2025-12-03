import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface representing the UI state.
 */
interface UIState {
  /**
   * Whether the sidebar is currently open.
   */
  isSidebarOpen: boolean;
  /**
   * Whether the audio player is currently visible.
   */
  audioPlayerVisible: boolean;
}

const initialState: UIState = {
  isSidebarOpen: false,
  audioPlayerVisible: false,
};

/**
 * Redux slice for managing UI state.
 */
export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Toggles the sidebar open/closed state.
     *
     * @param {UIState} state - The current state.
     */
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    /**
     * Sets the visibility of the audio player.
     *
     * @param {UIState} state - The current state.
     * @param {PayloadAction<boolean>} action - The action containing the visibility state.
     */
    setAudioVisible: (state, action: PayloadAction<boolean>) => {
      state.audioPlayerVisible = action.payload;
    },
  },
});

export const { toggleSidebar, setAudioVisible } = uiSlice.actions;
export default uiSlice.reducer;
