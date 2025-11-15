import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

// 🔹 Fetch All Events
export const getAllEvents = createAsyncThunk(
  'events/getAllEvents',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.get(`${BASE_URL}/event/get-all-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.allEvents;
    } catch (error) {
      console.error('Get Events Error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || {message: 'Error fetching events'},
      );
    }
  },
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // 🔹 Get All Events
      .addCase(getAllEvents.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventSlice.reducer;
