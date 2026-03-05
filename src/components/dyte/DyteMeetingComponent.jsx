import React, { useEffect, useMemo, useState } from 'react';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { useDyteMeeting } from '@dytesdk/react-web-core';

export default function DyteMeetingComponent() {
    const { meeting } = useDyteMeeting();
    const [hasJoined, setHasJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [socketState, setSocketState] = useState('');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    useEffect(() => {
        setHasJoined(Boolean(meeting?.self?.roomJoined));
        setIsJoining(false);
        setJoinError('');
    }, [meeting]);

    useEffect(() => {
        if (!meeting) return;

        const setFromMeeting = () => {
            setAudioEnabled(Boolean(meeting?.self?.audioEnabled));
            setVideoEnabled(Boolean(meeting?.self?.videoEnabled));
            setSocketState(String(meeting?.meta?.socketState?.state || ''));
        };

        const socketListener = ({ state }) => setSocketState(String(state || ''));
        const audioListener = ({ audioEnabled: enabled }) => setAudioEnabled(Boolean(enabled));
        const videoListener = ({ videoEnabled: enabled }) => setVideoEnabled(Boolean(enabled));
        const joinedListener = () => setHasJoined(true);

        setFromMeeting();
        meeting.meta?.addListener?.('socketConnectionUpdate', socketListener);
        meeting.self?.addListener?.('audioUpdate', audioListener);
        meeting.self?.addListener?.('videoUpdate', videoListener);
        meeting.self?.addListener?.('roomJoined', joinedListener);

        return () => {
            meeting.meta?.removeListener?.('socketConnectionUpdate', socketListener);
            meeting.self?.removeListener?.('audioUpdate', audioListener);
            meeting.self?.removeListener?.('videoUpdate', videoListener);
            meeting.self?.removeListener?.('roomJoined', joinedListener);
        };
    }, [meeting]);

    const displayName = useMemo(() => {
        const name = String(meeting?.self?.name || '').trim();
        return name || 'Participant';
    }, [meeting]);

    const canJoinNow = Boolean(meeting) && !hasJoined && !isJoining && socketState === 'connected';

    const toggleAudio = async () => {
        if (!meeting?.self) return;
        try {
            if (meeting.self.audioEnabled) {
                await Promise.resolve(meeting.self.disableAudio());
            } else {
                await Promise.resolve(meeting.self.enableAudio());
            }
        } catch (err) {
            console.warn('[DyteMeetingComponent] Failed to toggle audio:', err);
        }
    };

    const toggleVideo = async () => {
        if (!meeting?.self) return;
        try {
            if (meeting.self.videoEnabled) {
                await Promise.resolve(meeting.self.disableVideo());
            } else {
                await Promise.resolve(meeting.self.enableVideo());
            }
        } catch (err) {
            console.warn('[DyteMeetingComponent] Failed to toggle video:', err);
        }
    };

    const joinNow = async () => {
        if (!meeting || hasJoined || isJoining) return;
        setJoinError('');
        setIsJoining(true);
        try {
            await meeting.joinRoom();
            setHasJoined(true);
        } catch (err) {
            setJoinError(err?.message ? String(err.message) : 'Failed to join meeting');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            {!meeting ? (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        color: '#fff',
                    }}
                >
                    Loading Meeting...
                </div>
            ) : !hasJoined ? (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0b0b0b',
                        color: '#fff',
                        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                        padding: '24px',
                    }}
                >
                    <div
                        style={{
                            width: 'min(520px, 100%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '18px',
                        }}
                    >
                        <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '8px' }}>Joining as</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>{displayName}</div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={toggleAudio}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.16)',
                                    background: audioEnabled ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '120px',
                                }}
                            >
                                Mic: {audioEnabled ? 'On' : 'Off'}
                            </button>
                            <button
                                type="button"
                                onClick={toggleVideo}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.16)',
                                    background: videoEnabled ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '120px',
                                }}
                            >
                                Camera: {videoEnabled ? 'On' : 'Off'}
                            </button>
                        </div>

                        <div style={{ fontSize: '12px', opacity: 0.75, marginBottom: '10px' }}>
                            Connection: {socketState || 'connecting'}
                        </div>

                        {joinError ? (
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: '#ff8a80',
                                    marginBottom: '12px',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {joinError}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            onClick={joinNow}
                            disabled={!canJoinNow}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.18)',
                                background: canJoinNow ? '#2563eb' : 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                cursor: canJoinNow ? 'pointer' : 'not-allowed',
                                fontWeight: 700,
                            }}
                        >
                            {isJoining ? 'Joining…' : 'Join Now'}
                        </button>
                    </div>
                </div>
            ) : (
                <DyteMeeting mode="fill" meeting={meeting} showSetupScreen={false} />
            )}
        </div>
    );
}
