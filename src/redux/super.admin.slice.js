import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchTenant } from "./tenant.slice";

// async thunk to fetch current super admin
export const fetchCurrentSuperAdmin = createAsyncThunk(
  "superAdmin/fetchCurrentSuperAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/superadmin/me`,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch super admin data" }
      );
    }
  }
);

// async thunk to fetch tenants
export const fetchTenantsWithCourseCountandUserCount = createAsyncThunk(
  "superAdmin/fetchTenants",
  async () => {
    console.log("fetching tenants");
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL
      }/superadmin/tenants/course-count-and-user-count`,
      {
        withCredentials: true,
      }
    );
    console.log("response", response.data);
    return response.data.tenants || [];
  }
);

// async thunk to fetch super admin statistics
export const fetchSuperAdminStats = createAsyncThunk(
  "superAdmin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/superadmin/stats`,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch super admin statistics" }
      );
    }
  }
);

// async thunk to update super admin profile
export const updateSuperAdminProfile = createAsyncThunk(
  "superAdmin/updateProfile",
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/superadmin/profile`,
        updateData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        // Refresh the super admin data
        dispatch(fetchCurrentSuperAdmin());
        toast.success("Profile updated successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
      return rejectWithValue(
        error.response?.data || { message: "Failed to update super admin profile" }
      );
    }
  }
);

// ! this is used to get the courses by tenant

export const fetchCoursesByTenant = createAsyncThunk(
  "superAdmin/fetchCoursesByTenant",
  async (tenantId) => {
    console.log("tenantId in the sice", tenantId);
    if (!tenantId) {
      return [];
    }
    console.log("tenantId inside the slice", tenantId);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/superadmin/courses/tenant/${tenantId}`,
      {
        withCredentials: true,
      }
    );
    // console.log("@@@@@@@@@@@@@@@",response);

    if (response.data.success) {
      return response.data.data;
    } else {
      return [];
    }
  }
);

export const addTenant = createAsyncThunk(
  "superAdmin/addTenant",
  async (tenant, { rejectWithValue, dispatch }) => {
    console.log("tenant in the slice", tenant);
    try {
      console.log(tenant, "tenant in the slice");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/superadmin/tenant/create-tenant`,
        tenant,
        {
          withCredentials: true,
        }
      );
      console.log(response, "response in the slice");
      toast.success("Tenant added successfully");

      // Automatically fetch fresh data after successful addition
      dispatch(fetchTenantsWithCourseCountandUserCount());

      return response.data.data;
    } catch (error) {
      console.log(error, "error in the slice");
      toast.error("Failed to add tenant");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTenant = createAsyncThunk(
  "superAdmin/deleteTenant",
  async (tenantId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/superadmin/tenant/delete/${tenantId}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Tenant deleted successfully");

      // Automatically fetch fresh data after successful deletion
      dispatch(fetchTenantsWithCourseCountandUserCount());

      return tenantId; // Return the deleted tenantId for state update
    } catch (error) {
      console.log(error, "error in the slice");
      toast.error("Failed to delete tenant");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const disableTenant = createAsyncThunk(
  "superAdmin/disableTenant",
  async (tenantId, { rejectWithValue, dispatch }) => {
    console.log(
      "disableTenant =================================================,",
      tenantId,
      "tenantId"
    );
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/superadmin/tenant/disable/${tenantId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log("response", response);
      toast.success(response.data.message);

      // Automatically fetch fresh data after successful disable
      dispatch(fetchTenantsWithCourseCountandUserCount());

      return tenantId;
    } catch (error) {
      console.log(error, "error in the slice");
      toast.error("Failed to disable tenant");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const enableTenant = createAsyncThunk(
  "superAdmin/enableTenant",
  async (tenantId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/superadmin/tenant/enable/${tenantId}`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Tenant enabled successfully");

      // Automatically fetch fresh data after successful enable
      dispatch(fetchTenantsWithCourseCountandUserCount());

      return tenantId;
    } catch (error) {
      console.log(error, "error in the slice");
      toast.error("Failed to enable tenant");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState: {
    tenantDetails: [],
    coursesByTenant: [],
    currentSuperAdmin: null,
    currentSuperAdminLoading: false,
    currentSuperAdminError: null,
    stats: {
      totalTenants: 0,
      totalUsers: 0,
      activeTenants: 0
    },
    statsLoading: false,
    statsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentSuperAdmin.pending, (state) => {
      state.currentSuperAdminLoading = true;
      state.currentSuperAdminError = null;
    });
    builder.addCase(fetchCurrentSuperAdmin.fulfilled, (state, action) => {
      state.currentSuperAdmin = action.payload;
      state.currentSuperAdminLoading = false;
      state.currentSuperAdminError = null;
    });
    builder.addCase(fetchCurrentSuperAdmin.rejected, (state, action) => {
      state.currentSuperAdminLoading = false;
      state.currentSuperAdminError =
        action.payload?.message || "Failed to fetch super admin data";
    });
    builder.addCase(
      fetchTenantsWithCourseCountandUserCount.fulfilled,
      (state, action) => {
        state.tenantDetails = action.payload;
      }
    );
    builder.addCase(fetchCoursesByTenant.fulfilled, (state, action) => {
      state.coursesByTenant = action.payload;
    });
    builder.addCase(fetchCoursesByTenant.rejected, (state, action) => {
      state.coursesByTenant = [];
    });
    builder.addCase(deleteTenant.fulfilled, (state, action) => {
      // Remove the deleted tenant from state (optional, since we're fetching fresh data)
      state.tenantDetails = state.tenantDetails.filter(
        (tenant) => tenant.tenant._id !== action.payload
      );
    });
    builder.addCase(disableTenant.fulfilled, (state, action) => {
      // Update the tenant's is_active status in the state
      state.tenantDetails = state.tenantDetails.map((tenant) =>
        tenant.tenant._id === action.payload
          ? { ...tenant, tenant: { ...tenant.tenant, is_active: false } }
          : tenant
      );
    });
    builder.addCase(enableTenant.fulfilled, (state, action) => {
      // Update the tenant's is_active status in the state
      state.tenantDetails = state.tenantDetails.map((tenant) =>
        tenant.tenant._id === action.payload
          ? { ...tenant, tenant: { ...tenant.tenant, is_active: true } }
          : tenant
      );
    });
    builder.addCase(fetchSuperAdminStats.pending, (state) => {
      state.statsLoading = true;
      state.statsError = null;
    });
    builder.addCase(fetchSuperAdminStats.fulfilled, (state, action) => {
      state.stats = action.payload;
      state.statsLoading = false;
      state.statsError = null;
    });
    builder.addCase(fetchSuperAdminStats.rejected, (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload?.message || "Failed to fetch statistics";
    });
    builder.addCase(updateSuperAdminProfile.pending, (state) => {
      state.currentSuperAdminLoading = true;
      state.currentSuperAdminError = null;
    });
    builder.addCase(updateSuperAdminProfile.fulfilled, (state, action) => {
      state.currentSuperAdmin = action.payload;
      state.currentSuperAdminLoading = false;
      state.currentSuperAdminError = null;
    });
    builder.addCase(updateSuperAdminProfile.rejected, (state, action) => {
      state.currentSuperAdminLoading = false;
      state.currentSuperAdminError = action.payload?.message || "Failed to update profile";
    });
  },
});

export default superAdminSlice.reducer;
