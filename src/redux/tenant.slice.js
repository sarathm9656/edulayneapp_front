import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axiosInstance";
import { toast } from "react-toastify";

export const fetchTenant = createAsyncThunk("tenant/fetchTenant", async () => {
  console.log("fetchTenant");
  const response = await api.get("/users/getcurrentuser/me");
  console.log(response.data, 'response.data');
  

  return response.data;
});

export const fetchTenantStats = createAsyncThunk("tenants/fetchTenantStats", async () => {
  console.log("fetchTenantStats - Starting API call");
  try {
    const response = await api.get("/tenants/stats");
    console.log("fetchTenantStats - API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("fetchTenantStats - API error:", error);
    throw error;
  }
});

export const fetchLiveSessionsCount = createAsyncThunk("tenant/fetchLiveSessionsCount", async () => {
  console.log("fetchLiveSessionsCount - Starting API call");
  try {
    const response = await api.get("/tenants/live-sessions-count");
    console.log("fetchLiveSessionsCount - API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("fetchLiveSessionsCount - API error:", error);
    throw error;
  }
});

export const fetchStudents = createAsyncThunk(
  "tenant/fetchStudents",
  async () => {
    const response = await api.get("/tenants/students/get-students-by-company");
    return response.data;
  }
);
// !instructor api calls section
export const fetchInstructors = createAsyncThunk(
  "tenant/fetchInstructors",
  async () => {
    const response = await api.get("/instructors/get_all");
    return response.data.data;
  }
);
export const createInstructor = createAsyncThunk(
  "tenant/createInstructor",
  async (instructor, { rejectWithValue }) => {
    try {
      const response = await api.post("/users", instructor);
      return response.data.data;
    } catch (error) {
      // Pass backend error message to the component
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to add instructor",
        }
      );
    }
  }
);
export const deleteInstructor = createAsyncThunk(
  "tenant/deleteInstructor",
  async (instructor) => {
    console.log(instructor);

    console.log(instructor, "instructor inside the updateInstructor");
    const response = await api.delete(`/users/${instructor.user_id}`, {
      data: instructor,
    });
    return response.data.data;
  }
);
export const fetchRoleByName = createAsyncThunk(
  "tenant/fetchRoleByName",
  async (roleName) => {
    const response = await api.get(
      `/roles/name/${roleName.toLowerCase().trim()}`
    );
    return response.data;
  }
);
export const fetchInstructorById = createAsyncThunk(
  "tenant/fetchInstructorById",
  async (instructorId) => {
    const response = await api.get(
      `/instructors/get-instructor-by-id/${instructorId}`
    );
    console.log();

    console.log(
      response.data.data,
      "response.data.data instructorDetails single instructor data slice====="
    );
    return response.data.data;
  }
);

export const assignCoursesToInstructor = createAsyncThunk(
  "tenant/assignCoursesToInstructor",
  async ({ instructorId, courseIds }) => {
    console.log(instructorId, courseIds, "instructorId, courseIds");
    const response = await api.post(
      `/instructors/assign-courses/${instructorId}`,
      { courseIds }
    );
    console.log(response.data, "response.data.data");
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
    return response.data.data;
  }
);

export const deleteStudent = createAsyncThunk(
  "tenant/deleteStudent",
  async (student, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/users/${student.user_id || student._id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to delete student",
        }
      );
    }
  }
);
const tenantSlice = createSlice({
  name: "tenant",
  initialState: {
    tenant: null,
    students: [],
    instructors: [],
    instructorRole: null,
    instructorDetails: null,
    stats: {
      students: 0,
      instructors: 0,
      courses: 0,
      liveSessions: 0
    },
    liveSessionsCount: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTenant.fulfilled, (state, action) => {
      console.log("qwerty", action.payload);

      state.tenant = action.payload;
    });
    builder.addCase(fetchTenantStats.fulfilled, (state, action) => {
      console.log("Tenant stats fetched:", action.payload);
      if (action.payload.success) {
        state.stats = action.payload.data;
      }
    });
    builder.addCase(fetchLiveSessionsCount.fulfilled, (state, action) => {
      console.log("Live sessions count fetched:", action.payload);
      if (action.payload.success) {
        state.liveSessionsCount = action.payload.data.liveSessions;
      }
    });
    builder.addCase(fetchStudents.fulfilled, (state, action) => {
      state.students = action.payload.all_students || action.payload;
    });

    builder.addCase(fetchInstructors.fulfilled, (state, action) => {
      state.instructors = action.payload;
    });
    builder.addCase(createInstructor.fulfilled, (state, action) => {
      state.instructors.push(action.payload);
    });
    builder.addCase(fetchRoleByName.fulfilled, (state, action) => {
      state.instructorRole = action.payload.data;
    });

    builder.addCase(deleteInstructor.fulfilled, (state, action) => {
      // After successful delete, we'll refetch the data
      // The component will handle the refetch
    });
    builder.addCase(fetchInstructorById.fulfilled, (state, action) => {
      state.instructorDetails = action.payload;
    });
    builder.addCase(deleteStudent.fulfilled, (state, action) => {
      // After successful delete, we'll refetch the data
      // The component will handle the refetch
    });
  },
});

export default tenantSlice.reducer;
