import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axiosInstance";

/* =======================
   Async Thunks
======================= */

export const createBatch = createAsyncThunk(
  "batch/create",
  async (batchData, { rejectWithValue }) => {
    try {
      const res = await api.post("/batch", batchData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create batch"
      );
    }
  }
);

export const fetchBatches = createAsyncThunk(
  "batch/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/batch");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch batches"
      );
    }
  }
);

export const updateBatch = createAsyncThunk(
  "batch/update",
  async ({ batchId, batchData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/batch/${batchId}`, batchData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update batch"
      );
    }
  }
);

export const deleteBatch = createAsyncThunk(
  "batch/delete",
  async (batchId, { rejectWithValue }) => {
    try {
      await api.delete(`/batch/${batchId}`);
      return batchId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete batch"
      );
    }
  }
);

/* =======================
   Initial State
======================= */

const initialState = {
  batches: [],
  loading: false,
  error: null,

  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

/* =======================
   Slice
======================= */

const batchSlice = createSlice({
  name: "batch",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetSuccess(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    /* ---------- Create ---------- */
    builder
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload.data || action.payload);
        state.createSuccess = true;
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ---------- Fetch ---------- */
    builder
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload.data || action.payload || [];
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ---------- Update ---------- */
    builder
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;

        const index = state.batches.findIndex(
          (b) => b._id === updated._id
        );

        if (index !== -1) {
          state.batches[index] = updated;
        }

        state.updateSuccess = true;
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ---------- Delete ---------- */
    builder
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(
          (b) => b._id !== action.payload
        );
        state.deleteSuccess = true;
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = batchSlice.actions;
export default batchSlice.reducer;
