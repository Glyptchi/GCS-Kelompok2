import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  vehicleType: null, // mavlink-only
  autopilot: null, // mavlink-only
  mode: 'NULL',
  armStatus: false,
  heading: 0,
  pitch: 0,
  roll: 0,
  latitude: 0,
  longitude: 0,
  altitude: 0,
  altitudeMsl: 0,
  windspeed: 0,
  winddirection: 0,
  groundwind: 0,
  cog: 0,
  airspeed: 0,
  gndspeed: 0,
  climbRate: 0,
  distance: 0,
  battery: 0,
  wpCount: 0,
  gpsFixType: 0,
  satelliteCount: 0,
  hdop: 0,
  vdop: 0,
  homeLatitude: 0,
  homeLongitude: 0,
  homeAltitude: 0,
  navYaw: 0,
  navPitch: 0,
  navRoll: 0,
  navAlt: 0,
  navSpeed: 0,
  targetBearing: 0
}

const planeStateSlice = createSlice({
  name: 'planeState',
  initialState,
  reducers: {
    updatePlaneState (state, action) {
      for (const key in action.payload) {
        state[key] = action.payload[key]
      }
    },
    resetPlaneState () {
      return initialState
    }
  }
})

export const {
  updatePlaneState,
  resetPlaneState
} = planeStateSlice.actions
export default planeStateSlice.reducer
