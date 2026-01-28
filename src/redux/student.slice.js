import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api_url = import.meta.env.VITE_API_URL;

// Fetch student live sessions
export const fetchStudentLiveSessions = createAsyncThunk(
  'student/fetchLiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api_url}/meetings/student/live-sessions`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch student enrolled batches
export const fetchStudentBatches = createAsyncThunk(
  'student/fetchBatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api_url}/batch-student/student/enrolled-batches`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  liveSessions: [],
  liveSessionsLoading: false,
  liveSessionsError: null,
  enrolledBatches: [],
  enrolledBatchesLoading: false,
  enrolledBatchesError: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudentErrors: (state) => {
      state.liveSessionsError = null;
      state.enrolledBatchesError = null;
    },
    clearStudentData: (state) => {
      state.liveSessions = [];
      state.enrolledBatches = [];
    },
  },
  extraReducers: (builder) => {
    // Live Sessions
    builder
      .addCase(fetchStudentLiveSessions.pending, (state) => {
        state.liveSessionsLoading = true;
        state.liveSessionsError = null;
      })
      .addCase(fetchStudentLiveSessions.fulfilled, (state, action) => {
        state.liveSessionsLoading = false;
        console.log("Debug - fetchStudentLiveSessions.fulfilled payload:", action.payload);
        state.liveSessions = (action.payload && Array.isArray(action.payload.liveSessions)) ? action.payload.liveSessions : [];
      })
      .addCase(fetchStudentLiveSessions.rejected, (state, action) => {
        state.liveSessionsLoading = false;
        state.liveSessionsError = action.payload || 'Failed to fetch live sessions';
        state.liveSessions = []; // Ensure it's an array even on error
      });

    // Enrolled Batches
    builder
      .addCase(fetchStudentBatches.pending, (state) => {
        state.enrolledBatchesLoading = true;
        state.enrolledBatchesError = null;
      })
      .addCase(fetchStudentBatches.fulfilled, (state, action) => {
        state.enrolledBatchesLoading = false;
        console.log("Debug - fetchStudentBatches.fulfilled payload:", action.payload);
        state.enrolledBatches = (action.payload && Array.isArray(action.payload.batches)) ? action.payload.batches : [];
      })
      .addCase(fetchStudentBatches.rejected, (state, action) => {
        state.enrolledBatchesLoading = false;
        console.error("Debug - fetchStudentBatches.rejected:", action.payload);
        state.enrolledBatchesError = action.payload || 'Failed to fetch enrolled batches';
        state.enrolledBatches = []; // Ensure it's an array even on error
      });
  },
});

export const { clearStudentErrors, clearStudentData } = studentSlice.actions;
export default studentSlice.reducer;
