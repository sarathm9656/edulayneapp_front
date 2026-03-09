import React from 'react';
import moment from 'moment';

const ParticipantEventsTable = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.3 }}>[ ]</div>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '16px' }}>No participant events found</h3>
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>There is no data available for the current selection.</p>
            </div>
        );
    }

    const thStyle = {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: '700',
        color: '#4b5563',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8fafc'
    };

    const tdStyle = {
        padding: '16px',
        fontSize: '14px',
        color: '#1f2937',
        borderBottom: '1px solid #f1f5f9',
        verticalAlign: 'top'
    };

    const getName = (row) => {
        const u = row?.login_id?.user_id;
        if (u?.fname || u?.lname) return `${u?.fname || ''} ${u?.lname || ''}`.trim();
        return row?.participant_name || 'Unknown';
    };

    const getEmail = (row) => row?.login_id?.email || row?.login_id?.user_id?.email || row?.participant_email || '';

    const getRoleLabel = (row) => {
        const appUserRole = String(
            row?.login_id?.user_id?.role ||
            row?.app_role ||
            ''
        ).trim().toLowerCase();

        if (appUserRole === 'student') return 'Student';
        if (appUserRole === 'instructor') return 'Instructor';
        if (appUserRole === 'tenant') return 'Tenant';
        if (appUserRole === 'superadmin') return 'Super Admin';
        if (appUserRole) return appUserRole.charAt(0).toUpperCase() + appUserRole.slice(1);

        const preset = String(row?.preset_name || '').trim().toLowerCase();
        if (preset.includes('host')) return 'Instructor';
        if (preset.includes('participant')) return 'Student';

        return 'Student';
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {title && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{title}</h3>
                </div>
            )}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Time</th>
                            <th style={thStyle}>Event</th>
                            <th style={thStyle}>Participant</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Batch</th>
                            <th style={thStyle}>Meeting</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => {
                            const when = row?.occurred_at ? moment(row.occurred_at) : null;
                            const eventType = String(row?.event_type || '').toLowerCase();

                            return (
                                <tr
                                    key={row?._id || index}
                                    style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700' }}>{when ? when.format('MMM DD, YYYY') : 'N/A'}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{when ? when.format('h:mm:ss A') : ''}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                                fontWeight: '900',
                                                color: eventType === 'join' ? '#059669' : '#dc2626',
                                                background: eventType === 'join' ? '#ecfdf5' : '#fef2f2',
                                                padding: '3px 10px',
                                                borderRadius: '999px'
                                            }}
                                        >
                                            {eventType || 'event'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700' }}>{getName(row)}</div>
                                        {getEmail(row) ? <div style={{ fontSize: '12px', color: '#6b7280' }}>{getEmail(row)}</div> : null}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5' }}>{getRoleLabel(row)}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600' }}>{row?.batch_id?.batch_name || 'â€”'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                                            {row?.dyte_meeting_id ? String(row.dyte_meeting_id).slice(0, 12) : 'N/A'}
                                        </div>
                                        {row?.dyte_session_id ? (
                                            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                                session: {String(row.dyte_session_id).slice(0, 12)}
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipantEventsTable;
