import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "@/redux/course.slice";
import {
  createBatch,
  fetchBatches,
  clearError,
  resetSuccess,
  updateBatch,
  deleteBatch,
} from "@/redux/batch.slice";
import { fetchInstructors } from "@/redux/tenant.slice";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";

const TenantBatches = () => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.course);
  const { batches, loading, error, success } = useSelector(
    (state) => state.batch
  );
  const { instructors } = useSelector((state) => state.tenant);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [form, setForm] = useState({
    batch_name: "",
    course_id: "",
    instructor_id: "",
    instructor_ids: [],
    start_date: "",
    end_date: "",
    subscription_price: 1000,
    subscription_enabled: true,
    max_students: 0,
    batch_time: "",
    start_time: "",
    end_time: "",
    recurring_days: [],
    meeting_link: "",
    meeting_platform: "Dyte",
    is_strict_schedule: true,
  });
  const [editForm, setEditForm] = useState({
    batch_name: "",
    course_id: "",
    instructor_id: "",
    instructor_ids: [],
    start_date: "",
    end_date: "",
    status: "active",
    subscription_price: 1000,
    subscription_enabled: true,
    max_students: 0,
    batch_time: "",
    start_time: "",
    end_time: "",
    recurring_days: [],
    meeting_link: "",
    meeting_platform: "Dyte",
    is_strict_schedule: true,
  });

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollingBatch, setEnrollingBatch] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [searchBatchName, setSearchBatchName] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [selectedBatchForRecordings, setSelectedBatchForRecordings] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [isUploadingToYoutube, setIsUploadingToYoutube] = useState(false);


  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchBatches());
    dispatch(fetchInstructors());
  }, [dispatch]);

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      toast.success("Batch created successfully!");
      dispatch(resetSuccess());
      setShowModal(false);
      setForm({
        batch_name: "",
        course_id: "",
        instructor_id: "",
        instructor_ids: [],
        start_date: "",
        end_date: "",
        max_students: 0,
        batch_time: "",
        start_time: "",
        end_time: "",
        recurring_days: [],
        meeting_link: "",
        meeting_platform: "Dyte",
      });
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const fetchRecordings = async (batchId) => {
    setRecordingsLoading(true);
    try {
      const response = await api.get(`/dyte/recordings/${batchId}`);
      if (response.data.success) {
        setRecordings(response.data.recordings || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch recordings");
    } finally {
      setRecordingsLoading(false);
    }
  };

  const handleViewRecordings = (batch) => {
    setSelectedBatchForRecordings(batch);
    setShowRecordingsModal(true);
    fetchRecordings(batch._id);
  };

  const handleCloseRecordingsModal = () => {
    setShowRecordingsModal(false);
    setSelectedBatchForRecordings(null);
    setRecordings([]);
  };

  const handleManualUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadToYoutube = document.getElementById('youtubeUploadToggle')?.checked || false;
    const formData = new FormData();
    formData.append('recording', file);
    formData.append('title', `Manual Upload - ${new Date().toLocaleDateString()}`);
    formData.append('upload_to_youtube', uploadToYoutube);

    const toastId = toast.loading("Uploading recording...");
    try {
      const res = await api.post(`/dyte/upload-recording/${selectedBatchForRecordings._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Uploaded successfully!", { id: toastId });
        fetchRecordings(selectedBatchForRecordings._id);
      }
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleInstructorToggle = (instructorId) => {
    const isSelected = form.instructor_ids.includes(instructorId);
    if (isSelected) {
      setForm({
        ...form,
        instructor_ids: form.instructor_ids.filter(id => id !== instructorId)
      });
    } else {
      setForm({
        ...form,
        instructor_ids: [...form.instructor_ids, instructorId]
      });
    }
  };

  const handleEditInstructorToggle = (instructorId) => {
    const isSelected = editForm.instructor_ids.includes(instructorId);
    if (isSelected) {
      setEditForm({
        ...editForm,
        instructor_ids: editForm.instructor_ids.filter(id => id !== instructorId)
      });
    } else {
      setEditForm({
        ...editForm,
        instructor_ids: [...editForm.instructor_ids, instructorId]
      });
    }
  };

  const handleSelectAllInstructors = () => {
    const allInstructorIds = instructors.map(instructor => instructor.id);
    setForm({ ...form, instructor_ids: allInstructorIds });
  };

  const handleDeselectAllInstructors = () => {
    setForm({ ...form, instructor_ids: [] });
  };

  const handleEditSelectAllInstructors = () => {
    const allInstructorIds = instructors.map(instructor => instructor.id);
    setEditForm({ ...editForm, instructor_ids: allInstructorIds });
  };

  const handleEditDeselectAllInstructors = () => {
    setEditForm({ ...editForm, instructor_ids: [] });
  };

  const formatTimeToAMPM = (time24) => {
    if (!time24) return "";
    let [hours, minutes] = time24.split(":");
    hours = parseInt(hours);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const parseAMPMToTime24 = (timeAMPM) => {
    if (!timeAMPM) return "";
    try {
      const [time, modifier] = timeAMPM.trim().split(" ");
      let [hours, minutes] = time.split(":");
      let h = parseInt(hours, 10);
      if (modifier === "PM" && h < 12) {
        h += 12;
      }
      if (modifier === "AM" && h === 12) {
        h = 0;
      }
      return `${h.toString().padStart(2, '0')}:${minutes}`;
    } catch (e) {
      return "";
    }
  };

  const renderTimePicker = (isEdit, fieldName) => {
    const currentForm = isEdit ? editForm : form;
    const setFormFn = isEdit ? setEditForm : setForm;
    const timeValue = currentForm[fieldName] || "";

    // Parse HH:mm to 12h parts
    let h12 = "";
    let m = "";
    let period = "AM";

    if (timeValue) {
      let [h24, mins] = timeValue.split(":");
      m = mins;
      let h = parseInt(h24);
      period = h >= 12 ? "PM" : "AM";
      h12 = h % 12 || 12;
      h12 = h12.toString().padStart(2, '0');
    }

    const updateTime = (part, val) => {
      let newH12 = h12 || "12";
      let newM = m || "00";
      let newPeriod = period || "AM";

      if (part === 'h') newH12 = val;
      if (part === 'm') newM = val;
      if (part === 'p') newPeriod = val;

      let h24 = parseInt(newH12);
      if (newPeriod === "PM" && h24 < 12) h24 += 12;
      if (newPeriod === "AM" && h24 === 12) h24 = 0;

      const newTimeValue = `${h24.toString().padStart(2, '0')}:${newM}`;
      setFormFn({ ...currentForm, [fieldName]: newTimeValue });
    };

    return (
      <div className="d-flex align-items-center gap-1">
        <select
          className="form-select form-select-sm"
          value={h12}
          onChange={(e) => updateTime('h', e.target.value)}
          style={{ width: '70px', padding: '2px 5px' }}
          required
        >
          <option value="">Hour</option>
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="fw-bold">:</span>
        <select
          className="form-select form-select-sm"
          value={m}
          onChange={(e) => updateTime('m', e.target.value)}
          style={{ width: '70px', padding: '2px 5px' }}
          required
        >
          <option value="">Min</option>
          {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')).map(min => (
            <option key={min} value={min}>{min}</option>
          ))}
        </select>
        <select
          className="form-select form-select-sm"
          value={period}
          onChange={(e) => updateTime('p', e.target.value)}
          style={{ width: '65px', padding: '2px 5px' }}
          required
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  };

  const handleRecurringDaysToggle = (day) => {
    const isSelected = form.recurring_days.includes(day);
    if (isSelected) {
      setForm({
        ...form,
        recurring_days: form.recurring_days.filter(d => d !== day)
      });
    } else {
      setForm({
        ...form,
        recurring_days: [...form.recurring_days, day]
      });
    }
  };

  const handleEditRecurringDaysToggle = (day) => {
    const isSelected = editForm.recurring_days.includes(day);
    if (isSelected) {
      setEditForm({
        ...editForm,
        recurring_days: editForm.recurring_days.filter(d => d !== day)
      });
    } else {
      setEditForm({
        ...editForm,
        recurring_days: [...editForm.recurring_days, day]
      });
    }
  };

  const checkBatchConflict = (newBatch, currentBatchId = null) => {
    if (!newBatch.start_time || !newBatch.end_time || !newBatch.recurring_days || newBatch.recurring_days.length === 0) {
      return null;
    }

    // Convert new batch times to minutes from midnight
    const [startAH, startAM] = newBatch.start_time.split(':').map(Number);
    const [endAH, endAM] = newBatch.end_time.split(':').map(Number);
    // Adjust for PM if necessary (The form stores "14:00" for 2 PM if using 24h, but let's verify what the state holds. 
    // The state `start_time` and `end_time` seem to be constructed as "HH:mm" where HH is 12h format? 
    // Wait, `renderTimePicker` logic:
    // `const [h12, m] = timeValue.split(":")` -> It implies `timeValue` is "HH:mm" in 24h format because `h = parseInt(h24)`.
    // Yes, `renderTimePicker` uses `h24.toString().padStart(2, '0')` to save to state.
    // So `form.start_time` is in 24-hour format "HH:mm".

    const startA_Min = startAH * 60 + startAM;
    const endA_Min = endAH * 60 + endAM;

    // Get selected instructor IDs
    const newInstructorIds = newBatch.instructor_ids && newBatch.instructor_ids.length > 0
      ? newBatch.instructor_ids
      : (newBatch.instructor_id ? [newBatch.instructor_id] : []);

    for (const batch of batches) {
      // Skip the current batch if editing
      if (currentBatchId && batch._id === currentBatchId) continue;

      // Skip if status is not active (optional, but usually we only care about active conflicts)
      if (batch.status !== 'active') continue;

      // Check Instructor Overlap
      let existingInstructorIds = [];
      if (batch.instructor_ids && batch.instructor_ids.length > 0) {
        existingInstructorIds = batch.instructor_ids.map(i => typeof i === 'object' ? i._id : i);
      } else if (batch.instructor_id) {
        existingInstructorIds = [typeof batch.instructor_id === 'object' ? batch.instructor_id._id : batch.instructor_id];
      }

      const hasCommonInstructor = newInstructorIds.some(id => existingInstructorIds.includes(id));
      if (!hasCommonInstructor) continue; // No common instructor, no conflict

      // Check Day Overlap
      const hasCommonDay = newBatch.recurring_days.some(day => batch.recurring_days.includes(day));
      if (!hasCommonDay) continue;

      // Check Time Overlap
      // existing batch time needs parsing: "09:00 AM - 11:00 AM"
      if (!batch.batch_time || !batch.batch_time.includes(" - ")) continue;

      const parts = batch.batch_time.split(" - ");
      const startB_Str = parseAMPMToTime24(parts[0]);
      const endB_Str = parseAMPMToTime24(parts[1]);

      if (!startB_Str || !endB_Str) continue;

      const [startBH, startBM] = startB_Str.split(':').map(Number);
      const [endBH, endBM] = endB_Str.split(':').map(Number);

      const startB_Min = startBH * 60 + startBM;
      const endB_Min = endBH * 60 + endBM;

      // Overlap condition: (StartA < EndB) and (StartB < EndA)
      if (startA_Min < endB_Min && startB_Min < endA_Min) {
        return batch.batch_name; // Return the name of the conflicting batch
      }
    }
    return null; // No conflict
  };

  const validateForm = () => {
    if (!form.batch_name.trim()) {
      toast.error("Batch name is required");
      return false;
    }
    if (!form.course_id) {
      toast.error("Please select a course");
      return false;
    }
    // if (!form.instructor_id && (!form.instructor_ids || form.instructor_ids.length === 0)) {
    //   toast.error("Please select at least one instructor");
    //   return false;
    // }
    if (!form.start_date) {
      toast.error("Start date is required");
      return false;
    }
    if (!form.end_date) {
      toast.error("End date is required");
      return false;
    }

    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return false;
    }

    return true;
  };

  const validateEditForm = () => {
    if (!editForm.batch_name.trim()) {
      toast.error("Batch name is required");
      return false;
    }
    if (!editForm.course_id) {
      toast.error("Please select a course");
      return false;
    }
    // if (!editForm.instructor_id && (!editForm.instructor_ids || editForm.instructor_ids.length === 0)) {
    //   toast.error("Please select at least one instructor");
    //   return false;
    // }
    if (!editForm.start_date) {
      toast.error("Start date is required");
      return false;
    }
    if (!editForm.end_date) {
      toast.error("End date is required");
      return false;
    }

    const startDate = new Date(editForm.start_date);
    const endDate = new Date(editForm.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // if (startDate < today) {
    //   toast.error("Start date cannot be in the past");
    //   return false;
    // }
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!form.start_time || !form.end_time) {
      toast.error("Please select both start and end times");
      return;
    }

    // Check for conflicts
    const conflictBatchName = checkBatchConflict(form);
    if (conflictBatchName) {
      toast.error(`Conflict detected! This time slot overlaps with existing batch: "${conflictBatchName}" for the selected instructor(s).`);
      return;
    }

    try {
      const combinedTime = `${formatTimeToAMPM(form.start_time)} - ${formatTimeToAMPM(form.end_time)}`;
      // Prepare form data with instructor_ids
      const safeInstructorIds = form.instructor_ids.length > 0
        ? form.instructor_ids
        : (form.instructor_id ? [form.instructor_id] : []);

      const formData = {
        ...form,
        batch_time: combinedTime,
        instructor_ids: safeInstructorIds
      };
      await dispatch(createBatch(formData));
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    if (!editForm.start_time || !editForm.end_time) {
      toast.error("Please select both start and end times");
      return;
    }

    // Check for conflicts
    const conflictBatchName = checkBatchConflict(editForm, editingBatch._id);
    if (conflictBatchName) {
      toast.error(`Conflict detected! This time slot overlaps with existing batch: "${conflictBatchName}" for the selected instructor(s).`);
      return;
    }

    try {
      const combinedTime = `${formatTimeToAMPM(editForm.start_time)} - ${formatTimeToAMPM(editForm.end_time)}`;
      // Prepare form data with instructor_ids
      const safeInstructorIds = editForm.instructor_ids.length > 0
        ? editForm.instructor_ids
        : (editForm.instructor_id ? [editForm.instructor_id] : []);

      const formData = {
        ...editForm,
        batch_time: combinedTime,
        instructor_ids: safeInstructorIds
      };
      await dispatch(
        updateBatch({ batchId: editingBatch._id, batchData: formData })
      );
      setShowEditModal(false);
      setEditingBatch(null);
      setEditForm({
        batch_name: "",
        course_id: "",
        instructor_id: "",
        instructor_ids: [],
        start_date: "",
        end_date: "",
        status: "active",
      });
    } catch (error) {
      console.error("Error updating batch:", error);
    }
  };

  const handleDelete = async (batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    if (batch) {
      setDeletingBatch(batch);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBatch) return;

    try {
      await dispatch(deleteBatch(deletingBatch._id));
      toast.success("Batch deleted successfully!");
      setShowDeleteModal(false);
      setDeletingBatch(null);
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingBatch(null);
  };

  const [enrollmentMode, setEnrollmentMode] = useState('list'); // 'list' or 'add'
  const [selectedForAdd, setSelectedForAdd] = useState([]);

  const handleEnrollStudents = (batch) => {
    console.log("batch", batch);
    setEnrollingBatch(batch);
    setEnrollmentMode('list');
    setShowEnrollModal(true);
    // Fetch students when modal opens
    fetchStudentsForBatch(batch);
  };

  const handleSwitchToAdd = () => {
    setEnrollmentMode('add');
    setSelectedForAdd([]);
    setSearchTerm("");
  };

  const handleSwitchToList = () => {
    setEnrollmentMode('list');
    setSearchTerm("");
  };

  const handleAddCheckboxChange = (studentId) => {
    setSelectedForAdd(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the batch?")) return;

    try {
      setEnrollmentLoading(true);
      const newBatchStudents = batchStudents.filter(s => s.login_id !== studentId);

      const response = await api.post(
        `/tenants/tenant/enrollstudents-batch/${enrollingBatch?._id}`,
        { courseStudents: newBatchStudents }
      );

      if (response.data.success) {
        toast.success("Student removed successfully");
        setBatchStudents(newBatchStudents);
        setAllStudents(prev => prev.map(s => s.login_id === studentId ? { ...s, isEnrolled: false } : s));
        dispatch(fetchBatches());
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedForAdd.length === 0) {
      toast.error("Please select students to add");
      return;
    }

    try {
      setEnrollmentLoading(true);
      const newStudentsToAdd = selectedForAdd.map(id => ({ login_id: id }));
      const newBatchStudents = [...batchStudents, ...newStudentsToAdd];

      const response = await api.post(
        `/tenants/tenant/enrollstudents-batch/${enrollingBatch?._id}`,
        { courseStudents: newBatchStudents }
      );

      if (response.data.success) {
        toast.success(`${selectedForAdd.length} student(s) added successfully`);
        setEnrollmentMode('list');
        setBatchStudents(newBatchStudents);
        setAllStudents(prev => prev.map(s => selectedForAdd.includes(s.login_id) ? { ...s, isEnrolled: true } : s));
        dispatch(fetchBatches());
      }
    } catch (error) {
      console.error("Error adding students:", error);
      toast.error("Failed to add students");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const fetchStudentsForBatch = async (batch) => {
    try {
      setEnrollmentLoading(true);
      const batchId = batch._id;
      const response = await api.get(
        `/tenants/tenant/getstudents-batch/${batchId}?_t=${Date.now()}`
      );
      console.log("API Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      const allStudentsData = response.data.all_students || [];
      const enrolledStudents = response.data.batchStudents || [];

      // Get enrolled student IDs (now these are Login IDs)
      const enrolledStudentIds = enrolledStudents.map(
        (enrollment) => enrollment.student_id
      );

      // Mark students as enrolled or not
      const studentsWithEnrollmentStatus = allStudentsData.map((student) => ({
        ...student,
        isEnrolled: enrolledStudentIds.includes(student.login_id),
      }));

      setAllStudents(studentsWithEnrollmentStatus);

      // Pre-select already enrolled students
      setBatchStudents(enrolledStudentIds.map((id) => ({ login_id: id })));
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students for enrollment");
      setAllStudents([]);
      setBatchStudents([]);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleCheckboxChange = (studentId) => {
    // Check if student is already in the batchStudents array
    const isAlreadySelected = batchStudents.some(
      (obj) => obj.login_id === studentId
    );

    if (isAlreadySelected) {
      // Remove student from selection
      setBatchStudents(
        batchStudents.filter((obj) => obj.login_id !== studentId)
      );
    } else {
      // Add student to selection (no duplicates possible due to filter)
      setBatchStudents([...batchStudents, { login_id: studentId }]);
    }
  };

  const enrollStudents = async () => {
    try {
      setEnrollmentLoading(true);
      const response = await api.post(
        `/tenants/tenant/enrollstudents-batch/${enrollingBatch?._id}`,
        { courseStudents: batchStudents }
      );

      if (response.data.success) {
        const { enrolled_students, skipped_students, unenrolled_count } =
          response.data;
        let message = "Batch enrollment updated successfully!";

        if (enrolled_students.length > 0) {
          message += ` ${enrolled_students.length} new student(s) enrolled.`;
        }
        if (skipped_students.length > 0) {
          message += ` ${skipped_students.length} student(s) already enrolled.`;
        }
        if (unenrolled_count > 0) {
          message += ` ${unenrolled_count} student(s) unenrolled.`;
        }

        toast.success(message);
        setShowEnrollModal(false);
        setEnrollingBatch(null);
        setBatchStudents([]);
        setAllStudents([]);
        // Refresh batches list to show updated enrollment count
        dispatch(fetchBatches());
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(error.response?.data?.message || "Failed to enroll students");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollCancel = () => {
    setShowEnrollModal(false);
    setEnrollingBatch(null);
    setBatchStudents([]);
    setAllStudents([]);
    setSearchTerm("");
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);

    // Extract instructor IDs properly
    let instructorIds = [];
    if (batch.instructor_ids && batch.instructor_ids.length > 0) {
      // If instructor_ids exists and has data, use those
      instructorIds = batch.instructor_ids.map(inst => inst._id || inst);
    } else if (batch.instructor_id) {
      // If only instructor_id exists, use that
      instructorIds = [batch.instructor_id._id || batch.instructor_id];
    }

    let startTime = "";
    let endTime = "";
    if (batch.batch_time && batch.batch_time.includes(" - ")) {
      const parts = batch.batch_time.split(" - ");
      startTime = parseAMPMToTime24(parts[0]);
      endTime = parseAMPMToTime24(parts[1]);
    }

    setEditForm({
      batch_name: batch.batch_name,
      course_id: batch.course_id?._id || batch.course_id || "",
      instructor_id: batch.instructor_id?._id || batch.instructor_id || "",
      instructor_ids: instructorIds,
      start_date: new Date(batch.start_date).toISOString().split("T")[0],
      end_date: new Date(batch.end_date).toISOString().split("T")[0],
      status: batch.status || "active",
      subscription_price: batch.subscription_price || 1000,
      subscription_enabled: batch.subscription_enabled !== undefined ? batch.subscription_enabled : true,
      max_students: batch.max_students || 0,
      batch_time: batch.batch_time || "",
      start_time: startTime,
      end_time: endTime,
      recurring_days: batch.recurring_days || [],
      meeting_link: batch.meeting_link || "",
      meeting_link: batch.meeting_link || "",
      meeting_platform: batch.meeting_platform || "Dyte",
      is_strict_schedule: batch.is_strict_schedule !== undefined ? batch.is_strict_schedule : true,
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      batch_name: "",
      course_id: "",
      instructor_id: "",
      instructor_ids: [],
      start_date: "",
      end_date: "",
      subscription_price: 1000,
      subscription_enabled: true,
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingBatch(null);
    setEditForm({
      batch_name: "",
      course_id: "",
      instructor_id: "",
      instructor_ids: [],
      start_date: "",
      end_date: "",
      status: "active",
      subscription_price: 1000,
      subscription_enabled: true,
    });
  };

  // Filter batches based on search and filters
  const filteredBatches = batches.filter((batch) => {
    const matchesBatchName = batch.batch_name
      .toLowerCase()
      .includes(searchBatchName.toLowerCase());
    const matchesCourse =
      !filterCourse ||
      batch.course_id?._id === filterCourse ||
      batch.course_id === filterCourse;
    const matchesInstructor =
      !filterInstructor ||
      batch.instructor_id?._id === filterInstructor ||
      batch.instructor_id === filterInstructor;

    return matchesBatchName && matchesCourse && matchesInstructor;
  });

  const clearFilters = () => {
    setFilterInstructor("");
  };

  const handleStartClass = async (batchId) => {
    try {
      const response = await api.post(`/dyte/create-meeting`, { batchId });
      if (response.data.success) {
        if (response.data.authToken) {
          const url = `${window.location.origin}/meeting?authToken=${response.data.authToken}&role=${response.data.role || 'instructor'}`;
          window.open(url, 'DyteMeetingWindow');
        } else if (response.data.meeting_link) {
          window.open(response.data.meeting_link, 'DyteMeetingWindow');
        }
        toast.success("Class Started!");
        dispatch(fetchBatches());
      }
    } catch (error) {
      console.error("Start Class Error:", error);
      toast.error(error.response?.data?.message || "Failed to start class");
    }
  };

  const renderStartButton = (batch) => {
    if (!batch.start_date || !batch.end_date || !batch.batch_time) {
      return <span className="text-muted small italic">Not scheduled</span>;
    }

    // Parse batch time
    let startTimeStr = "";
    if (batch.batch_time && batch.batch_time.includes(" - ")) {
      startTimeStr = batch.batch_time.split(" - ")[0];
    } else {
      return <span className="text-muted small italic">Invalid time</span>;
    }

    // Helper to parse time string (e.g., "09:00 AM")
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (modifier === 'PM' && hours < 12) hours += 12;
      return { hours, minutes };
    };

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    const isToday = batch.recurring_days && batch.recurring_days.includes(currentDay);

    if (batch.status !== 'active') return <span className="badge bg-secondary">{batch.status}</span>;

    // Check time window (15 mins before start time)
    const { hours: startHours, minutes: startMinutes } = parseTime(startTimeStr);
    const meetingStartTime = new Date();
    meetingStartTime.setHours(startHours, startMinutes, 0, 0);

    // 15 minutes before start
    const bufferMin = 15;
    const startWindow = new Date(meetingStartTime.getTime() - bufferMin * 60000);

    const isWithinTime = now >= startWindow;

    if (batch.meeting_link) {
      return (
        <button onClick={() => handleStartClass(batch._id)} className="btn btn-sm btn-success text-white">
          <i className={`fa-solid fa-video me-1`}></i>
          Join Class
        </button>
      );
    }

    // If it's the right day and time (or if we want to allow always)
    // User requested "must instratur and tenant to can be possible to host meeating"
    // So I will allow starting anytime if active.
    return (
      <button onClick={() => handleStartClass(batch._id)} className="btn btn-sm btn-primary text-white shadow-sm">
        <i className="fa-solid fa-play me-1"></i> Start Class
      </button>
    );
  };


  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-end align-items-center mb-4">
              <button
                className="btn btn-primary px-4 py-2 rounded-3 fw-medium"
                onClick={() => setShowModal(true)}
              >
                <i className="fa-solid fa-plus me-2"></i> Create Batch
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="searchBatchName" className="form-label">
                    Search Batch Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchBatchName"
                    placeholder="Search by batch name..."
                    value={searchBatchName}
                    onChange={(e) => setSearchBatchName(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="filterCourse" className="form-label">
                    Filter by Course
                  </label>
                  <select
                    className="form-control"
                    id="filterCourse"
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courses &&
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.course_title}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="filterInstructor" className="form-label">
                    Filter by Instructor
                  </label>
                  <select
                    className="form-control"
                    id="filterInstructor"
                    value={filterInstructor}
                    onChange={(e) => setFilterInstructor(e.target.value)}
                  >
                    <option value="">All Instructors</option>
                    {instructors &&
                      instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                  >
                    <i className="fa-solid fa-times me-2"></i>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Modal */}
            {showModal && (
              <>
                {/* Modal Backdrop */}
                <div
                  className="modal-backdrop fade show"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                  }}
                  onClick={handleCloseModal}
                ></div>

                {/* Modal */}
                <div
                  className="modal fade show d-block"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="addBatchModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title" id="addBatchModalLabel">
                          Add New Batch
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleCloseModal}
                          aria-label="Close"
                        ></button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="batch_name"
                                className="form-label"
                              >
                                Batch Name *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="batch_name"
                                name="batch_name"
                                value={form.batch_name}
                                onChange={handleChange}
                                placeholder="Enter batch name"
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label htmlFor="course_id" className="form-label">
                                Course *
                              </label>
                              <select
                                name="course_id"
                                value={form.course_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                              >
                                <option value="">Select Course</option>
                                {courses &&
                                  courses
                                    .filter((c) => c.is_active)
                                    .map((course) => (
                                      <option key={course._id} value={course._id}>
                                        {course.course_title}
                                      </option>
                                    ))}
                              </select>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">
                                  Select Instructors
                                </label>
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={handleSelectAllInstructors}
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleDeselectAllInstructors}
                                  >
                                    Clear All
                                  </button>
                                </div>
                              </div>
                              <div
                                className="border rounded p-3"
                                style={{
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  backgroundColor: "#f8f9fa"
                                }}
                              >
                                {instructors && instructors.length > 0 ? (
                                  instructors.map((instructor) => (
                                    <div key={instructor.id} className="form-check mb-2">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`instructor_${instructor.id}`}
                                        checked={form.instructor_ids.includes(instructor.id)}
                                        onChange={() => handleInstructorToggle(instructor.id)}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`instructor_${instructor.id}`}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {instructor.name}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted mb-0">No instructors available</p>
                                )}
                              </div>
                              <small className="form-text text-muted">
                                Selected: {form.instructor_ids.length} instructor(s)
                              </small>
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor="start_date"
                                className="form-label"
                              >
                                Start Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="start_date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="end_date" className="form-label">
                                End Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="end_date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="subscription_price" className="form-label">
                                Subscription Amount (₹)
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="subscription_price"
                                name="subscription_price"
                                value={form.subscription_price}
                                onChange={handleChange}
                                placeholder="Enter subscription amount"
                                min="0"
                                step="0.01"
                              />
                              <small className="form-text text-muted">
                                Monthly subscription fee for this batch
                              </small>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="subscription_enabled" className="form-label">
                                Subscription Status
                              </label>
                              <select
                                name="subscription_enabled"
                                value={form.subscription_enabled}
                                onChange={handleChange}
                                className="form-control"
                              >
                                <option value={true}>Enabled</option>
                                <option value={false}>Disabled</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="max_students" className="form-label">
                                Max Students *
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="max_students"
                                name="max_students"
                                value={form.max_students}
                                onChange={handleChange}
                                placeholder="e.g. 50"
                                required
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label className="form-label">Batch Time *</label>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                {renderTimePicker(false, 'start_time')}
                                <span className="text-muted">to</span>
                                {renderTimePicker(false, 'end_time')}
                              </div>
                              {form.start_time && form.end_time && (
                                <small className="text-primary fw-bold mt-1 d-block">
                                  {formatTimeToAMPM(form.start_time)} - {formatTimeToAMPM(form.end_time)}
                                </small>
                              )}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Recurring Days (Weekly)</label>
                              <div className="d-flex flex-wrap gap-2 pt-1">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                  <div key={day} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`day_${day}`}
                                      checked={form.recurring_days.includes(day)}
                                      onChange={() => handleRecurringDaysToggle(day)}
                                    />
                                    <label className="form-check-label" htmlFor={`day_${day}`}>
                                      {day.slice(0, 3)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <label className="form-label d-block">Schedule Settings</label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="is_strict_schedule"
                                  name="is_strict_schedule"
                                  checked={form.is_strict_schedule}
                                  onChange={(e) => setForm({ ...form, is_strict_schedule: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="is_strict_schedule">
                                  Strict Schedule Validation {form.is_strict_schedule ? "(Enabled)" : "(Disabled)"}
                                </label>
                              </div>
                              <small className="text-muted">
                                If disabled, students can join the meeting at any time (Instant Meeting), regardless of the scheduled time or day.
                              </small>
                            </div>
                          </div>


                        </form>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCloseModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Creating...
                            </>
                          ) : (
                            "Create Batch"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Loading State */}
            {loading && batches.length === 0 && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading batches...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && batches.length === 0 && (
              <div className="text-center py-5">
                <i className="fa-solid fa-users fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No batches found</h5>
                <p className="text-muted">
                  Create your first batch to get started
                </p>
              </div>
            )}

            {/* No Results State */}
            {!loading && batches.length > 0 && filteredBatches.length === 0 && (
              <div className="text-center py-5">
                <i className="fa-solid fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No batches found</h5>
                <p className="text-muted">
                  {searchBatchName || filterCourse || filterInstructor
                    ? "No batches match your search criteria. Try adjusting your filters."
                    : "No batches available."}
                </p>
                {(searchBatchName || filterCourse || filterInstructor) && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Batch Table */}
            {!loading && filteredBatches.length > 0 && (
              <div
                className="table-responsive table-styles mt-4"
                style={{ overflowX: "auto", minWidth: "100%" }}
              >
                <table
                  className="table table-striped table-hover"
                  style={{ minWidth: "800px" }}
                >
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="text-nowrap">#</th>
                      <th scope="col" className="text-nowrap">Batch Details</th>
                      <th scope="col" className="text-nowrap">Course & Timing</th>
                      <th scope="col" className="text-nowrap">Instructor(s)</th>
                      <th scope="col" className="text-nowrap">Students</th>
                      <th scope="col" className="text-nowrap">Meeting</th>
                      <th scope="col" className="text-nowrap">Status</th>
                      <th scope="col" className="text-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((batch, index) => (
                      <tr key={batch._id}>
                        <th scope="row" className="text-nowrap">{index + 1}</th>
                        <td className="text-nowrap">
                          <div className="fw-bold text-dark">{batch.batch_name}</div>
                          <div className="small text-muted">
                            {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <div className="fw-bold">{batch.course_id?.course_title || "N/A"}</div>
                          <div className="small text-primary">
                            <i className="fa-regular fa-clock me-1"></i>
                            {batch.batch_time || "Not Set"}
                          </div>
                          <div className="small text-muted">
                            {batch.recurring_days && batch.recurring_days.length > 0
                              ? batch.recurring_days.map(d => d.slice(0, 3)).join(", ")
                              : "No recurring days"}
                          </div>
                        </td>
                        <td className="text-nowrap">
                          {batch.instructor_ids && batch.instructor_ids.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {batch.instructor_ids.map((inst, i) => (
                                <span key={i} className="badge bg-light text-dark border">
                                  {inst.user_id ? `${inst.user_id.fname} ${inst.user_id.lname}` : inst.email}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="badge bg-light text-dark border">
                              {batch.instructor_id?.user_id ? `${batch.instructor_id.user_id.fname} ${batch.instructor_id.user_id.lname}` : "N/A"}
                            </span>
                          )}
                        </td>
                        <td className="text-nowrap">
                          <div className="d-flex align-items-center mb-1">
                            <div className="me-2 small fw-bold">
                              {batch.enrollment_count || 0} / {batch.max_students || "∞"}
                            </div>
                          </div>
                          <div className="progress" style={{ height: "6px", width: "100px" }}>
                            <div
                              className={`progress-bar ${batch.enrollment_count >= batch.max_students && batch.max_students > 0 ? 'bg-danger' : 'bg-primary'}`}
                              style={{ width: `${batch.max_students > 0 ? Math.min(((batch.enrollment_count || 0) / batch.max_students) * 100, 100) : 0}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="text-nowrap">
                          {renderStartButton(batch)}
                        </td>
                        <td className="text-nowrap">
                          <span className={`badge ${batch.status === "active" ? "bg-success" : batch.status === "completed" ? "bg-info" : "bg-secondary"}`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-info me-1"
                              onClick={() => handleEnrollStudents(batch)}
                              title="View Enrolled Students"
                            >
                              <i className="fa-solid fa-users"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-dark me-1"
                              onClick={() => handleViewRecordings(batch)}
                              title="View Recordings"
                            >
                              <i className="fa-solid fa-film"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(batch)}
                              title="Edit Details"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
              <>
                {/* Modal Backdrop */}
                <div
                  className="modal-backdrop fade show"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                  }}
                  onClick={handleCloseEditModal}
                ></div>

                {/* Modal */}
                <div
                  className="modal fade show d-block"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="editBatchModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title" id="editBatchModalLabel">
                          Edit Batch Details
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleCloseEditModal}
                          aria-label="Close"
                        ></button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        {/* Current Batch Info */}
                        <div className="alert alert-info mb-4">
                          <h6 className="alert-heading">Current Batch Information</h6>
                          <div className="row">
                            <div className="col-md-6">
                              <strong>Batch Name:</strong> {editingBatch?.batch_name}
                            </div>
                            <div className="col-md-6">
                              <strong>Course:</strong> {editingBatch?.course_id?.course_title || "N/A"}
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-md-6">
                              <strong>Currently Assigned Instructors:</strong>
                              <div className="mt-1">
                                {editingBatch?.instructor_ids && editingBatch.instructor_ids.length > 0 ? (
                                  <div className="d-flex align-items-center flex-wrap">
                                    <span className="badge bg-primary me-1 mb-1">
                                      {editingBatch.instructor_ids[0].user_id
                                        ? `${editingBatch.instructor_ids[0].user_id.fname} ${editingBatch.instructor_ids[0].user_id.lname}`
                                        : editingBatch.instructor_ids[0].email || "N/A"}
                                    </span>
                                    {editingBatch.instructor_ids.length > 1 && (
                                      <span className="badge bg-secondary me-1 mb-1">
                                        +{editingBatch.instructor_ids.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="badge bg-secondary">
                                    {editingBatch?.instructor_id?.user_id
                                      ? `${editingBatch.instructor_id.user_id.fname} ${editingBatch.instructor_id.user_id.lname}`
                                      : editingBatch?.instructor_id?.email || "N/A"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <strong>Status:</strong>
                              <span className={`badge ms-1 ${editingBatch?.status === "active" ? "bg-success" :
                                editingBatch?.status === "completed" ? "bg-info" : "bg-secondary"
                                }`}>
                                {editingBatch?.status}
                              </span>
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-md-6">
                              <strong>Subscription Amount:</strong>
                              <span className="ms-1">₹{editingBatch?.subscription_price || 1000}</span>
                            </div>
                            <div className="col-md-6">
                              <strong>Subscription Status:</strong>
                              <span className={`badge ms-1 ${editingBatch?.subscription_enabled ? "bg-success" : "bg-secondary"
                                }`}>
                                {editingBatch?.subscription_enabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="edit_batch_name"
                                className="form-label"
                              >
                                Batch Name *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="edit_batch_name"
                                name="batch_name"
                                value={editForm.batch_name}
                                onChange={handleEditChange}
                                placeholder="Enter batch name"
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label
                                htmlFor="edit_course_id"
                                className="form-label"
                              >
                                Course *
                              </label>
                              <select
                                name="course_id"
                                value={editForm.course_id}
                                onChange={handleEditChange}
                                className="form-control"
                                required
                              >
                                <option value="">Select Course</option>
                                {courses &&
                                  courses
                                    .filter((c) => c.is_active || c._id === editForm.course_id)
                                    .map((course) => (
                                      <option key={course._id} value={course._id}>
                                        {course.course_title}
                                      </option>
                                    ))}
                              </select>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">
                                  Select Instructors
                                </label>
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={handleEditSelectAllInstructors}
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleEditDeselectAllInstructors}
                                  >
                                    Clear All
                                  </button>
                                </div>
                              </div>
                              <div
                                className="border rounded p-3"
                                style={{
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  backgroundColor: "#f8f9fa"
                                }}
                              >
                                {instructors && instructors.length > 0 ? (
                                  instructors.map((instructor) => (
                                    <div key={instructor.id} className="form-check mb-2">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`edit_instructor_${instructor.id}`}
                                        checked={editForm.instructor_ids.includes(instructor.id)}
                                        onChange={() => handleEditInstructorToggle(instructor.id)}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`edit_instructor_${instructor.id}`}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {instructor.name}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted mb-0">No instructors available</p>
                                )}
                              </div>
                              <small className="form-text text-muted">
                                Selected: {editForm.instructor_ids.length} instructor(s)
                              </small>
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor="edit_start_date"
                                className="form-label"
                              >
                                Start Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="edit_start_date"
                                name="start_date"
                                value={editForm.start_date}
                                onChange={handleEditChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="edit_end_date"
                                className="form-label"
                              >
                                End Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="edit_end_date"
                                name="end_date"
                                value={editForm.end_date}
                                onChange={handleEditChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label
                                htmlFor="edit_status"
                                className="form-label"
                              >
                                Status
                              </label>
                              <select
                                name="status"
                                value={editForm.status}
                                onChange={handleEditChange}
                                className="form-control"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="edit_subscription_price" className="form-label">
                                Subscription Amount (₹)
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="edit_subscription_price"
                                name="subscription_price"
                                value={editForm.subscription_price}
                                onChange={handleEditChange}
                                placeholder="Enter subscription amount"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="edit_subscription_enabled" className="form-label">
                                Subscription Status
                              </label>
                              <select
                                name="subscription_enabled"
                                value={editForm.subscription_enabled}
                                onChange={handleEditChange}
                                className="form-control"
                              >
                                <option value={true}>Enabled</option>
                                <option value={false}>Disabled</option>
                              </select>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="edit_max_students" className="form-label">
                                Max Students *
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="edit_max_students"
                                name="max_students"
                                value={editForm.max_students}
                                onChange={handleEditChange}
                                placeholder="e.g. 50"
                                required
                                min="1"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Batch Time *</label>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                {renderTimePicker(true, 'start_time')}
                                <span className="text-muted">to</span>
                                {renderTimePicker(true, 'end_time')}
                              </div>
                              {editForm.start_time && editForm.end_time && (
                                <small className="text-primary fw-bold mt-1 d-block">
                                  {formatTimeToAMPM(editForm.start_time)} - {formatTimeToAMPM(editForm.end_time)}
                                </small>
                              )}
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label className="form-label">Recurring Days (Weekly)</label>
                              <div className="d-flex flex-wrap gap-2 pt-1">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                  <div key={day} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`edit_day_${day}`}
                                      checked={editForm.recurring_days.includes(day)}
                                      onChange={() => handleEditRecurringDaysToggle(day)}
                                    />
                                    <label className="form-check-label" htmlFor={`edit_day_${day}`}>
                                      {day.slice(0, 3)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label className="form-label">Meeting Platform</label>
                              <select
                                name="meeting_platform"
                                value={editForm.meeting_platform}
                                onChange={handleEditChange}
                                className="form-control"
                              >
                                <option value="Dyte">Dyte</option>
                                <option value="Google Meet">Google Meet</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Meeting Link</label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="meeting_link"
                                  value={editForm.meeting_link}
                                  onChange={handleEditChange}
                                  placeholder="https://..."
                                />
                                {editForm.meeting_link && (
                                  <a href={editForm.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary" title="Test Link">
                                    <i className="fa-solid fa-external-link-alt"></i>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <label className="form-label d-block">Schedule Settings</label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="edit_is_strict_schedule"
                                  name="is_strict_schedule"
                                  checked={editForm.is_strict_schedule}
                                  onChange={(e) => setEditForm({ ...editForm, is_strict_schedule: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="edit_is_strict_schedule">
                                  Strict Schedule Validation {editForm.is_strict_schedule ? "(Enabled)" : "(Disabled)"}
                                </label>
                              </div>
                              <small className="text-muted">
                                If disabled, students can join the meeting at any time (Instant Meeting), regardless of the scheduled time or day.
                              </small>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-danger me-auto"
                          onClick={() => handleDelete(editingBatch._id)}
                        >
                          <i className="fa-solid fa-trash me-1"></i> Delete
                          Batch
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCloseEditModal}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleEditSubmit}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Updating...
                            </>
                          ) : (
                            "Update Batch"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingBatch && (
              <>
                {/* Modal Backdrop */}
                <div
                  className="modal-backdrop fade show"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                  }}
                  onClick={handleDeleteCancel}
                ></div>

                {/* Modal */}
                <div
                  className="modal fade show d-block"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="deleteBatchModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5
                          className="modal-title text-danger"
                          id="deleteBatchModalLabel"
                        >
                          <i className="fa-solid fa-exclamation-triangle me-2"></i>
                          Confirm Delete
                        </h5>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <div className="alert alert-warning" role="alert">
                          <h6 className="alert-heading">Warning!</h6>
                          <p className="mb-0">
                            You are about to delete the batch{" "}
                            <strong>"{deletingBatch.batch_name}"</strong>. This
                            action cannot be undone.
                          </p>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <strong>Batch Name:</strong>
                            <p>{deletingBatch.batch_name}</p>
                          </div>
                          <div className="col-md-6">
                            <strong>Course:</strong>
                            <p>
                              {deletingBatch.course_id?.course_title || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <strong>Instructor:</strong>
                            <p>
                              {deletingBatch.instructor_ids && deletingBatch.instructor_ids.length > 0 ? (
                                <div className="d-flex align-items-center flex-wrap">
                                  <span className="badge bg-primary me-1 mb-1">
                                    {deletingBatch.instructor_ids[0].user_id
                                      ? `${deletingBatch.instructor_ids[0].user_id.fname} ${deletingBatch.instructor_ids[0].user_id.lname}`
                                      : deletingBatch.instructor_ids[0].email || "N/A"}
                                  </span>
                                  {deletingBatch.instructor_ids.length > 1 && (
                                    <span className="badge bg-secondary me-1 mb-1">
                                      +{deletingBatch.instructor_ids.length - 1} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                deletingBatch.instructor_id?.user_id
                                  ? `${deletingBatch.instructor_id.user_id.fname} ${deletingBatch.instructor_id.user_id.lname}`
                                  : deletingBatch.instructor_id?.email || "N/A"
                              )}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <strong>Status:</strong>
                            <p>
                              <span
                                className={`badge ${deletingBatch.status === "active"
                                  ? "bg-success"
                                  : "bg-secondary"
                                  }`}
                              >
                                {deletingBatch.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleDeleteCancel}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleDeleteConfirm}
                        >
                          <i className="fa-solid fa-trash-can me-2"></i>
                          Delete Batch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Enroll Students Modal */}
            {showEnrollModal && enrollingBatch && (
              <>
                {/* Modal Backdrop */}
                <div
                  className="modal-backdrop fade show"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                  }}
                  onClick={handleEnrollCancel}
                ></div>

                {/* Modal */}
                <div
                  className="modal fade show d-block"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="enrollStudentsModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {enrollmentMode === 'list' ? `Students in ${enrollingBatch.batch_name}` : `Add Students to ${enrollingBatch.batch_name}`}
                        </h5>
                        <button type="button" className="btn-close" onClick={handleEnrollCancel} aria-label="Close"></button>
                      </div>

                      <div className="modal-body">
                        {/* Batch Info Summary */}
                        <div className="alert alert-light border mb-3 p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Batch:</strong> {enrollingBatch.batch_name} <br />
                              <small className="text-muted">{enrollingBatch.course_id?.course_title || "N/A"}</small>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-primary">
                                {batchStudents.length} / {enrollingBatch.max_students || "∞"} Enrolled
                              </span>
                            </div>
                          </div>
                        </div>

                        {enrollmentMode === 'list' && (
                          <>
                            <div className="d-flex justify-content-between mb-3">
                              <input
                                type="text"
                                className="form-control w-50"
                                placeholder="Search enrolled students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <button className="btn btn-success" onClick={handleSwitchToAdd}>
                                <i className="fa-solid fa-user-plus me-2"></i> Add Student
                              </button>
                            </div>

                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              <table className="table table-hover">
                                <thead className="table-light">
                                  <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th className="text-end">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {allStudents
                                    .filter(s => s.isEnrolled)
                                    .filter(s =>
                                      (s.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                      (s.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                      (s.user_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                    )
                                    .length > 0 ? (
                                    allStudents
                                      .filter(s => s.isEnrolled)
                                      .filter(s =>
                                        (s.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (s.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (s.user_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                      )
                                      .map(student => (
                                        <tr key={student._id}>
                                          <td><small className="text-muted">{student.user_code || 'N/A'}</small></td>
                                          <td className="fw-bold">{student.fname} {student.lname}</td>
                                          <td>{student.email}</td>
                                          <td>{student.phone_number || '-'}</td>
                                          <td className="text-end">
                                            <button
                                              className="btn btn-outline-danger btn-sm"
                                              onClick={() => handleRemoveStudent(student.login_id)}
                                              title="Remove from batch"
                                            >
                                              <i className="fa-solid fa-trash"></i>
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="text-center py-4 text-muted">
                                        No students enrolled in this batch.
                                      </td>
                                    </tr>
                                  )
                                  }
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {enrollmentMode === 'add' && (
                          <>
                            <div className="d-flex justify-content-between mb-3 gap-2">
                              <button className="btn btn-outline-secondary" onClick={handleSwitchToList}>
                                <i className="fa-solid fa-arrow-left me-2"></i> Back
                              </button>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search students to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>

                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              <table className="table table-hover">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: '50px' }}>Select</th>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {allStudents
                                    .filter(s => !s.isEnrolled) // Show only unenrolled
                                    .filter(s =>
                                      (s.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                      (s.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                      (s.user_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                    )
                                    .length > 0 ? (
                                    allStudents
                                      .filter(s => !s.isEnrolled)
                                      .filter(s =>
                                        (s.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (s.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (s.user_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                      )
                                      .map(student => (
                                        <tr key={student._id} onClick={() => handleAddCheckboxChange(student.login_id)} style={{ cursor: 'pointer' }}>
                                          <td>
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              checked={selectedForAdd.includes(student.login_id)}
                                              onChange={() => { }} // handled by row click
                                            />
                                          </td>
                                          <td><small className="text-muted">{student.user_code || 'N/A'}</small></td>
                                          <td className="fw-bold">{student.fname} {student.lname}</td>
                                          <td>{student.email}</td>
                                        </tr>
                                      ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        No available students found.
                                      </td>
                                    </tr>
                                  )
                                  }
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-3 text-end border-top pt-3">
                              <span className="me-3 text-muted">{selectedForAdd.length} selected</span>
                              <button
                                className="btn btn-primary"
                                onClick={handleAddSelectedStudents}
                                disabled={selectedForAdd.length === 0}
                              >
                                Add Selected Students
                              </button>
                            </div>
                          </>
                        )}

                      </div>
                      <div className="modal-footer">
                        {/* Empty footer as actions are inline */}
                        <button type="button" className="btn btn-secondary" onClick={handleEnrollCancel}>Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Recordings Modal */}
            {showRecordingsModal && selectedBatchForRecordings && (
              <>
                <div
                  className="modal-backdrop fade show"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                  }}
                  onClick={handleCloseRecordingsModal}
                ></div>

                <div
                  className="modal fade show d-block"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    overflow: "auto",
                  }}
                  tabIndex="-1"
                >
                  <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                      <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title">
                          <i className="fa-solid fa-film me-2"></i>
                          Class Recordings: {selectedBatchForRecordings.batch_name}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleCloseRecordingsModal}></button>
                      </div>

                      <div className="modal-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="fw-bold mb-0">Recordings Archive</h6>
                          <div className="d-flex align-items-center gap-3">
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="youtubeUploadToggle"
                                style={{ cursor: 'pointer' }}
                              />
                              <label className="form-check-label small text-muted fw-bold" htmlFor="youtubeUploadToggle">
                                <i className="fa-brands fa-youtube text-danger me-1"></i> UPLOAD TO YT
                              </label>
                            </div>
                            <button
                              className="btn btn-primary btn-sm rounded-pill px-3"
                              onClick={() => document.getElementById('manualRecordingInputTenant').click()}
                            >
                              <i className="fa-solid fa-upload me-1"></i> Upload
                            </button>
                            <input
                              type="file"
                              id="manualRecordingInputTenant"
                              className="d-none"
                              accept="video/*"
                              onChange={handleManualUpload}
                            />
                          </div>
                        </div>

                        {recordingsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Fetching recordings...</p>
                          </div>
                        ) : recordings.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th>Type</th>
                                  <th>Title / Date</th>
                                  <th>Duration</th>
                                  <th className="text-end">Access</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recordings.map((rec) => (
                                  <tr key={rec.id}>
                                    <td>
                                      <span className={`badge ${rec.type === 'dyte' ? 'bg-info bg-opacity-10 text-info' : 'bg-primary bg-opacity-10 text-primary'} border-0`}>
                                        {rec.type?.toUpperCase() || 'DYTE'}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="d-flex flex-column">
                                        <span className="fw-bold small">
                                          {rec.title || new Date(rec.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-muted extra-small">
                                          {new Date(rec.created_at).toLocaleString()}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="small">
                                      {rec.duration ? `${Math.round(rec.duration / 60)} mins` : '-'}
                                    </td>
                                    <td className="text-end">
                                      {rec.url || (rec.status === 'AVAILABLE') ? (
                                        <a
                                          href={rec.url?.startsWith('http') ? rec.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${rec.url?.replace(/^\//, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                        >
                                          <i className="fa-solid fa-play me-1"></i> Watch
                                        </a>
                                      ) : (
                                        <span className="badge bg-warning text-dark">{rec.status}</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-5 bg-light rounded-3 border border-dashed">
                            <i className="fa-solid fa-video-slash fa-2x text-muted mb-2"></i>
                            <p className="text-muted mb-0">No recordings available for this batch.</p>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary px-4" onClick={handleCloseRecordingsModal}>Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div >
    </main >
  );
};

export default TenantBatches;
