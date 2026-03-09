import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
import DyteMeetingComponent from '../../components/dyte/DyteMeetingComponent';
import api from "@/api/axiosInstance";
import moment from 'moment';

const MeetingRoom = () => {
    const autoEndTimeoutMinutes = parseInt(import.meta.env.VITE_MEETING_AUTO_END_TIMEOUT_MINUTES || '5', 10);
    const autoEndTimeoutSeconds = Math.max(1, autoEndTimeoutMinutes * 60);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const authToken = searchParams.get('authToken');
    const role = searchParams.get('role'); // 'tenant', 'instructor', 'student'
    const batchId = searchParams.get('batchId');
    const meetingId = searchParams.get('meetingId');

    const [meeting, initMeeting] = useDyteClient();
    const [hasEnded, setHasEnded] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const endSentRef = useRef(false);
    const hostJoinSentRef = useRef(false);
    const autoEndTimeoutRef = useRef(null);

    // Timing states
    const [batchData, setBatchData] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [showOvertime, setShowOvertime] = useState(false);
    const [autoEndCountdown, setAutoEndCountdown] = useState(autoEndTimeoutSeconds);
    const warningShownRef = useRef(false);
    const overtimeShownRef = useRef(false);

    useEffect(() => {
        if (!authToken) {
            console.error("No auth token provided");
            return;
        }

        initMeeting({
            authToken,
            defaults: {
                audio: true,
                video: true,
            },
        });
    }, [authToken, initMeeting]);

    // Fetch batch info
    useEffect(() => {
        if (batchId && (role === 'instructor' || role === 'tenant' || role === 'superadmin')) {
            const fetchBatch = async () => {
                try {
                    const response = await api.get(`/batch/${batchId}`);
                    if (response.data.success) {
                        setBatchData(response.data.data);
                    }
                } catch (err) {
                    console.error("[MeetingRoom] Failed to fetch batch details:", err);
                }
            };
            fetchBatch();
        }
    }, [batchId, role]);

    // Timer logic for popups
    useEffect(() => {
        if (!batchData || !batchData.end_time || hasEnded) return;

        const warningMinutes = parseInt(import.meta.env.VITE_MEETING_END_WARNING_MINUTES || '10');

        const checkTime = () => {
            const now = moment();
            const [hours, minutes] = batchData.end_time.split(':').map(Number);
            const endTime = moment().set({ hour: hours, minute: minutes, second: 0 });

            // If the calculated endTime is already in the past (e.g., class was at 10 AM and it is 11 AM now)
            // but the batch is for today, we might need to adjust logic, but usually we just compare.
            // If endTime is before now, we just skip warning if not shown.

            const diffMinutes = endTime.diff(now, 'minutes');

            // Warning: Show when diff is exactly warningMinutes (or slightly less to catch the minute)
            if (diffMinutes <= warningMinutes && diffMinutes > 0 && !warningShownRef.current) {
                setShowWarning(true);
                warningShownRef.current = true;
            }

            // Overtime: Show when diff is <= 0
            if (diffMinutes <= 0 && !overtimeShownRef.current) {
                setShowOvertime(true);
                overtimeShownRef.current = true;
                setShowWarning(false); // Hide warning if overtime starts
            }
        };

        const interval = setInterval(checkTime, 10000); // Check every 10 seconds
        checkTime(); // Initial check

        return () => clearInterval(interval);
    }, [batchData, hasEnded]);

    // Handle Meeting Events
    useEffect(() => {
        if (!meeting) return;

        const markHostJoin = async () => {
            const normalizedRole = String(role || '').toLowerCase().trim();
            if (!['instructor', 'tenant', 'superadmin'].includes(normalizedRole)) return;
            if (!meetingId) return;
            if (hostJoinSentRef.current) return;
            hostJoinSentRef.current = true;

            try {
                await api.post('/dyte/host-joined', { meetingId, batchId });
            } catch (err) {
                console.error("[MeetingRoom] Failed to mark host join:", err);
            }
        };

        const markStudentLeave = async () => {
            if (role !== 'student' || !batchId) return;
            try {
                await api.post('/dyte/leave-meeting', { batchId });
            } catch (err) {
                console.error("[MeetingRoom] Failed to close attendance session:", err);
            }
        };

        const endMeetingForHost = async () => {
            const normalizedRole = String(role || '').toLowerCase().trim();
            if (!['instructor', 'tenant', 'superadmin'].includes(normalizedRole)) return;
            if (!meetingId) return;
            if (endSentRef.current) return;
            endSentRef.current = true;

            try {
                await api.patch(`/dyte/end-meeting/${encodeURIComponent(meetingId)}`);
            } catch (err) {
                console.error("[MeetingRoom] Failed to end meeting:", err);
            }
        };

        const handleMeetingEnd = () => {
            markStudentLeave();
            endMeetingForHost();
            setHasEnded(true);
        };

        // Fires after the Dyte setup screen, when the user actually joins the room.
        meeting.self.on('roomJoined', markHostJoin);
        // Listen for when the user leaves the room
        meeting.self.on('roomLeft', handleMeetingEnd);

        return () => {
            meeting.self.removeListener('roomJoined', markHostJoin);
            meeting.self.removeListener('roomLeft', handleMeetingEnd);
        };
    }, [meeting, role, batchId, meetingId]);

    // Handle Redirect Timer
    useEffect(() => {
        if (hasEnded) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleExit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [hasEnded]);

    useEffect(() => {
        if (!showOvertime || hasEnded) {
            setAutoEndCountdown(autoEndTimeoutSeconds);
            if (autoEndTimeoutRef.current) {
                clearInterval(autoEndTimeoutRef.current);
                autoEndTimeoutRef.current = null;
            }
            return;
        }

        setAutoEndCountdown(autoEndTimeoutSeconds);
        autoEndTimeoutRef.current = setInterval(() => {
            setAutoEndCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(autoEndTimeoutRef.current);
                    autoEndTimeoutRef.current = null;
                    handleEndClassAtTime();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (autoEndTimeoutRef.current) {
                clearInterval(autoEndTimeoutRef.current);
                autoEndTimeoutRef.current = null;
            }
        };
    }, [showOvertime, hasEnded, autoEndTimeoutSeconds]);

    const handleExit = () => {
        if (window.opener) {
            window.close();
        } else {
            // Fallback navigation if not opened in a popup
            if (role === 'instructor' || role === 'tenant') {
                navigate('/instructor/batches');
            } else {
                navigate('/student/batches');
            }
        }
    };

    const handleEndClassAtTime = async () => {
        setShowOvertime(false);
        if (meeting) {
            await meeting.leaveRoom();
        } else {
            setHasEnded(true);
        }
    };

    const handleContinueClass = () => {
        setShowOvertime(false);
    };

    const autoEndMinutes = Math.floor(autoEndCountdown / 60);
    const autoEndSeconds = String(autoEndCountdown % 60).padStart(2, '0');

    if (!authToken) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontFamily: 'sans-serif',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#ff5252', marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ marginBottom: '2rem', color: '#ccc', maxWidth: '400px' }}>
                    No authentication token was provided for this meeting. Please try joining the class again from your dashboard.
                </p>
                <button
                    onClick={() => navigate(role === 'instructor' || role === 'tenant' ? '/instructor/batches' : '/student/batches')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#333',
                        color: 'white',
                        border: '1px solid #555',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Return to Batches
                </button>
            </div>
        );
    }

    if (!meeting && !hasEnded) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
                color: '#fff'
            }}>
                Loading Meeting...
            </div>
        );
    }

    if (hasEnded) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontFamily: 'sans-serif'
            }}>
                <h2 style={{ marginBottom: '1rem' }}>Meeting Ended</h2>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    You will be redirected back to batches in <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{countdown}</span> seconds.
                </p>
                <button
                    onClick={handleExit}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#333',
                        color: 'white',
                        border: '1px solid #555',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Return Immediately
                </button>
            </div>
        );
    }

    return (
        <DyteProvider value={meeting}>
            <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <DyteMeetingComponent role={role} />

                {/* Warning Popup */}
                {showWarning && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                <div className="modal-header bg-warning text-dark border-0 py-3">
                                    <h5 className="modal-title fw-bold">
                                        <i className="fa-solid fa-clock-rotate-left me-2"></i> Class Ending Soon
                                    </h5>
                                </div>
                                <div className="modal-body p-4 text-center">
                                    <div className="mb-3">
                                        <i className="fa-solid fa-hourglass-half text-warning fs-1"></i>
                                    </div>
                                    <p className="fs-5 mb-1">Standard class time is almost over.</p>
                                    <p className="text-muted">The next batch will start shortly. Please begin wrapping up your session.</p>
                                </div>
                                <div className="modal-footer border-0 pb-4 px-4 justify-content-center">
                                    <button type="button" className="btn btn-dark px-5 py-2 fw-bold" onClick={() => setShowWarning(false)} style={{ borderRadius: '10px' }}>
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overtime Popup */}
                {showOvertime && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10001 }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                                <div className="modal-header bg-danger text-white border-0 py-3">
                                    <h5 className="modal-title fw-bold">
                                        <i className="fa-solid fa-circle-exclamation me-2"></i> Time Over
                                    </h5>
                                </div>
                                <div className="modal-body p-4 text-center">
                                    <div className="mb-3">
                                        <i className="fa-solid fa-clock text-danger fs-1"></i>
                                    </div>
                                    <p className="fs-5 mb-1">The scheduled class time has ended.</p>
                                    <p className="text-muted">Do you want to continue the session or end it now?</p>
                                    <p className="fw-semibold text-danger mb-0">
                                        If there is no response, the class will end automatically in {autoEndMinutes}:{autoEndSeconds}.
                                    </p>
                                </div>
                                <div className="modal-footer border-0 pb-4 px-4 justify-content-center gap-3">
                                    <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handleContinueClass} style={{ borderRadius: '10px' }}>
                                        Continue Class
                                    </button>
                                    <button type="button" className="btn btn-danger px-4 py-2 fw-bold" onClick={handleEndClassAtTime} style={{ borderRadius: '10px' }}>
                                        End Class Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DyteProvider>
    );
};

export default MeetingRoom;
