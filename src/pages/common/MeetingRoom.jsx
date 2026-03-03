import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
import DyteMeetingComponent from '../../components/dyte/DyteMeetingComponent';
import api from "@/api/axiosInstance";

const MeetingRoom = () => {
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

    // Handle Meeting Events
    useEffect(() => {
        if (!meeting) return;

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

        // Listen for when the user leaves the room
        meeting.self.on('roomLeft', handleMeetingEnd);

        return () => {
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
            <DyteMeetingComponent role={role} />
        </DyteProvider>
    );
};

export default MeetingRoom;
