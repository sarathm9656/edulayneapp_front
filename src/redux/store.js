import { configureStore } from "@reduxjs/toolkit";
import superAdminReducer from "./super.admin.slice";
import loadingReducer from "./loading.slice";
import userReducer from "./user.slice";
import tenantReducer from "./tenant.slice";
import courseReducer from "./course.slice";
import instructorReducer from "./instructor/instructor.slice";
import batchReducer from "./batch.slice";
import studentReducer from "./student.slice";

const store = configureStore({
  reducer: {
    superAdmin: superAdminReducer,
    loading: loadingReducer,
    user: userReducer,
    tenant: tenantReducer,
    course: courseReducer,
    instructor: instructorReducer,
    batch: batchReducer,
    student: studentReducer,
  },
});

export default store;
