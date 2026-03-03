import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaVideo,
  FaPlus,
  FaSearch,
  FaClock,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaEllipsisV,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMeetings,
  fetchInstructorLiveSessions,
  createMeeting,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  assignBatchToMeeting,
  fetchMyBatches,
} from "../../redux/instructor/instructor.slice";
import toast from "react-hot-toast";
import "./InstructorMeetings.css";

function InstructorMeetings() {
  const navigate = useNavigate();
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const cardsPerPage = 6;
  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    agenda: "",
    date: "",
    time: "",
    duration: "60",
    batch_id: "",
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    waiting_room: true,
    enable_chat: true,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
    timeRange: "all",
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const [settings, setSettings] = useState({
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    waiting_room: true,
    enable_chat: true,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editForm, setEditForm] = useState({
    topic: "",
    agenda: "",
    date: "",
    time: "",
    duration: "60",
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    waiting_room: true,
    enable_chat: true,
    status: "scheduled",
  });
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRef = React.useRef(null);
  const [apiError, setApiError] = useState(null);
  const [showBatchAssignmentModal, setShowBatchAssignmentModal] =
    useState(false);
  const [selectedMeetingForBatch, setSelectedMeetingForBatch] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Helper function to format date and time
  //   const formatDateTime = (dateTimeString ) => {
  //     const date = new Date(dateTimeString);
  //     const formattedDate = date.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric'
  //     });
  //     const formattedTime = date.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true
  //     });
  //     return { formattedDate, formattedTime };
  //   };

  const dispatch = useDispatch();
  const meetings = useSelector((state) => state.instructor.meetings);
  const meetingsLoading = useSelector(
    (state) => state.instructor.meetingsLoading
  );
  const meetingsError = useSelector((state) => state.instructor.meetingsError);
  const instructorLiveSessions = useSelector(
    (state) => state.instructor.instructorLiveSessions
  );
  const instructorLiveSessionsLoading = useSelector(
    (state) => state.instructor.instructorLiveSessionsLoading
  );
  const instructorLiveSessionsError = useSelector(
    (state) => state.instructor.instructorLiveSessionsError
  );
  const createMeetingLoading = useSelector(
    (state) => state.instructor.createMeetingLoading
  );
  const createMeetingError = useSelector(
    (state) => state.instructor.createMeetingError
  );
  const updateMeetingLoading = useSelector(
    (state) => state.instructor.updateMeetingLoading
  );
  const updateMeetingError = useSelector(
    (state) => state.instructor.updateMeetingError
  );
  const cancelMeetingLoading = useSelector(
    (state) => state.instructor.cancelMeetingLoading
  );
  const cancelMeetingError = useSelector(
    (state) => state.instructor.cancelMeetingError
  );
  const { myBatches, myBatchesLoading } = useSelector(
    (state) => state.instructor
  );

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { formattedDate, formattedTime, date };
  };

  const isMeetingPast = (meetingTime) => {
    const now = new Date();
    const meetingDate = new Date(meetingTime);
    return meetingDate < now;
  };

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        await dispatch(fetchInstructorLiveSessions()).unwrap();
        dispatch(fetchMyBatches());
        setApiError(null); // Clear any previous errors
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
        if (error?.status === 500 || error?.response?.status === 500) {
          setApiError(
            "Server error: Unable to fetch meetings. Please try again later. Or contact Admin"
          );
        } else if (error?.status === 503 || error?.response?.status === 503) {
          setApiError(
            "Service temporarily unavailable. Please try again later. Or contact Admin"
          );
        } else if (!navigator.onLine) {
          setApiError(
            "No internet connection. Please check your connection and try again."
          );
        } else {
          setApiError(
            "Failed to load meetings. Please try again. Or contact Admin"
          );
        }
      }
    };

    loadMeetings();
  }, [dispatch]);

  useEffect(() => {
    filterMeetings();
  }, [instructorLiveSessions, filters]);

  const filterMeetings = () => {
    let filtered = [...instructorLiveSessions];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter((meeting) =>
        meeting.topic.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (meeting) => meeting.status === filters.status
      );
    }

    // Date range filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filters.dateRange) {
      case "today":
        filtered = filtered.filter((meeting) => {
          const meetingDate = new Date(meeting.start_time);
          return meetingDate.toDateString() === today.toDateString();
        });
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filtered = filtered.filter((meeting) => {
          const meetingDate = new Date(meeting.start_time);
          return meetingDate >= weekStart && meetingDate <= weekEnd;
        });
        break;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filtered = filtered.filter((meeting) => {
          const meetingDate = new Date(meeting.start_time);
          return meetingDate >= monthStart && meetingDate <= monthEnd;
        });
        break;
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      filtered = filtered.filter((meeting) => {
        const meetingTime = new Date(meeting.start_time).getHours();
        switch (filters.timeRange) {
          case "morning":
            return meetingTime >= 6 && meetingTime < 12;
          case "afternoon":
            return meetingTime >= 12 && meetingTime < 17;
          case "evening":
            return meetingTime >= 17 && meetingTime < 22;
          default:
            return true;
        }
      });
    }

    // Sort meetings by date in ascending order
    filtered.sort((a, b) => {
      const aDate = new Date(a.start_time);
      const bDate = new Date(b.start_time);
      return bDate - aDate; // Sort in ascending order (earliest date first)
    });

    setFilteredMeetings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const localDateTime = new Date(`${newMeeting.date}T${newMeeting.time}`);
      const startTime = localDateTime.toISOString();
      const newmeetingData = {
        topic: newMeeting.topic,
        start_time: startTime,
        agenda: newMeeting.agenda,
        duration: newMeeting.duration,
        batch_id: newMeeting.batch_id || null,
        settings: {
          host_video: newMeeting.host_video,
          participant_video: newMeeting.participant_video,
          join_before_host: newMeeting.join_before_host,
          mute_upon_entry: newMeeting.mute_upon_entry,
          waiting_room: newMeeting.waiting_room,
          enable_chat: newMeeting.enable_chat,
        },
      };
      await dispatch(createMeeting(newmeetingData)).unwrap();
      toast.success("Meeting created successfully");
      setShowCreateModal(false);
      setNewMeeting({
        topic: "",
        agenda: "",
        date: "",
        time: "",
        duration: "60",
        batch_id: "",
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        enable_chat: true,
      });
    } catch (error) {
      // error handled by redux state
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedMeeting = {
        ...selectedMeeting,
        ...settings,
      };
      await dispatch(
        updateMeeting({
          dyte_meeting_id: selectedMeeting.dyte_meeting_id,
          updatedMeetingData: updatedMeeting,
        })
      ).unwrap();
      toast.success("Meeting updated successfully");
      setShowSettingsModal(false);
      setSelectedMeeting(null);
    } catch (error) {
      // error handled by redux state
      toast.error("Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  const openSettingsModal = (meeting) => {
    setSelectedMeeting(meeting);
    setSettings({
      host_video: meeting.host_video,
      participant_video: meeting.participant_video,
      join_before_host: meeting.join_before_host,
      mute_upon_entry: meeting.mute_upon_entry,
      waiting_room: meeting.waiting_room,
      enable_chat: meeting.enable_chat,
    });
    setShowSettingsModal(true);
  };

  const handleSettingChange = (setting) => (e) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: e.target.checked,
    }));
  };

  // Calculate pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredMeetings.slice(
    indexOfFirstCard,
    indexOfLastCard
  );
  const totalPages = Math.ceil(filteredMeetings.length / cardsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openEditModal = (meeting) => {
    const meetingDate = new Date(meeting.start_time);
    setEditingMeeting(meeting);
    setEditForm({
      topic: meeting.topic,
      agenda: meeting.agenda,
      date: meetingDate.toISOString().split("T")[0],
      time: meetingDate.toTimeString().slice(0, 5),
      duration: meeting.duration,
      host_video: meeting.settings?.host_video || true,
      participant_video: meeting.settings?.participant_video || true,
      join_before_host: meeting.settings?.join_before_host || false,
      mute_upon_entry: meeting.settings?.mute_upon_entry || true,
      waiting_room: meeting.settings?.waiting_room || true,
      enable_chat: meeting.settings?.enable_chat || true,
      status: meeting.status || "scheduled",
    });
    setShowEditModal(true);
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const localDateTime = new Date(`${editForm.date}T${editForm.time}`);
      const startTime = localDateTime.toISOString();

      const updatedMeetingData = {
        topic: editForm.topic,
        start_time: startTime,
        agenda: editForm.agenda,
        duration: parseInt(editForm.duration),
        status: editForm.status,
        settings: {
          host_video: editForm.host_video,
          participant_video: editForm.participant_video,
          join_before_host: editForm.join_before_host,
          mute_upon_entry: editForm.mute_upon_entry,
          waiting_room: editForm.waiting_room,
          enable_chat: editForm.enable_chat,
        },
      };

      await dispatch(
        updateMeeting({
          dyte_meeting_id: editingMeeting.dyte_meeting_id,
          updatedMeetingData,
        })
      ).unwrap();
      toast.success("Meeting updated successfully");
      // Fetch fresh data after successful update
      dispatch(fetchInstructorLiveSessions());

      // Close the modal and reset state
      setShowEditModal(false);
      setEditingMeeting(null);
      setEditForm({
        topic: "",
        agenda: "",
        date: "",
        time: "",
        duration: "60",
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        enable_chat: true,
        status: "scheduled",
      });
    } catch (error) {
      // Error handled by redux
      toast.error("Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMeeting, setDeletingMeeting] = useState(null);

  const handleCancelMeeting = (meeting) => {
    setMeetingToCancel(meeting);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      await dispatch(cancelMeeting(meetingToCancel.dyte_meeting_id)).unwrap();
      toast.success("Meeting cancelled successfully");
      dispatch(fetchInstructorLiveSessions());
    } catch (error) {
      toast.error("Failed to cancel meeting.");
    } finally {
      setCancelLoading(false);
      setConfirmOpen(false);
      setMeetingToCancel(null);
    }
  };

  const handleCloseModal = () => {
    setConfirmOpen(false);
    setMeetingToCancel(null);
  };

  const handleDeleteClick = (meeting) => {
    setDeletingMeeting(meeting);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingMeeting(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await dispatch(deleteMeeting(deletingMeeting.dyte_meeting_id)).unwrap();
      toast.success("Meeting deleted successfully");
    } catch (error) {
      toast.error("Failed to delete meeting.");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setDeletingMeeting(null);
    }
  };

  const handleCopyMeetingLink = async (joinUrl) => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Meeting link copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = joinUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Meeting link copied to clipboard!");
    }
  };

  const handleRetryMeetings = async () => {
    setApiError(null);
    try {
      await dispatch(fetchInstructorLiveSessions()).unwrap();
      toast.success("Meetings loaded successfully");
    } catch (error) {
      console.error("Retry failed:", error);
      if (error?.status === 500 || error?.response?.status === 500) {
        setApiError(
          "Server error: Unable to fetch meetings. Please try again later. Or contact Admin"
        );
      } else {
        setApiError(
          "Failed to load meetings. Please try again Or contact Admin."
        );
      }
    }
  };

  // Handler functions for table actions
  const handleStartMeeting = (meeting) => {
    // Implement start meeting logic
    console.log("Starting meeting:", meeting);
  };

  // const handleEditMeeting = (meeting) => {
  //   setEditingMeeting(meeting);
  //   setEditForm({
  //     topic: meeting.topic,
  //     agenda: meeting.agenda,
  //     date: meeting.date,
  //     time: meeting.time,
  //     duration: meeting.duration,
  //     host_video: meeting.host_video,
  //     participant_video: meeting.participant_video,
  //     join_before_host: meeting.join_before_host,
  //     mute_upon_entry: meeting.mute_upon_entry,
  //     waiting_room: meeting.waiting_room,
  //     enable_chat: meeting.enable_chat,
  //     status: meeting.status
  //   });
  //   setShowEditModal(true);
  // };

  const handleDeleteMeeting = (meeting) => {
    // Implement delete meeting logic
    console.log("Deleting meeting:", meeting);
  };

  const openBatchAssignmentModal = (meeting) => {
    setSelectedMeetingForBatch(meeting);
    setSelectedBatchId(meeting.batch_id?._id || meeting.batch_id || "");
    setShowBatchAssignmentModal(true);
  };

  const handleBatchAssignment = async () => {
    try {
      await dispatch(
        assignBatchToMeeting({
          dyte_meeting_id: selectedMeetingForBatch.dyte_meeting_id,
          batch_id: selectedBatchId || null,
        })
      ).unwrap();

      setShowBatchAssignmentModal(false);
      setSelectedMeetingForBatch(null);
      setSelectedBatchId("");
      toast.success("Batch assigned successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to assign batch");
    }
  };

  const handleBatchAssignmentCancel = () => {
    setShowBatchAssignmentModal(false);
    setSelectedMeetingForBatch(null);
    setSelectedBatchId("");
  };

  const handleJoinMeeting = (meeting) => {
    // Implement join meeting logic
    console.log("Joining meeting:", meeting);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* CSS Styles for button hover and loading animation */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
        <style>
          .create-session-btn:hover {
            background: #ed1b76 !important;
            box-shadow: 0 4px 12px rgba(237, 27, 118, 0.3);
            transform: translateY(-1px);
          }
          
          .create-session-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(237, 27, 118, 0.2);
          }
          
          @media (max-width: 576px) {
            .create-session-btn {
              font-size: 13px !important;
              padding: 10px 12px !important;
              width: 80% !important;
              max-width: 200px !important;
              margin: 0 auto !important;
              display: block !important;
            }
          }
          
          @media (max-width: 480px) {
            .create-session-btn {
              font-size: 12px !important;
              padding: 8px 10px !important;
              width: 70% !important;
              max-width: 160px !important;
              margin: 0 auto !important;
              display: block !important;
            }
          }
          
          @media (max-width: 375px) {
            .create-session-btn {
              font-size: 11px !important;
              padding: 6px 8px !important;
              width: 60% !important;
              max-width: 140px !important;
              margin: 0 auto !important;
              display: block !important;
            }
          }
          

        </style>
      `,
        }}
      />

      {/* Main Content */}
      <div className="modern-grid">
        <div className="modern-card" style={{ gridColumn: "span 12" }}>
          {/* Header */}
          <div className="row justify-content-center mb-4">
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12">
              <button
                className="addtenant-btn create-session-btn"
                onClick={() => setShowCreateModal(true)}
                style={{
                  fontSize: "clamp(12px, 2vw, 14px)",
                  padding: "clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 16px)",
                  minHeight: "clamp(36px, 8vw, 44px)",
                  background: "#4c5096",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(4px, 1vw, 8px)",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <span className="fs-5 d-none d-sm-inline">+</span>
                <span className="d-sm-none">+</span>
                <span className="d-none d-sm-inline">Create New Session</span>
                <span className="d-sm-none">Create Session</span>
              </button>
            </div>
          </div>

          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-red-800 text-sm">{apiError}</span>
                </div>
                <button
                  onClick={handleRetryMeetings}
                  className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="row mt-3">
            <div className="col-md-6 mx-auto">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa-solid fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search meetings by topic..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  autoComplete="off"
                />
                {filters.search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setFilters({ ...filters, search: "" })}
                    title="Clear search"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div className="row mt-3">
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Meetings Table */}
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
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "50px" }}
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "200px" }}
                  >
                    Topic
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "120px" }}
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "100px" }}
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "100px" }}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "150px" }}
                  >
                    Batch
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "150px" }}
                  >
                    Agenda
                  </th>
                  <th
                    scope="col"
                    className="text-nowrap text-center"
                    style={{ width: "150px" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {instructorLiveSessionsLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="d-flex justify-content-center align-items-center">
                        <div
                          className="spinner-border text-primary me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading meetings...
                      </div>
                    </td>
                  </tr>
                ) : currentCards && currentCards.length > 0 ? (
                  currentCards.map((meeting, index) => {
                    const isPast = isMeetingPast(meeting.start_time);
                    const { formattedDate, formattedTime } = formatDateTime(
                      meeting.start_time
                    );
                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td
                          className="text-nowrap"
                          style={{ verticalAlign: "middle" }}
                        >
                          <div
                            className="d-flex flex-column align-items-start justify-content-center"
                            style={{ minWidth: "200px" }}
                          >
                            <div className="d-flex align-items-center justify-content-start mb-1 w-100">
                              <i
                                className="fa-solid fa-video text-primary me-2"
                                style={{ minWidth: "16px", flexShrink: 0 }}
                              ></i>
                              <span
                                className="fw-medium text-start"
                                style={{ flex: 1, lineHeight: "1.2" }}
                              >
                                {meeting.topic}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          className="text-nowrap"
                          style={{ verticalAlign: "middle" }}
                        >
                          <div
                            className="d-flex flex-column align-items-start justify-content-center"
                            style={{ minWidth: "120px" }}
                          >
                            <div
                              className="fw-medium text-start"
                              style={{ lineHeight: "1.2" }}
                            >
                              {formattedDate}
                            </div>
                            <small
                              className="text-muted text-start"
                              style={{ lineHeight: "1.2" }}
                            >
                              {formattedTime}
                            </small>
                          </div>
                        </td>
                        <td
                          className="text-nowrap"
                          style={{ verticalAlign: "middle" }}
                        >
                          <div className="text-start">
                            {meeting.duration} min
                          </div>
                        </td>
                        <td
                          className="text-nowrap"
                          style={{ verticalAlign: "middle" }}
                        >
                          <div className="text-start">
                            <span
                              className={`badge ${meeting.status === "completed" ||
                                meeting.status === "cancelled"
                                ? "bg-secondary"
                                : meeting.status === "ongoing"
                                  ? "bg-primary"
                                  : "bg-success"
                                }`}
                            >
                              {meeting.status === "ongoing"
                                ? "Ongoing"
                                : meeting.status === "completed"
                                  ? "Completed"
                                  : meeting.status === "cancelled"
                                    ? "Cancelled"
                                    : "Scheduled"}
                            </span>
                          </div>
                        </td>
                        <td
                          className="text-nowrap"
                          style={{ verticalAlign: "middle" }}
                        >
                          {meeting.batch_id ? (
                            <div
                              className="d-flex flex-column align-items-start justify-content-center"
                              style={{ minWidth: "150px" }}
                            >
                              <span className="badge bg-info text-start mb-1">
                                <i className="fa-solid fa-users me-1"></i>
                                Assigned
                              </span>
                              <div
                                className="small text-muted text-start"
                                style={{ lineHeight: "1.2" }}
                              >
                                {meeting.batch_id?.course_id?.course_title ||
                                  "Course"}{" "}
                                | {meeting.batch_id?.batch_name || "Batch"}
                              </div>
                            </div>
                          ) : (
                            <div className="text-start">
                              <span className="text-muted">
                                <i className="fa-solid fa-minus"></i>
                              </span>
                            </div>
                          )}
                        </td>
                        <td
                          className="text-nowrap"
                          style={{
                            verticalAlign: "middle",
                            maxWidth: "150px",
                            width: "150px",
                          }}
                        >
                          <div
                            className="text-start"
                            style={{
                              maxWidth: "140px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              lineHeight: "1.2",
                            }}
                            title={meeting.agenda}
                          >
                            {meeting.agenda || "No agenda"}
                          </div>
                        </td>
                        <td className="text-nowrap text-center">
                          <div className="btn-group" role="group">
                            {meeting.status === "scheduled" && (
                              <>
                                {/* <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => openEditModal(meeting)}
                                    title="Edit Meeting"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info me-1"
                                    onClick={() =>
                                      openBatchAssignmentModal(meeting)
                                    }
                                    title="Assign to Batch"
                                    disabled={
                                      myBatchesLoading ||
                                      !myBatches ||
                                      myBatches.length === 0
                                    }
                                  >
                                    <i className="fa-solid fa-users"></i>
                                  </button> */}
                                <button
                                  onClick={() => navigate(`/meeting/${meeting.dyte_meeting_id}`)}
                                  className="btn btn-sm btn-success me-1"
                                  title="Start Meeting"
                                >
                                  <i className="fa-solid fa-play"></i> Start
                                </button>
                                <button
                                  className="btn btn-sm btn-info me-1"
                                  onClick={() => handleCopyMeetingLink(meeting.join_url)}
                                  title="Copy Meeting Link"
                                >
                                  <i className="fa-solid fa-share"></i> Share
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClick(meeting)}
                                  title="Delete Meeting"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </>
                            )}
                            {meeting.status === "ongoing" && (
                              <>
                                <button
                                  onClick={() => navigate(`/meeting/${meeting.dyte_meeting_id}`)}
                                  className="btn btn-sm btn-success me-1"
                                  title="Join Live Session"
                                >
                                  <i className="fa-solid fa-video"></i> Join
                                </button>
                                <button
                                  className="btn btn-sm btn-info me-1"
                                  onClick={() => handleCopyMeetingLink(meeting.join_url)}
                                  title="Copy Meeting Link"
                                >
                                  <i className="fa-solid fa-share"></i> Share
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClick(meeting)}
                                  title="Delete Meeting"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </>
                            )}
                            {meeting.status === "completed" && (
                              <>
                                <div className="text-center me-2">
                                  <small className="text-success">
                                    Duration:{" "}
                                    {meeting.meeting_duration_completed || 0}{" "}
                                    min
                                    <br />
                                    Participants:{" "}
                                    {meeting.meeting_participants_count || 0}
                                  </small>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClick(meeting)}
                                  title="Delete Meeting"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </>
                            )}
                            {meeting.status === "cancelled" && (
                              <>
                                <span className="text-danger me-2">
                                  <i className="fa-solid fa-ban"></i>{" "}
                                  Cancelled
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClick(meeting)}
                                  title="Delete Meeting"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-muted">
                        <i className="fa-solid fa-inbox fa-2x mb-2"></i>
                        <br />
                        No meetings found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <FaChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <FaChevronRight />
              </button>
            </div>
          )}

          {/* Create Meeting Modal */}
          {showCreateModal &&
            createPortal(
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
                  onClick={() => setShowCreateModal(false)}
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
                  aria-labelledby="createMeetingModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5
                          className="modal-title"
                          id="createMeetingModalLabel"
                        >
                          Create New Meeting
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowCreateModal(false)}
                          aria-label="Close"
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "0.5rem",
                            lineHeight: "1",
                            opacity: "0.75",
                            position: "relative",
                          }}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <form>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="topic" className="form-label">
                                Meeting Topic *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="topic"
                                value={newMeeting.topic}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    topic: e.target.value,
                                  })
                                }
                                placeholder="Enter meeting topic"
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor="duration"
                                className="form-label"
                              >
                                Duration (minutes) *
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="duration"
                                min="1"
                                value={newMeeting.duration}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    duration: e.target.value,
                                  })
                                }
                                placeholder="Enter duration in minutes"
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="date" className="form-label">
                                Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="date"
                                value={newMeeting.date}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    date: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label htmlFor="time" className="form-label">
                                Time *
                              </label>
                              <input
                                type="time"
                                className="form-control"
                                id="time"
                                value={newMeeting.time}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    time: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <label htmlFor="agenda" className="form-label">
                                Agenda *
                              </label>
                              <textarea
                                className="form-control"
                                id="agenda"
                                rows="3"
                                value={newMeeting.agenda}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    agenda: e.target.value,
                                  })
                                }
                                placeholder="Enter meeting agenda"
                                required
                              ></textarea>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <label
                                htmlFor="batch_id"
                                className="form-label"
                              >
                                Assign to Batch
                              </label>
                              <select
                                className="form-control"
                                id="batch_id"
                                value={newMeeting.batch_id || ""}
                                onChange={(e) =>
                                  setNewMeeting({
                                    ...newMeeting,
                                    batch_id: e.target.value || null,
                                  })
                                }
                                disabled={
                                  myBatchesLoading ||
                                  !myBatches ||
                                  myBatches.length === 0
                                }
                              >
                                <option value="">No batch assignment</option>
                                {myBatchesLoading ? (
                                  <option value="" disabled>
                                    Loading batches...
                                  </option>
                                ) : myBatches && myBatches.length > 0 ? (
                                  myBatches.map((batch) => (
                                    <option key={batch._id} value={batch._id}>
                                      {batch.course_id?.course_title ||
                                        "Course"}{" "}
                                      | {batch.batch_name}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    No batches assigned to you
                                  </option>
                                )}
                              </select>
                              <small className="form-text text-muted">
                                Students in the selected batch will be able to
                                see and join this live session.
                              </small>
                              {!myBatchesLoading &&
                                (!myBatches || myBatches.length === 0) && (
                                  <div className="alert alert-warning mt-2">
                                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                                    You don't have any batches assigned to
                                    you. Please contact your administrator to
                                    get batches assigned.
                                  </div>
                                )}
                            </div>
                          </div>

                          <hr className="my-4" />

                          <h6 className="mb-3 fw-bold">Meeting Settings</h6>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="hostVideo"
                                  checked={newMeeting.host_video}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      host_video: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="hostVideo"
                                >
                                  Host Video
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="participantVideo"
                                  checked={newMeeting.participant_video}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      participant_video: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="participantVideo"
                                >
                                  Participant Video
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="joinBeforeHost"
                                  checked={newMeeting.join_before_host}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      join_before_host: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="joinBeforeHost"
                                >
                                  Join Before Host
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="muteUponEntry"
                                  checked={newMeeting.mute_upon_entry}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      mute_upon_entry: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="muteUponEntry"
                                >
                                  Mute Upon Entry
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="waitingRoom"
                                  checked={newMeeting.waiting_room}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      waiting_room: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="waitingRoom"
                                >
                                  Waiting Room
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="enableChat"
                                  checked={newMeeting.enable_chat}
                                  onChange={(e) =>
                                    setNewMeeting({
                                      ...newMeeting,
                                      enable_chat: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="enableChat"
                                >
                                  Enable Chat
                                </label>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowCreateModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleCreateMeeting}
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
                            "Create Meeting"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body
            )}

          {/* Edit Meeting Modal */}
          {showEditModal &&
            editingMeeting &&
            createPortal(
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMeeting(null);
                  }}
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
                  aria-labelledby="editMeetingModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5
                          className="modal-title"
                          id="editMeetingModalLabel"
                        >
                          Edit Meeting
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingMeeting(null);
                          }}
                          aria-label="Close"
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "0.5rem",
                            lineHeight: "1",
                            opacity: "0.75",
                            position: "relative",
                          }}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <form>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="editTopic"
                                className="form-label"
                              >
                                Meeting Topic *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editTopic"
                                value={editForm.topic}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    topic: e.target.value,
                                  })
                                }
                                placeholder="Enter meeting topic"
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor="editDuration"
                                className="form-label"
                              >
                                Duration (minutes) *
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="editDuration"
                                min="1"
                                value={editForm.duration}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    duration: e.target.value,
                                  })
                                }
                                placeholder="Enter duration in minutes"
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="editDate"
                                className="form-label"
                              >
                                Date *
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="editDate"
                                value={editForm.date}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    date: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor="editTime"
                                className="form-label"
                              >
                                Time *
                              </label>
                              <input
                                type="time"
                                className="form-control"
                                id="editTime"
                                value={editForm.time}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    time: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label
                                htmlFor="editStatus"
                                className="form-label"
                              >
                                Status
                              </label>
                              <select
                                className="form-control"
                                id="editStatus"
                                value={editForm.status}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    status: e.target.value,
                                  })
                                }
                              >
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">
                                  In Progress
                                </option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-12">
                              <label
                                htmlFor="editAgenda"
                                className="form-label"
                              >
                                Agenda *
                              </label>
                              <textarea
                                className="form-control"
                                id="editAgenda"
                                rows="3"
                                value={editForm.agenda}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    agenda: e.target.value,
                                  })
                                }
                                placeholder="Enter meeting agenda"
                                required
                              ></textarea>
                            </div>
                          </div>

                          <hr className="my-4" />

                          <h6 className="mb-3 fw-bold">Meeting Settings</h6>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editHostVideo"
                                  checked={editForm.host_video}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      host_video: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editHostVideo"
                                >
                                  Host Video
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editParticipantVideo"
                                  checked={editForm.participant_video}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      participant_video: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editParticipantVideo"
                                >
                                  Participant Video
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editJoinBeforeHost"
                                  checked={editForm.join_before_host}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      join_before_host: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editJoinBeforeHost"
                                >
                                  Join Before Host
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editMuteUponEntry"
                                  checked={editForm.mute_upon_entry}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      mute_upon_entry: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editMuteUponEntry"
                                >
                                  Mute Upon Entry
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editWaitingRoom"
                                  checked={editForm.waiting_room}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      waiting_room: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editWaitingRoom"
                                >
                                  Waiting Room
                                </label>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="editEnableChat"
                                  checked={editForm.enable_chat}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      enable_chat: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="editEnableChat"
                                >
                                  Enable Chat
                                </label>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingMeeting(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleEditMeeting}
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
                            "Update Meeting"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body
            )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen &&
            deletingMeeting &&
            createPortal(
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
                  aria-labelledby="deleteMeetingModalLabel"
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
                          className="modal-title"
                          id="deleteMeetingModalLabel"
                        >
                          Delete Meeting
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleDeleteCancel}
                          aria-label="Close"
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "0.5rem",
                            lineHeight: "1",
                            opacity: "0.75",
                            position: "relative",
                          }}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <p>
                          Are you sure you want to delete the meeting "
                          <strong>{deletingMeeting.topic}</strong>"?
                        </p>
                        <p className="text-muted">
                          This action cannot be undone.
                        </p>
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
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Deleting...
                            </>
                          ) : (
                            "Delete Meeting"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body
            )}

          {/* Batch Assignment Modal */}
          {showBatchAssignmentModal &&
            selectedMeetingForBatch &&
            createPortal(
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
                  onClick={handleBatchAssignmentCancel}
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
                  aria-labelledby="batchAssignmentModalLabel"
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
                          className="modal-title"
                          id="batchAssignmentModalLabel"
                        >
                          Assign Batch to Live Session
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleBatchAssignmentCancel}
                          aria-label="Close"
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#fff",
                            cursor: "pointer",
                            padding: "0.5rem",
                            lineHeight: "1",
                            opacity: "0.75",
                            position: "relative",
                          }}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <div className="mb-3">
                          <h6>
                            Live Session:{" "}
                            <strong>{selectedMeetingForBatch.topic}</strong>
                          </h6>
                          <p className="text-muted mb-3">
                            Scheduled for:{" "}
                            {
                              formatDateTime(
                                selectedMeetingForBatch.start_time
                              ).formattedDate
                            }{" "}
                            at{" "}
                            {
                              formatDateTime(
                                selectedMeetingForBatch.start_time
                              ).formattedTime
                            }
                          </p>
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="batchAssignmentSelect"
                            className="form-label"
                          >
                            Select Batch
                          </label>
                          <select
                            className="form-control"
                            id="batchAssignmentSelect"
                            value={selectedBatchId}
                            onChange={(e) =>
                              setSelectedBatchId(e.target.value)
                            }
                            disabled={
                              myBatchesLoading ||
                              !myBatches ||
                              myBatches.length === 0
                            }
                          >
                            <option value="">No batch assignment</option>
                            {myBatchesLoading ? (
                              <option value="" disabled>
                                Loading batches...
                              </option>
                            ) : myBatches && myBatches.length > 0 ? (
                              myBatches.map((batch) => (
                                <option key={batch._id} value={batch._id}>
                                  {batch.course_id?.course_title || "Course"}{" "}
                                  | {batch.batch_name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No batches assigned to you
                              </option>
                            )}
                          </select>
                          {selectedMeetingForBatch?.batch_id && (
                            <small className="form-text text-info mt-1">
                              Currently assigned to:{" "}
                              {selectedMeetingForBatch.batch_id?.course_id
                                ?.course_title || "Course"}{" "}
                              |{" "}
                              {selectedMeetingForBatch.batch_id?.batch_name ||
                                "Batch"}
                            </small>
                          )}
                          <small className="form-text text-muted">
                            Students in the selected batch will be able to see
                            and join this live session.
                          </small>
                          {!myBatchesLoading &&
                            (!myBatches || myBatches.length === 0) && (
                              <div className="alert alert-warning mt-2">
                                <i className="fa-solid fa-exclamation-triangle me-2"></i>
                                You don't have any batches assigned to you.
                                Please contact your administrator to get
                                batches assigned.
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleBatchAssignmentCancel}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleBatchAssignment}
                          disabled={
                            updateMeetingLoading ||
                            myBatchesLoading ||
                            !myBatches ||
                            myBatches.length === 0
                          }
                        >
                          {updateMeetingLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Assigning...
                            </>
                          ) : (
                            "Assign Batch"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>,
              document.body
            )}
        </div>
      </div>
    </>
  );
}
export default InstructorMeetings;
