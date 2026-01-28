import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
import DyteMeetingComponent from '../../components/dyte/DyteMeetingComponent';

const MeetingRoom = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const authToken = searchParams.get('authToken');
    const role = searchParams.get('role'); // 'tenant', 'instructor', 'student'

    const [meeting, initMeeting] = useDyteClient();
    const [hasEnded, setHasEnded] = useState(false);
    const [countdown, setCountdown] = useState(5);

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

        const handleMeetingEnd = () => {
            setHasEnded(true);
        };

        // Listen for when the user leaves the room
        meeting.self.on('roomLeft', handleMeetingEnd);

        // Listen for disconnection (e.g. kicked, network issue, or meeting ended by host)
        // Note: Different SDK versions might use different events, checking generic disconnect
        // For strict "End Meeting for All", participants usually get 'kicked' or update in room state.
        // We'll rely on roomLeft which UI Kit triggers on "Leave".

        // Also listen to room state updates if needed, but roomLeft is standard for UI actions.

        return () => {
            meeting.self.removeListener('roomLeft', handleMeetingEnd);
        };
    }, [meeting]);

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
            if (role === 'instructor') {
                navigate('/instructor/batches');
            } else {
                navigate('/student/batches');
            }
        }
    };

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
