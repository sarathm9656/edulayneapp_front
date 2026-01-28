import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBatches, fetchBatchStudents } from '../../redux/instructor/instructor.slice';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
    FaUsers,
    FaCalendarAlt,
    FaClock,
    FaEye,
    FaSearch,
    FaVideo,
    FaFilter,
    FaChalkboardTeacher,
    FaTimes,
    FaIdCard,
    FaPlus,
    FaPlay
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

const InstructorBatches = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigate here
    const { myBatches, myBatchesLoading, batchStudents, batchStudentsLoading } = useSelector((state) => state.instructor);
    const [showBatchDetailsModal, setShowBatchDetailsModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('active'); // Default sort active first? Or name.
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 10;

    const [activeTab, setActiveTab] = useState('students');
    const [recordings, setRecordings] = useState([]);
    const [recordingsLoading, setRecordingsLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchMyBatches());
    }, [dispatch]);

    const fetchRecordings = async (batchId) => {
        setRecordingsLoading(true);
        try {
            const api_url = import.meta.env.VITE_API_URL;
            // Use axios directly as per pattern (or create a thunk if preferred)
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const parseTime = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 };
        // Handle "HH:MM AM/PM" or "HH:MM"
        const d = new Date(`2000/01/01 ${timeStr}`);
        if (isNaN(d.getTime())) return { hours: 0, minutes: 0 };
        return { hours: d.getHours(), minutes: d.getMinutes() };
    };

    const isTodayClassDay = (recurringDays) => {
        // Strict Mode: If no days are set, assume NO classes are allowed
        if (!recurringDays || recurringDays.length === 0) return false;

        const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = daysMap[new Date().getDay()];
        return recurringDays.includes(today);
    };

    const handleStartClass = async (batchId) => {
        try {
            const api_url = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${api_url}/dyte/create-meeting`, { batchId }, { withCredentials: true });

            if (response.data.success) {
                const authToken = response.data.authToken;
                const role = response.data.role || 'instructor';

                // Store token locally
                localStorage.setItem(`meeting_token_${batchId}`, JSON.stringify({
                    token: authToken,
                    timestamp: Date.now()
                }));

                if (authToken) {
                    const url = `${window.location.origin}/meeting?authToken=${authToken}&role=${role}`;
                    window.open(url, 'DyteMeetingWindow');
                }
                toast.success("Class Started!");
                dispatch(fetchMyBatches());
            }
        } catch (error) {
            console.error("Start Class Error:", error);
            toast.error(error.response?.data?.message || "Failed to start class. Please checks the schedule.");
        }
    };

    const handleJoinClass = (batchId, authToken) => {
        const url = `${window.location.origin}/meeting?authToken=${authToken}&role=instructor`;
        window.open(url, 'DyteMeetingWindow');
    };

    const renderStartButton = (batch) => {
        if (batch.status !== 'active') return null;

        // Local token check removed to enforce backend time validation on every join.

        if (batch.meeting_link) {
            return (
                <button onClick={() => handleStartClass(batch._id)} className="btn btn-sm btn-success text-white me-2 shadow-sm animate-pulse">
                    <i className="fa-solid fa-video me-1"></i> Join Class
                </button>
            );
        } else {
            return (
                <button onClick={() => handleStartClass(batch._id)} className="btn btn-sm btn-primary text-white me-2 shadow-sm animate-pulse">
                    <i className="fa-solid fa-video me-1"></i> Start Class
                </button>
            );
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: 'bg-success', text: 'Active' },
            inactive: { class: 'bg-secondary', text: 'Inactive' },
            completed: { class: 'bg-info', text: 'Completed' },
            dropped: { class: 'bg-danger', text: 'Dropped' },
            suspended: { class: 'bg-warning', text: 'Suspended' }
        };
        const config = statusConfig[status] || { class: 'bg-secondary', text: status };
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    const openBatchDetailsModal = async (batch) => {
        setSelectedBatch(batch);
        setShowBatchDetailsModal(true);
        setActiveTab('students'); // Reset to default
        try {
            // Fetch both students and recordings
            await dispatch(fetchBatchStudents(batch._id)).unwrap();
            fetchRecordings(batch._id);
        } catch (error) {
            toast.error('Failed to load batch data');
        }
    };

    const closeBatchDetailsModal = () => {
        setShowBatchDetailsModal(false);
        setSelectedBatch(null);
    };

    // Filter & Sort
    const filteredBatches = (myBatches || [])
        .filter(batch => {
            const matchesSearch = batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (batch.course_id?.course_title || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // Sorting logic
            if (sortBy === 'name') return a.batch_name.localeCompare(b.batch_name);
            if (sortBy === 'course') return (a.course_id?.course_title || '').localeCompare(b.course_id?.course_title || '');
            if (sortBy === 'date') return new Date(a.start_date) - new Date(b.start_date);
            if (sortBy === 'active') {
                // Active first
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return 0;
            }
            return 0;
        });

    // Pagination
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentBatches = filteredBatches.slice(indexOfFirstCard, indexOfLastCard);
    const totalPages = Math.ceil(filteredBatches.length / cardsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    if (myBatchesLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "60vh" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-grid">
            {/* Header Card */}
            <div className="modern-card p-4" style={{ gridColumn: "span 12" }}>
                <div className="row align-items-center g-3">
                    <div className="col-md-6">
                        <h4 className="fw-bold mb-1">My Batches</h4>
                        <p className="text-muted mb-0 small">Manage your batches and start live classes.</p>
                    </div>
                    <div className="col-md-6">
                        <div className="row g-2">
                            <div className="col-md-5">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Search batches..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="active">Default</option>
                                    <option value="name">Name</option>
                                    <option value="course">Course</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="modern-card p-0 overflow-hidden" style={{ gridColumn: "span 12" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle custom-table mb-0">
                        <thead className="bg-light text-muted">
                            <tr>
                                <th className="ps-4">Batch Info</th>
                                <th>Course</th>
                                <th>Schedule</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBatches.length > 0 ? (
                                currentBatches.map(batch => (
                                    <tr key={batch._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-placeholder bg-soft-primary text-indigo rounded-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: "40px", height: "40px" }}>
                                                    {batch.batch_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{batch.batch_name}</div>
                                                    {batch.batch_code && <small className="text-muted">{batch.batch_code}</small>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{batch.course_id?.course_title || 'N/A'}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <div className="fw-semibold">
                                                    <FaClock className="text-muted me-1 small" /> {batch.batch_time || "-"}
                                                </div>
                                                <small className="text-muted">
                                                    {batch.recurring_days && batch.recurring_days.length > 0
                                                        ? batch.recurring_days.map(d => d.slice(0, 3)).join(", ")
                                                        : "Flexible"}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-muted">
                                                <div>Start: {formatDate(batch.start_date)}</div>
                                                <div>End: {formatDate(batch.end_date)}</div>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(batch.status)}</td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end align-items-center">
                                                {renderStartButton(batch)}
                                                <button
                                                    className="btn btn-sm btn-light border shadow-sm rounded-circle"
                                                    onClick={() => openBatchDetailsModal(batch)}
                                                    title="View Details"
                                                >
                                                    <FaEye className="text-primary" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <div className="mb-3"><FaChalkboardTeacher className="fs-1 opacity-25" /></div>
                                        <p className="mb-0">No batches found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-top">
                        <nav aria-label="Batches pagination">
                            <ul className="pagination justify-content-center mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-start-pill" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-end-pill" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Batch Details Modal */}
            {showBatchDetailsModal && selectedBatch && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-light d-flex justify-content-between align-items-center">
                                <h5 className="modal-title fw-bold">
                                    <FaUsers className="me-2 text-primary" />
                                    {selectedBatch.batch_name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '30px', height: '30px', padding: 0 }}
                                    onClick={closeBatchDetailsModal}
                                    title="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-5 border-end">
                                        <h6 className="fw-bold mb-3 border-bottom pb-2">Batch Information</h6>
                                        <div className="mb-3">
                                            <label className="text-muted small d-block">Course</label>
                                            <span className="fw-semibold">{selectedBatch.course_id?.course_title || 'N/A'}</span>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-muted small d-block">Status</label>
                                            {getStatusBadge(selectedBatch.status)}
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-muted small d-block">Schedule</label>
                                            <div className="d-flex align-items-center gap-2">
                                                <FaClock className="text-primary" />
                                                <span>{selectedBatch.batch_time || "N/A"}</span>
                                            </div>
                                            <div className="small text-muted mt-1">
                                                {selectedBatch.recurring_days?.join(", ") || "No specific days"}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-muted small d-block">Duration</label>
                                            <span className="small">
                                                {formatDate(selectedBatch.start_date)} - {formatDate(selectedBatch.end_date)}
                                            </span>
                                        </div>
                                        {selectedBatch.meeting_link && (
                                            <div className="mb-3">
                                                <label className="text-muted small d-block">Meeting Link</label>
                                                <a href={selectedBatch.meeting_link} target="_blank" rel="noopener noreferrer" className="text-truncate d-block small text-primary">
                                                    {selectedBatch.meeting_link}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-7">
                                        <ul className="nav nav-tabs mb-3">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                                                    onClick={() => setActiveTab('students')}
                                                >
                                                    Enrolled Students <span className="badge bg-primary rounded-pill ms-1">{batchStudents?.students?.length || 0}</span>
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${activeTab === 'recordings' ? 'active' : ''}`}
                                                    onClick={() => setActiveTab('recordings')}
                                                >
                                                    Recordings <span className="badge bg-secondary rounded-pill ms-1">{recordings.length}</span>
                                                </button>
                                            </li>
                                        </ul>

                                        {activeTab === 'students' ? (
                                            batchStudentsLoading ? (
                                                <div className="text-center py-4">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                                    <p className="mt-2 small text-muted">Loading students...</p>
                                                </div>
                                            ) : batchStudents?.students?.length > 0 ? (
                                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    <table className="table table-sm table-hover align-middle mb-0">
                                                        <thead className="table-light sticky-top">
                                                            <tr>
                                                                <th>Student ID</th>
                                                                <th>Name</th>
                                                                <th>Email</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {batchStudents.students.map((enrollment) => (
                                                                <tr key={enrollment._id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <FaIdCard className="text-muted small" />
                                                                            <span className="small fw-semibold">{enrollment.student_id?.user_id?.user_code || enrollment.student_id?.user_code || "-"}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="avatar-placeholder rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                                                                <FaSearch className="fa-xs" />
                                                                            </div>
                                                                            <span className="small fw-semibold">{enrollment.student_id?.user_id?.fname || "Unknown"} {enrollment.student_id?.user_id?.lname || ""}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="small text-muted">{enrollment.student_id?.user_id?.email || enrollment.student_id?.email}</td>
                                                                    <td>
                                                                        <span className={`badge rounded-pill ${enrollment.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary text-muted'} small`} style={{ fontSize: '10px' }}>
                                                                            {enrollment.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted border border-dashed rounded bg-light">
                                                    <FaUsers className="mb-2 opacity-50" />
                                                    <p className="mb-0 small">No students enrolled.</p>
                                                </div>
                                            )
                                        ) : (
                                            // Recordings Tab
                                            <div className="recordings-tab">
                                                <RecordingUploadSection selectedBatch={selectedBatch} fetchRecordings={fetchRecordings} />


                                                {recordingsLoading ? (
                                                    <div className="text-center py-4">
                                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                                        <p className="mt-2 small text-muted">Loading recordings...</p>
                                                    </div>
                                                ) : recordings.length > 0 ? (
                                                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                        <table className="table table-sm table-hover align-middle mb-0">
                                                            <thead className="table-light sticky-top">
                                                                <tr>
                                                                    <th>Source</th>
                                                                    <th>Title / Date</th>
                                                                    <th>Duration</th>
                                                                    <th className="text-end">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {recordings.map((rec) => (
                                                                    <tr key={rec.id}>
                                                                        <td>
                                                                            <span className={`badge ${rec.type === 'dyte' ? 'bg-soft-info text-info' : 'bg-soft-primary text-primary'} border-0 uppercase`} style={{ fontSize: '9px' }}>
                                                                                {rec.type || 'DYTE'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="d-flex flex-column">
                                                                                <span className="fw-semibold small">
                                                                                    {rec.title || new Date(rec.created_at).toLocaleDateString()}
                                                                                </span>
                                                                                <span className="text-muted" style={{ fontSize: '10px' }}>
                                                                                    {new Date(rec.created_at).toLocaleTimeString()}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="small">
                                                                            {rec.duration ? `${Math.round(rec.duration / 60)} mins` : (rec.type === 'manual' ? '-' : 'Processing...')}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            <div className="d-flex justify-content-end gap-2">
                                                                                {/* Error Note Badge */}
                                                                                {rec.status_note && !rec.youtube_url && (
                                                                                    <span
                                                                                        className="badge bg-danger text-white d-flex align-items-center"
                                                                                        style={{ fontSize: '10px', cursor: 'help' }}
                                                                                        title={rec.status_note}
                                                                                    >
                                                                                        <FaTimes className="me-1" /> YouTube Error
                                                                                    </span>
                                                                                )}

                                                                                {/* YouTube Button */}
                                                                                {(rec.youtube_url || (rec.url && rec.url.includes('youtu'))) && (
                                                                                    <a
                                                                                        href={rec.youtube_url || rec.url}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        className="btn btn-xs rounded-pill btn-outline-danger"
                                                                                        style={{ fontSize: '11px' }}
                                                                                        title="Watch on YouTube"
                                                                                    >
                                                                                        <FaPlay className="me-1" style={{ fontSize: '9px' }} /> YouTube
                                                                                    </a>
                                                                                )}

                                                                                {/* Local Watch/Download Button */}
                                                                                {(rec.local_url || (rec.url && !rec.url.includes('youtu'))) && (
                                                                                    <>
                                                                                        {/* If no YouTube, show Watch button for local file */}
                                                                                        {!(rec.youtube_url || (rec.url && rec.url.includes('youtu'))) && (
                                                                                            <a
                                                                                                href={rec.local_url || rec.url}
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                                className="btn btn-xs rounded-pill btn-outline-primary"
                                                                                                style={{ fontSize: '11px' }}
                                                                                            >
                                                                                                <FaPlay className="me-1" style={{ fontSize: '9px' }} /> Watch
                                                                                            </a>
                                                                                        )}

                                                                                        {/* Always show download for local file */}
                                                                                        <a
                                                                                            href={rec.local_url || rec.url}
                                                                                            download={true}
                                                                                            target="_blank"
                                                                                            className="btn btn-xs btn-outline-secondary rounded-pill"
                                                                                            style={{ fontSize: '11px' }}
                                                                                            title="Download to Local System"
                                                                                        >
                                                                                            <i className="fa-solid fa-download me-1" style={{ fontSize: '10px' }}></i> Save
                                                                                        </a>
                                                                                    </>
                                                                                )}

                                                                                {/* Status fallback if no URL */}
                                                                                {(!rec.url && !rec.youtube_url && !rec.local_url && rec.status !== 'AVAILABLE') && (
                                                                                    <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>{rec.status}</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-muted border border-dashed rounded bg-light">
                                                        <FaVideo className="mb-2 opacity-50" />
                                                        <p className="mb-0 small">No recordings found.</p>
                                                        <small className="text-muted d-block mt-1" style={{ fontSize: '10px' }}>Automated recordings appear here after class ends.</small>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light p-2 justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={closeBatchDetailsModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RecordingUploadSection = ({ selectedBatch, fetchRecordings }) => {
    const [uploadToYoutube, setUploadToYoutube] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("Syncing recordings from Dyte...");
        try {
            const api_url = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${api_url}/dyte/sync-recordings/${selectedBatch._id}`, {}, { withCredentials: true });

            toast.dismiss(toastId);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchRecordings(selectedBatch._id);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error("Failed to sync recordings");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('recording', file);
        formData.append('title', `Manual Upload - ${new Date().toLocaleDateString()}`);
        // Pass string 'true' or 'false' because FormData converts booleans to strings differently sometimes
        formData.append('upload_to_youtube', uploadToYoutube.toString());

        const api_url = import.meta.env.VITE_API_URL;
        const toastId = toast.loading("Uploading recording...");
        try {
            const res = await axios.post(`${api_url}/dyte/upload-recording/${selectedBatch._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.dismiss(toastId);
                if (res.data.warning) {
                    toast.error(`Local upload OK, but YouTube failed: ${res.data.warning}`, { duration: 6000 });
                } else {
                    toast.success(res.data.message || "Uploaded successfully!");
                }
                fetchRecordings(selectedBatch._id);
            }
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Class Recordings</h6>
            <div className="d-flex align-items-center gap-3">
                <button
                    className="btn btn-xs btn-outline-primary rounded-pill d-flex align-items-center"
                    style={{ fontSize: '11px' }}
                    onClick={handleSync}
                    disabled={isSyncing}
                    title="Fetch recordings from Dyte if they are missing locally"
                >
                    <i className={`fa-solid fa-rotate ${isSyncing ? 'fa-spin' : ''} me-1`}></i> Sync
                </button>

                <div className="form-check form-switch mb-0">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="youtubeUploadToggle"
                        checked={uploadToYoutube}
                        onChange={(e) => setUploadToYoutube(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label extra-small text-muted fw-bold" htmlFor="youtubeUploadToggle">
                        <i className="fa-brands fa-youtube text-danger me-1"></i> UPLOAD TO YOUTUBE
                    </label>
                </div>
                <button
                    className="btn btn-xs btn-primary rounded-pill d-flex align-items-center"
                    style={{ fontSize: '11px' }}
                    onClick={() => document.getElementById('manualRecordingInput').click()}
                >
                    <FaPlus className="me-1" /> Upload Recording
                </button>
            </div>
            <input
                type="file"
                id="manualRecordingInput"
                className="d-none"
                accept="video/*"
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default InstructorBatches;
