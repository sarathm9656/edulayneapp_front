import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signin from "./pages/auth/Signin";
import Layout from "./pages/superadmin/Layout";
import Dashboard from "./pages/superadmin/Dashboard";
// import TenantManagement from "./pages/superadmin/TenantManagement";
import UserManagement from "./pages/superadmin/UserManagement";
import UserList from "./pages/superadmin/UserList";
import ProtectedRoute from "./components/ProtectedRoute";
import RolesList from "./pages/superadmin/RolesList";
import RoleForm from "./pages/superadmin/RoleForm";
import AdminCourseManagement from "./pages/superadmin/AdminCourseManagement";
import DashboardLayout from "./pages/Tenent/layouts/DashbordLayout";
import ModernTenantLayout from "./pages/Tenent/layouts/ModernTenantLayout";
import GeneratePassword from "./pages/common/GeneratePassword";
import MeetingRoom from "./pages/common/MeetingRoom";

import ModernTenantDashboard from "./pages/Tenent/ModernTenantDashboard";
import TenantInstructor from "./pages/Tenent/instructor/TenantInstructor";
import TenantCourses from "./pages/Tenent/courses/TenantCourses";
import ListStudents from "./pages/Tenent/students/ListStudents";
import StudentDetails from "./pages/Tenent/students/StudentDetails";
// import Lessons from "./pages/Tenent/courses/ModuleAndLessonAddModal";
// import AllCourses from "./components/students/AllCourses";
import StudentLayout from "./pages/student/layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import TenantSettings from "./pages/Tenent/TenantSettings";
import CurriculumPage from "./pages/Tenent/courses/CurriculumPage";
import EditCoursePage from "./pages/Tenent/courses/EditCoursePage";

import UserLogin from "./pages/common/auth/UserLogin";
import CourseDetails from "./pages/student/CourseDetails";
import ViewCourseDetails from "./pages/Tenent/ViewCourseDetails";
import TenantsManagement from "./pages/superadmin/TenantsManagement";
import Settings from "./pages/superadmin/Settings";
import SuperAdminProfile from "./pages/superadmin/SuperAdminProfile";
import InstructorLayout from "./pages/Instructor/InstructorLayout";
import InstructorDashboard from "./pages/Instructor/Dashboard";
import ViewCourseInstructor from "./pages/Instructor/ViewCourse";
import InstructorStudents from "./pages/Instructor/InstructorStudents";
import ViewCourseDetailsInstructor from "./pages/Instructor/ViewCourseDetailsInstructor";
import ListTenantCourses from "./pages/student/ListTenantCourses";
import InstructorBatches from "./pages/Instructor/InstructorBatches";
import InstructorProfile from "./pages/Instructor/InstructorProfile";
import ViewCourse from "./pages/student/ViewCourse";
import Landing from "./Landing";
// import InstructorMeetings from "./pages/Instructor/InstructorMeetings";
// import EnrollStudent from "./pages/Tenent/courses/EnrollStudent";

import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import SelectCourses from "./pages/Tenent/instructor/SelectCourses";
import StudentViewBatch from "./pages/student/StudentViewBatch";
import StudentProfile from "./pages/student/StudentProfile";
import StudentProgress from "./pages/student/StudentProgress";
import TenantPayroll from "./pages/Tenent/TenantPayroll";
import TenantProfile from "./pages/Tenent/TenantProfile";
import ResetPassword from "./pages/auth/ResetPassword";
import TenantBatches from "./pages/Tenent/TenantBatches";
import InstructorDetailsPage from "./pages/Tenent/instructor/InstructorDetailsPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AttendanceDashboard from "./pages/Tenent/attendance/AttendanceDashboard";
import CourseBatchAttendance from "./pages/Tenent/attendance/CourseBatchAttendance";
import InstructorEarnings from "./pages/Instructor/InstructorEarnings";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/meeting" element={<MeetingRoom />} />
        <Route path="/users/login" element={<UserLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Public Route */}

        {/* Superadmin Auth */}
        <Route path="/superadmin/auth" element={<Signin />} />

        {/* Protected Superadmin Routes */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute>

              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/superadmin/dashboard" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenants" element={<TenantsManagement />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/create" element={<UserManagement />} />
          <Route path="roles" element={<RolesList />} />
          <Route path="roles/create" element={<RoleForm />} />
          <Route path="roles/:roleId" element={<RoleForm />} />
          <Route path="courses" element={<AdminCourseManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<SuperAdminProfile />} />
        </Route>

        {/* Tenant Routes */}
        <Route path="/tenant" element={<ModernTenantLayout />}>
          <Route index element={<ModernTenantDashboard />} />

          <Route path="instructors" element={<TenantInstructor />} />
          <Route path="courses" element={<TenantCourses />} />
          <Route path="students" element={<ListStudents />} />
          <Route path="student-details/:id" element={<StudentDetails />} />
          <Route path="Batches" element={<TenantBatches />} />
          <Route path="profile" element={<TenantProfile />} />
          {/* payment details showing page to the instructor */}
          <Route path="payroll" element={<TenantPayroll />} />
          <Route
            path="instructor/:instructorId"
            element={<InstructorDetailsPage />}
          />
          <Route
            path="instructor/select-courses/:instructorId/:loginId"
            element={<SelectCourses />}
          />

          {/* <Route path="create-module" element={<Lessons />} /> */}
          <Route path="settings" element={<TenantSettings />} />
          <Route
            path="view-course-details/:id"
            element={<ViewCourseDetails />}
          />
          <Route path="curriculum/:id" element={<CurriculumPage />} />
          <Route path="edit-course/:id" element={<EditCoursePage />} />

          {/* Attendance Routes */}
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="attendance/course-batch" element={<CourseBatchAttendance />} />
        </Route>

        {/* Tenant Auth (outside of dashboard layout) */}

        {/* Common Route */}
        <Route
          path="/common/generate-password"
          element={<GeneratePassword />}
        />




        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="/student/courses" element={<ListTenantCourses />} />
          <Route path="/student/batches" element={<StudentViewBatch />} />
          <Route
            path="/student/viewcourse/:course_id"
            element={<ViewCourse />}
          />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="course/:id" element={<CourseDetails />} />

          {/* <Route path="courses" element={<StudentCourses />} />
          <Route path="lessons" element={<StudentLessons />} />
          <Route path="quizzes" element={<StudentQuizzes />} /> */}
        </Route>

        {/* Instructor Routes */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="instructor_courses" element={<ViewCourseInstructor />} />

          {/* <Route
            path="instructor-view-students"
            element={<InstructorStudents />}
          /> */}

          <Route
            path="instructor-view-students"
            element={<InstructorStudents />}
          />
          <Route
            path="view-course-details-instructor/:id"
            element={<ViewCourseDetailsInstructor />}
          />
          <Route path="batches" element={<InstructorBatches />} />

          <Route path="profile" element={<InstructorProfile />} />
          <Route path="earnings" element={<InstructorEarnings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
