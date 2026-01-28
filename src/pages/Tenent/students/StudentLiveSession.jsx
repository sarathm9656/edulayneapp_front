import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentLiveSessions } from '../../../redux/student.slice';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaUsers, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentLiveSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { liveSessions, liveSessionsLoading, liveSessionsError } = useSelector((state) => state.student);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [apiError, setApiError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchStudentLiveSessions());
  }, [dispatch]);

  // Debug: Log live sessions data
  useEffect(() => {
    console.log("Debug - StudentLiveSession liveSessions:", liveSessions);
    console.log("Debug - StudentLiveSession liveSessions length:", liveSessions?.length);
    console.log("Debug - StudentLiveSession liveSessionsLoading:", liveSessionsLoading);
    console.log("Debug - StudentLiveSession liveSessionsError:", liveSessionsError);
  }, [liveSessions, liveSessionsLoading, liveSessionsError]);



  useEffect(() => {
    if (liveSessionsError) {
      setApiError(liveSessionsError);
    } else {
      setApiError(null);
    }
  }, [liveSessionsError]);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { formattedDate, formattedTime };
  };

  const isSessionPast = (sessionTime) => {
    const now = new Date();
    const sessionDate = new Date(sessionTime);
    return sessionDate < now;
  };

  const getStatusBadge = (session) => {
    if (session.status === 'cancelled') {
      return <span className="badge bg-danger">Cancelled</span>;
    } else if (session.status === 'completed') {
      return <span className="badge bg-success">Completed</span>;
    } else if (session.status === 'ongoing') {
      return <span className="badge bg-warning">Live Now</span>;
    } else if (isSessionPast(session.start_time)) {
      return <span className="badge bg-secondary">Past</span>;
    } else {
      return <span className="badge bg-primary">Scheduled</span>;
    }
  };

  const isSessionJoinable = (session) => {
    // Session is joinable if it's scheduled or ongoing
    if (session.status === 'completed' || session.status === 'cancelled') {
      return false;
    }

    // For ongoing meetings, always allow joining regardless of start time
    if (session.status === 'ongoing') {
      return true;
    }

    // For scheduled meetings, only allow joining if not in the past
    if (session.status === 'scheduled') {
      return !isSessionPast(session.start_time);
    }

    return false;
  };

  const getSubscriptionStatus = (session) => {
    // Check if the session's batch requires subscription
    if (session.batch_id?.subscription_enabled) {
      // If subscription is required, check if student has active subscription
      if (session.batch_id?.has_active_subscription) {
        return 'subscribed';
      } else {
        return 'subscription_required';
      }
    }
    return 'no_subscription_required';
  };

  const canAccessSession = (session) => {
    const subscriptionStatus = getSubscriptionStatus(session);
    return subscriptionStatus === 'subscribed' || subscriptionStatus === 'no_subscription_required';
  };

  // Filter live sessions based on search and status
  const filteredLiveSessions = liveSessions.filter(session => {
    const matchesSearch = session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.batch_id?.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.batch_id?.course_id?.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort sessions by date (newest first)
  const sortedSessions = filteredLiveSessions.sort((a, b) => {
    const aDate = new Date(a.start_time);
    const bDate = new Date(b.start_time);
    return bDate - aDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = sortedSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const handleJoinSession = (session) => {
    if (session.dyte_meeting_id) {
      navigate(`/meeting/${session.dyte_meeting_id}`);
    } else if (session.join_url) {
      // Fallback if ID is missing but URL exists (unlikely given backend)
      window.open(session.join_url, '_blank');
    } else {
      toast.error('Join URL not available for this session');
    }
  };

  const handleSubscriptionRequired = (session) => {
    const subscriptionPrice = session.batch_id?.subscription_price || 'N/A';
    toast.error(`Subscription required! This batch costs ₹${subscriptionPrice}/month. Please subscribe to access live sessions.`);
  };

  const handleViewDetails = (session) => {
    // TODO: Implement view details modal
    console.log('View details for session:', session);
    toast.info('Session details will be shown here');
  };

  const handleRetrySessions = () => {
    setApiError(null);
    dispatch(fetchStudentLiveSessions());
  };

  if (liveSessionsLoading) {
    return (
      <div className="container-wrapper-scroll">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container-wrapper-scroll">
      {/* Search and Filters Section */}
      <section className="container-fluid">
        <div className="row">
          <div className="col-12">
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
                    placeholder="Search sessions by topic, batch, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm('')}
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-end align-items-center">
                  <span className="text-muted">
                    {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i>
                    <span className="text-danger fw-medium">{apiError}</span>
                  </div>
                  <button
                    onClick={handleRetrySessions}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <i className="fa-solid fa-arrows-rotate me-1"></i>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Live Sessions Table */}
            <div className="table-responsive table-styles mt-4" style={{ overflowX: 'auto', minWidth: '100%' }}>
              <table className="table table-striped table-hover" style={{ minWidth: '800px' }}>
                <thead className="table-dark">
                  <tr>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '50px' }}>#</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '200px' }}>Session</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '150px' }}>Batch & Course</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '120px' }}>Date & Time</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '100px' }}>Duration</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '100px' }}>Status</th>
                    <th scope="col" className="text-nowrap text-center" style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSessions.length > 0 ? (
                    currentSessions.map((session, index) => {
                      const { formattedDate, formattedTime } = formatDateTime(session.start_time);
                      return (
                        <tr key={session._id}>
                          <th scope="row" className="text-nowrap text-center">{indexOfFirstItem + index + 1}</th>
                          <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>
                            <div className="d-flex flex-column align-items-start justify-content-center" style={{ minWidth: '200px' }}>
                              <div className="d-flex align-items-center justify-content-start mb-1 w-100">
                                <FaVideo className="text-primary me-2" style={{ minWidth: '16px', flexShrink: 0 }} />
                                <span className="fw-medium text-start" style={{ flex: 1, lineHeight: '1.2' }}>
                                  {session.topic || 'Untitled Session'}
                                </span>
                              </div>
                              {session.agenda && (
                                <div className="small text-muted text-start ms-4" style={{
                                  maxWidth: '160px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  lineHeight: '1.2'
                                }}>
                                  {session.agenda}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>
                            <div className="d-flex flex-column align-items-start justify-content-center" style={{ minWidth: '150px' }}>
                              <span className="fw-medium text-start" style={{ lineHeight: '1.2' }}>
                                {session.batch_id?.batch_name || 'Unknown Batch'}
                              </span>
                              <div className="small text-muted text-start mt-1" style={{ lineHeight: '1.2' }}>
                                {session.batch_id?.course_id?.course_title || 'Unknown Course'}
                              </div>
                              {(() => {
                                const subscriptionStatus = getSubscriptionStatus(session);
                                if (subscriptionStatus === 'subscription_required') {
                                  return (
                                    <div className="mt-1">
                                      <span className="badge bg-warning text-dark small">
                                        <i className="fa-solid fa-lock me-1"></i>
                                        Subscription Required
                                      </span>
                                    </div>
                                  );
                                } else if (subscriptionStatus === 'subscribed') {
                                  return (
                                    <div className="mt-1">
                                      <span className="badge bg-success small">
                                        <i className="fa-solid fa-check me-1"></i>
                                        Subscribed
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </td>
                          <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>
                            <div className="d-flex flex-column align-items-start justify-content-center" style={{ minWidth: '120px' }}>
                              <div className="fw-medium text-start" style={{ lineHeight: '1.2' }}>
                                {formattedDate}
                              </div>
                              <small className="text-muted text-start" style={{ lineHeight: '1.2' }}>
                                {formattedTime}
                              </small>
                            </div>
                          </td>
                          <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>
                            <div className="text-start">
                              {session.duration && session.duration > 0 ? `${session.duration} minutes` : 'N/A'}
                            </div>
                          </td>
                          <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>
                            <div className="text-start">
                              {getStatusBadge(session)}
                            </div>
                          </td>
                          <td className="text-nowrap text-center">
                            {(() => {
                              const subscriptionStatus = getSubscriptionStatus(session);
                              const isJoinable = isSessionJoinable(session);
                              const canAccess = canAccessSession(session);

                              if (!canAccess) {
                                return (
                                  <div className="d-flex flex-column align-items-center">
                                    <button
                                      className="btn btn-sm btn-warning mb-1"
                                      onClick={() => handleSubscriptionRequired(session)}
                                      title="Click to see subscription details"
                                    >
                                      <i className="fa-solid fa-lock me-1"></i>
                                      Subscription Required
                                    </button>
                                    <small className="text-muted">
                                      ₹{session.batch_id?.subscription_price || 'N/A'}/month
                                    </small>
                                  </div>
                                );
                              }

                              if (isJoinable) {
                                return (
                                  <div className="btn-group" role="group">
                                    {session.status === 'ongoing' && session.join_url && (
                                      <button
                                        className="btn btn-sm btn-success me-1"
                                        onClick={() => handleJoinSession(session)}
                                        title="Join Live Session"
                                      >
                                        <i className="fa-solid fa-play"></i> Join
                                      </button>
                                    )}
                                    {session.status === 'scheduled' && session.join_url && (
                                      <button
                                        className="btn btn-sm btn-primary me-1"
                                        onClick={() => handleJoinSession(session)}
                                        title="Join Session"
                                      >
                                        <i className="fa-solid fa-sign-in-alt"></i> Join
                                      </button>
                                    )}
                                  </div>
                                );
                              } else {
                                return (
                                  <span className="text-muted small">
                                    <i className="fa-solid fa-clock me-1"></i>
                                    Meeting Expired
                                  </span>
                                );
                              }
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm || filterStatus !== 'all' ? (
                          <div>
                            <i className="fa-solid fa-search fa-2x text-muted mb-2"></i>
                            <p className="text-muted">No sessions found matching your criteria</p>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={clearFilters}
                            >
                              Clear filters
                            </button>
                          </div>
                        ) : (
                          <div>
                            <i className="fa-solid fa-video fa-2x text-muted mb-2"></i>
                            <p className="text-muted">No live sessions found</p>
                            <p className="text-muted small">
                              You don't have any live sessions scheduled for your enrolled batches.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="row mt-4">
                <div className="col-12">
                  <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default StudentLiveSession;
