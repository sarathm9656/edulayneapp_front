import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axiosInstance";

export const fetchCourses = createAsyncThunk(
  "instructors/instructor-courses",
  async () => {
    const response = await api.get(
      `/instructors/instructor-courses`,
      { withCredentials: true }
    );
    return response.data.data;
  }
);

export const fetchMeetings = createAsyncThunk(
  "instructors/fetchMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/meetings/meetings`,
        { withCredentials: true }
      );
      return response.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInstructorLiveSessions = createAsyncThunk(
  "instructors/fetchInstructorLiveSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/meetings/instructor/live-sessions`,
        { withCredentials: true }
      );
      return response.data.liveSessions;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMeeting = createAsyncThunk(
  "instructors/createMeeting",
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/meetings/create_meetings`,
        meetingData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMeeting = createAsyncThunk(
  "instructors/updateMeeting",
  async ({ dyte_meeting_id, updatedMeetingData }, { rejectWithValue }) => {
    try {
      console.log(updatedMeetingData);

      await api.put(
        `/meetings/edit_meetings/${dyte_meeting_id}`,
        updatedMeetingData,
        { withCredentials: true }
      );
      // Return the id and updated data for local update
      return { dyte_meeting_id, updatedMeetingData };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelMeeting = createAsyncThunk(
  "instructors/cancelMeeting",
  async (dyte_meeting_id, { rejectWithValue }) => {
    try {
      await api.put(
        `/meetings/cancel_meetings/${dyte_meeting_id}`,
        { status: 'cancelled' },
        { withCredentials: true }
      );
      return dyte_meeting_id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  "instructors/deleteMeeting",
  async (dyte_meeting_id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/meetings/delete_meetings/${dyte_meeting_id}`,
        { withCredentials: true }
      );
      return dyte_meeting_id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const assignBatchToMeeting = createAsyncThunk(
  "instructors/assignBatchToMeeting",
  async ({ dyte_meeting_id, batch_id }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/meetings/assign-batch/${dyte_meeting_id}`,
        { batch_id },
        { withCredentials: true }
      );
      return { dyte_meeting_id, batch_id, liveSession: response.data.liveSession };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStudent = createAsyncThunk(
  "instructors/fetchStudent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/instructors/students`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyBatches = createAsyncThunk(
  "instructors/fetchMyBatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/batch/instructor/my-batches`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBatchStudents = createAsyncThunk(
  "instructors/fetchBatchStudents",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/batch/${batchId}/students`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllStudentsForInstructor = createAsyncThunk(
  "instructors/fetchAllStudentsForInstructor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/instructors/get-students-by-batch`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInstructorPayments = createAsyncThunk(
  "instructors/fetchInstructorPayments",
  async (_, { rejectWithValue }) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const response = await api.get(
        `/meetings/instructor-payments?month=${currentMonth}&year=${currentYear}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createStudent = createAsyncThunk(
  "instructors/createStudent",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/instructors/students`,
        studentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "instructors/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      await api.delete(
        `/instructor/students/${studentId}`,
        { withCredentials: true }
      );
      return studentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



const InstructorSlice = createSlice({
  name: "InstructorSlice",
  initialState: {
    courses: [],
    meetings: [],
    meetingsLoading: false,
    meetingsError: null,
    instructorLiveSessions: [],
    instructorLiveSessionsLoading: false,
    instructorLiveSessionsError: null,
    createMeetingLoading: false,
    createMeetingError: null,
    updateMeetingLoading: false,
    updateMeetingError: null,
    cancelMeetingLoading: false,
    cancelMeetingError: null,
    deleteMeetingLoading: false,
    deleteMeetingError: null,
    students: [],
    studentsLoading: false,
    studentsError: null,
    createStudentLoading: false,
    createStudentError: null,
    deleteStudentLoading: false,
    deleteStudentError: null,
    myBatches: [],
    myBatchesLoading: false,
    myBatchesError: null,
    batchStudents: [],
    batchStudentsLoading: false,
    batchStudentsError: null,
    instructorPayments: null,
    instructorPaymentsLoading: false,
    instructorPaymentsError: null,
    allStudents: null,
    allStudentsLoading: false,
    allStudentsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.courses = action.payload;
    });
    builder
      .addCase(fetchMeetings.pending, (state) => {
        state.meetingsLoading = true;
        state.meetingsError = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.meetings = Array.isArray(action.payload) ? action.payload : [];
        state.meetingsLoading = false;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.meetingsLoading = false;
        state.meetingsError = action.payload || 'Failed to fetch meetings';
      });

    builder
      .addCase(fetchInstructorLiveSessions.pending, (state) => {
        state.instructorLiveSessionsLoading = true;
        state.instructorLiveSessionsError = null;
      })
      .addCase(fetchInstructorLiveSessions.fulfilled, (state, action) => {
        state.instructorLiveSessions = Array.isArray(action.payload) ? action.payload : [];
        state.instructorLiveSessionsLoading = false;
      })
      .addCase(fetchInstructorLiveSessions.rejected, (state, action) => {
        state.instructorLiveSessionsLoading = false;
        state.instructorLiveSessionsError = action.payload;
      })
      .addCase(createMeeting.pending, (state) => {
        state.createMeetingLoading = true;
        state.createMeetingError = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.createMeetingLoading = false;
        // Add to both meetings and instructorLiveSessions arrays
        state.meetings.push(action.payload);
        state.instructorLiveSessions.push(action.payload);
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.createMeetingLoading = false;
        state.createMeetingError = action.payload || 'Failed to create meeting';
      })
      .addCase(updateMeeting.pending, (state) => {
        state.updateMeetingLoading = true;
        state.updateMeetingError = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.updateMeetingLoading = false;
        // Find and update the meeting in both arrays
        const meetingsIdx = state.meetings.findIndex(m => m.dyte_meeting_id === action.payload.dyte_meeting_id);
        if (meetingsIdx !== -1) {
          state.meetings[meetingsIdx] = {
            ...state.meetings[meetingsIdx],
            ...action.payload.updatedMeetingData
          };
        }

        const liveSessionsIdx = state.instructorLiveSessions.findIndex(m => m.dyte_meeting_id === action.payload.dyte_meeting_id);
        if (liveSessionsIdx !== -1) {
          state.instructorLiveSessions[liveSessionsIdx] = {
            ...state.instructorLiveSessions[liveSessionsIdx],
            ...action.payload.updatedMeetingData
          };
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.updateMeetingLoading = false;
        state.updateMeetingError = action.payload || 'Failed to update meeting';
      })
      .addCase(cancelMeeting.pending, (state) => {
        state.cancelMeetingLoading = true;
        state.cancelMeetingError = null;
      })
      .addCase(cancelMeeting.fulfilled, (state, action) => {
        state.cancelMeetingLoading = false;
        // Update the cancelled meeting in both arrays
        const meetingsIdx = state.meetings.findIndex(m => m.dyte_meeting_id === action.payload);
        if (meetingsIdx !== -1) {
          state.meetings[meetingsIdx].status = 'cancelled';
        }

        const liveSessionsIdx = state.instructorLiveSessions.findIndex(m => m.dyte_meeting_id === action.payload);
        if (liveSessionsIdx !== -1) {
          state.instructorLiveSessions[liveSessionsIdx].status = 'cancelled';
        }
      })
      .addCase(cancelMeeting.rejected, (state, action) => {
        state.cancelMeetingLoading = false;
        state.cancelMeetingError = action.payload || 'Failed to cancel meeting';
      })
      .addCase(deleteMeeting.pending, (state) => {
        state.deleteMeetingLoading = true;
        state.deleteMeetingError = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.deleteMeetingLoading = false;
        // Remove the deleted meeting from both arrays
        state.meetings = state.meetings.filter(m => m.dyte_meeting_id !== action.payload);
        state.instructorLiveSessions = state.instructorLiveSessions.filter(m => m.dyte_meeting_id !== action.payload);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.deleteMeetingLoading = false;
        state.deleteMeetingError = action.payload || 'Failed to delete meeting';
      })
      .addCase(assignBatchToMeeting.pending, (state) => {
        state.updateMeetingLoading = true;
        state.updateMeetingError = null;
      })
      .addCase(assignBatchToMeeting.fulfilled, (state, action) => {
        state.updateMeetingLoading = false;
        // Update the meeting with batch information in both arrays
        const meetingsIdx = state.meetings.findIndex(m => m.dyte_meeting_id === action.payload.dyte_meeting_id);
        if (meetingsIdx !== -1) {
          state.meetings[meetingsIdx].batch_id = action.payload.liveSession.batch_id;
        }

        const liveSessionsIdx = state.instructorLiveSessions.findIndex(m => m.dyte_meeting_id === action.payload.dyte_meeting_id);
        if (liveSessionsIdx !== -1) {
          state.instructorLiveSessions[liveSessionsIdx].batch_id = action.payload.liveSession.batch_id;
        }
      })
      .addCase(assignBatchToMeeting.rejected, (state, action) => {
        state.updateMeetingLoading = false;
        state.updateMeetingError = action.payload || 'Failed to assign batch to meeting';
      })
      .addCase(fetchStudent.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.students = action.payload;
        state.studentsLoading = false;
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload || 'Failed to fetch students';
      })
      .addCase(createStudent.pending, (state) => {
        state.createStudentLoading = true;
        state.createStudentError = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.createStudentLoading = false;
        // Add the new student to the list
        if (action.payload.data) {
          state.students.push(action.payload.data);
        }
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.createStudentLoading = false;
        state.createStudentError = action.payload || 'Failed to create student';
      })
      .addCase(deleteStudent.pending, (state) => {
        state.deleteStudentLoading = true;
        state.deleteStudentError = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.deleteStudentLoading = false;
        // Remove the deleted student from the list
        state.students = state.students.filter(student => student._id !== action.payload);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.deleteStudentLoading = false;
        state.deleteStudentError = action.payload || 'Failed to delete student';
      })
      .addCase(fetchMyBatches.pending, (state) => {
        state.myBatchesLoading = true;
        state.myBatchesError = null;
      })
      .addCase(fetchMyBatches.fulfilled, (state, action) => {
        state.myBatchesLoading = false;
        state.myBatches = action.payload;
        state.myBatchesError = null;
      })
      .addCase(fetchMyBatches.rejected, (state, action) => {
        state.myBatchesLoading = false;
        state.myBatchesError = action.payload || 'Failed to fetch your batches';
      })
      .addCase(fetchBatchStudents.pending, (state) => {
        state.batchStudentsLoading = true;
        state.batchStudentsError = null;
      })
      .addCase(fetchBatchStudents.fulfilled, (state, action) => {
        state.batchStudentsLoading = false;
        state.batchStudents = action.payload;
        state.batchStudentsError = null;
      })
      .addCase(fetchBatchStudents.rejected, (state, action) => {
        state.batchStudentsLoading = false;
        state.batchStudentsError = action.payload || 'Failed to fetch batch students';
      })
      .addCase(fetchInstructorPayments.pending, (state) => {
        state.instructorPaymentsLoading = true;
        state.instructorPaymentsError = null;
      })
      .addCase(fetchInstructorPayments.fulfilled, (state, action) => {
        state.instructorPaymentsLoading = false;
        state.instructorPayments = action.payload;
        state.instructorPaymentsError = null;
      })
      .addCase(fetchInstructorPayments.rejected, (state, action) => {
        state.instructorPaymentsLoading = false;
        state.instructorPaymentsError = action.payload || 'Failed to fetch instructor payments';
      })
      .addCase(fetchAllStudentsForInstructor.pending, (state) => {
        state.allStudentsLoading = true;
        state.allStudentsError = null;
      })
      .addCase(fetchAllStudentsForInstructor.fulfilled, (state, action) => {
        state.allStudents = action.payload;
        state.allStudentsLoading = false;
      })
      .addCase(fetchAllStudentsForInstructor.rejected, (state, action) => {
        state.allStudentsLoading = false;
        state.allStudentsError = action.payload || 'Failed to fetch all students';
      });
  },
}
);

export default InstructorSlice.reducer;
