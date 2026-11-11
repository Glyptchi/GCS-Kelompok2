import { createSlice } from '@reduxjs/toolkit';

const backendStateSlice = createSlice({
  name: 'backendState',
  initialState: {
    isBackendConnected: false,
    isRedisConnected: false,
    isVehicleConnected: false,
    vehicleId: null,
    isTelemetryStale: true,
    groupStale: {},
  },
  reducers: {
    setBackendConnection(state, action) {
      state.isBackendConnected = action.payload;
      if (!action.payload) {
        state.isRedisConnected = false;
        state.isVehicleConnected = false;
        state.isTelemetryStale = true;
        for (const key of Object.keys(state.groupStale)) state.groupStale[key] = true;
      }
    },
    setRedisConnection(state, action) {
      state.isRedisConnected = action.payload;
      if (!action.payload) {
        state.isVehicleConnected = false;
        state.isTelemetryStale = true;
        for (const key of Object.keys(state.groupStale)) state.groupStale[key] = true;
      }
    },
    updateVehicleConnection(state, action) {
      state.vehicleId = action.payload.vehicleId;
      state.isVehicleConnected = state.isBackendConnected && state.isRedisConnected && action.payload.connected;
      state.isTelemetryStale = !state.isBackendConnected || !state.isRedisConnected || action.payload.stale;
      state.groupStale = action.payload.groupStale;
    },
  },
});

export const { setBackendConnection, setRedisConnection, updateVehicleConnection } = backendStateSlice.actions;
export default backendStateSlice.reducer;
