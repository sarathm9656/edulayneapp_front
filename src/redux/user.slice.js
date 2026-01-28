



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axiosInstance";

export const fetchUser = createAsyncThunk(
  "user/getUser",
  async (_, { rejectWithValue }) => {
    try {
      // Add cache-busting parameter to force fresh data
      const timestamp = new Date().getTime();
      const response = await api.get(`/users/getcurrentuser/me?t=${timestamp}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

// Add checkAuth thunk
export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/check-auth");
      console.log(response.data, "response.data");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Not authenticated" });
    }
  }
);

export const updateUser = createAsyncThunk(
  "tenant/updateUser",
  async (user) => {
    console.log(user, "users inside the updateUser");

    // Extract user ID from various possible properties
    const userId = user.user_id || user._id || user.id;

    if (!userId) {
      throw new Error("User ID is required for update");
    }

    const response = await api.put(
      `${import.meta.env.VITE_API_URL}/users/${userId}`,
      user
    );
    return response.data.data;
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Logout failed" });
    }
  }
);

export const logoutInstructor = createAsyncThunk(
  "user/logoutInstructor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_API_URL}/auth/instructor/logout`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Logout failed" });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, ((state, action) => {
      console.log("Debug - Redux fetchUser payload:", action.payload);
      console.log("Debug - Redux storing user data:", action.payload);
      state.user = action.payload
    }))
    builder.addCase(updateUser.fulfilled, (state, action) => {
      // After successful update, we'll refetch the data
      // The component will handle the refetch
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
    });
    builder.addCase(logoutInstructor.fulfilled, (state) => {
      state.user = null;
    });
    builder.addCase(logoutInstructor.rejected, (state) => {
      state.user = null;
    });
    // Add checkAuth fulfilled/rejected
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.user = null;
    });
  }
})

export default userSlice.reducer;