import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaClock, FaPlay, FaEye, FaSearch, FaDownload, FaExternalLinkAlt, FaVideo } from 'react-icons/fa';

const StudentViewBatch = () => {
  const user = useSelector((state) => state.user?.user);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState("table");

  // User object structure can vary: sometimes Root.user, sometimes Root.user.user
  const studentId = user?._id || user?.id || user?.user?._id || user?.user?.id;

  const api_url = import.meta.env.VITE_API_URL;

  // Helper to check if a batch is currently live
  const checkIsLive = (batch) => {
    // If meeting_link exists, it's live
    if (batch.meeting_link) return true;

    if (!batch.start_time || !batch.recurring_days) return false;

    const now = new Date();
    const days = Array.isArray(batch.recurring_days) ? batch.recurring_days : [];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    const isToday = days.some(d => d === currentDay);
    if (!isToday) return false;

    try {
      let timeStr = batch.batch_time;
      if (timeStr && timeStr.includes(" - ")) {
        timeStr = timeStr.split(" - ")[0];
      } else if (batch.start_time) {
        timeStr = batch.start_time;
      }

      if (!timeStr) return false;

      let [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':');

      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startTimeDesc = new Date(now);
      startTimeDesc.setHours(hours, minutes, 0, 0);

      const diff = (now - startTimeDesc) / 1000 / 60;
      return diff >= -15 && diff <= 120;
    } catch (e) {
      return false;
    }
  };

  // Handle Join Class
  const handleJoinClass = async (batch) => {
    try {
      const fullUrl = `${api_url}/dyte/join-meeting`;
      const batchId = batch?.batch_id;

      if (!batchId || typeof batchId !== "string") {
        console.error("[Join Class] Invalid batchId payload:", { batchId, batch });
        toast.error("Invalid batch. Please refresh and try again.");
        return;
      }

      console.log(`[Diagnostic] Calling Join Class: ${fullUrl}`, { batchId });
      const response = await axios.post(
        fullUrl,
        { batchId },
        { withCredentials: true }
      );

      if (response.data.success) {
        let win = null;
        if (response.data.authToken) {
          const meetingId = response.data.meeting_id || response.data.meetingId || "";
          const role = response.data.role || 'student';
          const url = `${window.location.origin}/meeting?authToken=${encodeURIComponent(response.data.authToken)}&role=${encodeURIComponent(role)}&batchId=${encodeURIComponent(batchId)}&meetingId=${encodeURIComponent(meetingId)}`;
          win = window.open(url, 'DyteMeetingWindow');
        } else if (response.data.meeting_link) {
          win = window.open(response.data.meeting_link, 'DyteMeetingWindow');
        }

        if (win) {
          toast.success("Joined class successfully!");
        }
      }
    } catch (error) {
      console.error("Join Class Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to join class";

      if (errorMessage.includes("not been started")) {
        toast.info("The meeting has not been started by the instructor yet. Please wait.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const renderJoinButton = (batch) => {
    const isLive = checkIsLive(batch);

    if (isLive || batch.meeting_link) {
      return (
        <button
          onClick={() => handleJoinClass(batch)}
          className="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            fontSize: '0.8rem'
          }}
        >
          <FaVideo className="me-1" /> Join Class
        </button>
      );
    }

    let startTimeDisplay = batch.batch_time;
    if (startTimeDisplay && startTimeDisplay.includes(" - ")) {
      startTimeDisplay = startTimeDisplay.split(" - ")[0];
    }

    return (
      <span className="badge bg-light text-muted border" style={{ fontSize: '0.75rem' }}>
        <FaClock className="me-1" /> Starts at {startTimeDisplay || 'TBD'}
      </span>
    );
  };

  useEffect(() => {
    const fetchStudentBatches = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${api_url}/batch-student/student/enrolled-batches`, {
          withCredentials: true
        });
        if (response.data.success) {
          setBatches(response.data.batches || []);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
        setError(error);
        toast.error("Failed to load batches.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentBatches();
  }, [user, api_url]);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course_id?.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "" || batch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getInstructors = (batch) => {
    if (batch.instructor_ids && batch.instructor_ids.length > 0) {
      return batch.instructor_ids.map(inst => inst.user_id ? `${inst.user_id.fname} ${inst.user_id.lname}` : inst.email).join(", ");
    }
    if (batch.instructor_id) {
      return batch.instructor_id.user_id ? `${batch.instructor_id.user_id.fname} ${batch.instructor_id.user_id.lname}` : (batch.instructor_id.email || "Pending");
    }
    return "Pending";
  };

  // --- Recordings Modal Logic ---
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [selectedBatchForRecordings, setSelectedBatchForRecordings] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [activeRecording, setActiveRecording] = useState(null);

  const getServerBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    return apiUrl.replace(/\/api\/?$/, "");
  };

  const toAbsoluteUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const base = getServerBaseUrl();
    const clean = String(value).replace(/^\/+/, "");
    return `${base}/${clean}`;
  };

  const isYoutubeUrl = (url) => /(?:youtube\.com|youtu\.be)/i.test(url || "");

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/i);
    if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    const watchMatch = url.match(/[?&]v=([^?&]+)/i);
    if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/i);
    if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;

    return "";
  };

  const isInlinePlayableVideo = (url) =>
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || "");

  const resolveRecordingLinks = (rec) => {
    const rawView = rec?.url || rec?.local_url || rec?.youtube_url || "";
    const rawDownload = rec?.download_url || rec?.url || rec?.local_url || rec?.youtube_url || "";
    return {
      viewUrl: toAbsoluteUrl(rawView),
      downloadUrl: toAbsoluteUrl(rawDownload),
    };
  };

  const fetchRecordings = async (batchId) => {
    setRecordingsLoading(true);
    try {
      const response = await axios.get(`${api_url}/dyte/recordings/${batchId}`, { withCredentials: true });
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
    fetchRecordings(batch.batch_id); // use batch_id here
  };

  const handleCloseRecordingsModal = () => {
    setShowRecordingsModal(false);
    setSelectedBatchForRecordings(null);
    setRecordings([]);
    setActiveRecording(null);
  };

  const handleWatchRecording = (rec) => {
    const { viewUrl } = resolveRecordingLinks(rec);
    if (!viewUrl) {
      toast.info("Recording link is not ready yet.");
      return;
    }

    const inlinePlayable = isInlinePlayableVideo(viewUrl) || isYoutubeUrl(viewUrl);
    if (inlinePlayable) {
      setActiveRecording({
        ...rec,
        viewUrl,
      });
      return;
    }

    window.open(viewUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadRecording = (rec) => {
    const { downloadUrl } = resolveRecordingLinks(rec);
    if (!downloadUrl) {
      toast.info("Download link is not ready yet.");
      return;
    }
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modern-grid">
      <div className="modern-card" style={{ gridColumn: 'span 12' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1">My Enrolled Batches</h4>
            <p className="text-muted small mb-0">Manage your active classes</p>
          </div>
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select bg-light" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: '150px' }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="table-responsive">
          <table className="table table-hover align-middle custom-table">
            <thead className="bg-light">
              <tr>
                <th className="border-0 rounded-start ps-4">Batch Info</th>
                <th className="border-0">Instructor(s)</th>
                <th className="border-0">Schedule</th>
                <th className="border-0">Dates</th>
                <th className="border-0">Status</th>
                <th className="border-0">Progress</th>
                <th className="border-0">Join Class</th>
                <th className="border-0 text-end rounded-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading your batches...</p>
                  </td>
                </tr>
              ) : filteredBatches.length > 0 ? (
                filteredBatches.map(batch => (
                  <tr key={batch._id}>
                    <td className="ps-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{batch.batch_name}</span>
                        <small className="text-muted">{batch.course_id?.course_title}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-placeholder bg-success bg-opacity-10 text-success rounded-circle small d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                          <FaUser size={12} />
                        </div>
                        <span className="small fw-semibold">{getInstructors(batch)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="fw-bold text-dark mb-1"><FaClock className="me-1 text-primary" /> {batch.batch_time || 'Time TBD'}</span>
                        <span className="text-muted"><i className="fa-regular fa-calendar-days me-1"></i> {Array.isArray(batch.recurring_days) && batch.recurring_days.length > 0 ? batch.recurring_days.map(d => d.slice(0, 3)).join(', ') : 'Days TBD'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small text-muted">
                        <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${batch.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div className="progress-bar bg-primary" style={{ width: `${batch.progress || 0}%` }}></div>
                        </div>
                        <small className="text-muted">{batch.progress || 0}%</small>
                      </div>
                    </td>
                    <td>
                      {renderJoinButton(batch)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-dark btn-sm rounded-circle"
                          title="View Recordings"
                          onClick={() => handleViewRecordings(batch)}
                        >
                          <FaPlay size={12} />
                        </button>
                        <div className="dropdown">
                          <button className="btn btn-light btn-sm rounded-circle shadow-sm" data-bs-toggle="dropdown">
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3">
                            <li><button className="dropdown-item" onClick={() => { }}><FaEye className="me-2 text-primary" /> View Details</button></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  {activeRecording && (
                    <div className="border rounded-3 p-3 mb-4 bg-light">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{activeRecording.title || "Recording Preview"}</h6>
                          <small className="text-muted">Direct view mode</small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success rounded-pill px-3"
                            onClick={() => handleDownloadRecording(activeRecording)}
                          >
                            <FaDownload className="me-1" /> Download
                          </button>
                          <button
                            className="btn btn-sm btn-outline-dark rounded-pill px-3"
                            onClick={() => {
                              const { viewUrl } = resolveRecordingLinks(activeRecording);
                              if (viewUrl) window.open(viewUrl, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <FaExternalLinkAlt className="me-1" /> Open
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={() => setActiveRecording(null)}
                          >
                            Close Preview
                          </button>
                        </div>
                      </div>

                      {isYoutubeUrl(activeRecording.viewUrl) ? (
                        <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark">
                          <iframe
                            src={getYoutubeEmbedUrl(activeRecording.viewUrl)}
                            title="Recorded Class"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <video
                          src={activeRecording.viewUrl}
                          controls
                          className="w-100 rounded"
                          style={{ maxHeight: "420px", background: "#000" }}
                        />
                      )}
                    </div>
                  )}

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
                                {resolveRecordingLinks(rec).viewUrl ? (
                                  <div className="d-flex justify-content-end gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                      onClick={() => handleWatchRecording(rec)}
                                    >
                                      <i className="fa-solid fa-play me-1"></i> View
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-success rounded-pill px-3"
                                      onClick={() => handleDownloadRecording(rec)}
                                    >
                                      <FaDownload className="me-1" /> Download
                                    </button>
                                  </div>
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
  );
};

export default StudentViewBatch;
