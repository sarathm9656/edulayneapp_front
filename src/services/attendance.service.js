import api from "@/api/axiosInstance";

export const attendanceService = {
    // Student Session Management
    joinSession: (data) => api.post("/attendance/join-session", data),
    leaveSession: (data) => api.post("/attendance/leave-session", data),

    // Reports & Summaries
    getDailySummary: (params) => api.get("/attendance/daily-summary", { params }),
    getMonthlySummary: (params) => api.get("/attendance/monthly-summary", { params }),
    getCourseBatchSummary: (params) => api.get("/attendance/course-batch-summary", { params }),

    // PDF Downloads
    downloadDailyPDF: async (params) => {
        const response = await api.get("/attendance/daily-pdf", {
            params,
            responseType: "blob",
        });
        return response.data;
    },

    downloadMonthlyPDF: async (params) => {
        const response = await api.get("/attendance/monthly-pdf", {
            params,
            responseType: "blob",
        });
        return response.data;
    },
};
