import React from 'react';
import moment from 'moment';

const TransactionsTable = ({ title, data, type = 'log' }) => {
    const getDurationMinutes = (row) => {
        const directMinutes = Number(row?.duration_minutes);
        if (Number.isFinite(directMinutes) && directMinutes > 0) {
            return directMinutes;
        }

        const seconds = Number(row?.duration_seconds);
        if (Number.isFinite(seconds) && seconds > 0) {
            return seconds / 60;
        }

        return 0;
    };

    if (!data || data.length === 0) {
        return (
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.3 }}>[ ]</div>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '16px' }}>No records found</h3>
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
        borderBottom: '1px solid #f1f5f9'
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {title && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{title}</h3>
                </div>
            )}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        {type === 'log' ? (
                            <tr>
                                <th style={thStyle}>Date & Meeting</th>
                                <th style={thStyle}>Instructor</th>
                                <th style={thStyle}>Batch / Topic</th>
                                <th style={thStyle}>Tenant / School</th>
                                <th style={thStyle}>Session Time</th>
                                <th style={thStyle}>Conducted Time</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        ) : (
                            <tr>
                                <th style={thStyle}>Instructor Details</th>
                                <th style={thStyle}>Total Batches</th>
                                <th style={thStyle}>Total Classes</th>
                                <th style={thStyle}>Allocated Hrs</th>
                                <th style={thStyle}>Conducted Time (Hr)</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {data.map((row, index) => {
                            const durationMinutes = getDurationMinutes(row);
                            const durationHours = (durationMinutes / 60).toFixed(1);
                            const status = row.status || 'pending';

                            return (
                                <tr key={index} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    {type === 'log' ? (
                                        <>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>
                                                    {moment(row.actual_start_time || row.scheduled_start_time || row.created_at).format('MMM DD, YYYY')}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', marginTop: '2px' }}>
                                                    Meeting ID: {row.dyte_meeting_id?.slice(0, 10) || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '500' }}>
                                                    {row.instructor_id?.user_id?.fname || row.instructor_id?.fname || 'N/A'} {row.instructor_id?.user_id?.lname || row.instructor_id?.lname || ''}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{row.instructor_id?.email || 'No email'}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600', color: '#4f46e5' }}>{row.batch_id?.batch_name || 'Individual Class'}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.topic || 'General Session'}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600', color: '#374151' }}>{row.tenant_id?.name || row.tenant_id?.school_name || 'Generic Tenant'}</div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Class Location</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '13px' }}>
                                                    <span style={{ color: '#059669', fontWeight: '600' }}>{row.actual_start_time ? moment(row.actual_start_time).format('h:mm A') : (row.scheduled_start_time ? moment(row.scheduled_start_time).format('h:mm A') : 'N/A')}</span>
                                                    <span style={{ margin: '0 4px', color: '#d1d5db' }}>-&gt;</span>
                                                    <span style={{ color: '#dc2626', fontWeight: '600' }}>{row.actual_end_time ? moment(row.actual_end_time).format('h:mm A') : 'Live'}</span>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{
                                                    background: '#f0f9ff',
                                                    color: '#0369a1',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '800',
                                                    display: 'inline-block'
                                                }}>
                                                    {durationMinutes.toFixed(1)}m ({durationHours}h)
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '800',
                                                    color: status === 'completed' ? '#059669' : '#f59e0b',
                                                    background: status === 'completed' ? '#ecfdf5' : '#fffbeb',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {status}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600' }}>{row.instructorName}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.instructorEmail}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '500' }}>{row.totalBatches || 0}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '500' }}>{row.totalClasses || 0}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ color: '#6b7280' }}>{row.totalAllocatedHours || 0} hrs</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '700', color: '#4f46e5' }}>{row.totalHours || 0} hrs</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '99px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    background: row.activeBatches > 0 ? '#dcfce7' : '#f1f5f9',
                                                    color: row.activeBatches > 0 ? '#15803d' : '#64748b'
                                                }}>
                                                    {row.activeBatches > 0 ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsTable;
