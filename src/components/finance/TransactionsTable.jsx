import React from 'react';
import moment from 'moment';

const TransactionsTable = ({ title, data, type = 'log' }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
                No data available for the selected period.
            </div>
        );
    }

    const thStyle = {
        padding: '16px',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
    };

    const tdStyle = {
        padding: '16px',
        fontSize: '14px',
        color: '#374151',
        borderBottom: '1px solid #f3f4f6'
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            {title && <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>{title}</div>}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        {type === 'log' ? (
                            <tr>
                                <th style={thStyle}>Date & Time</th>
                                <th style={thStyle}>Batch / Topic</th>
                                <th style={thStyle}>Duration</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        ) : (
                            // Instructor Summary Type
                            <tr>
                                <th style={thStyle}>Instructor</th>
                                <th style={thStyle}>Classes</th>
                                <th style={thStyle}>Total Hours</th>
                                <th style={thStyle}>Active Batches</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} style={{ background: 'white' }}>
                                {type === 'log' ? (
                                    <>
                                        <td style={tdStyle}>
                                            <div>{moment(row.actual_start_time || row.date).format('MMM Do, YYYY')}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{moment(row.actual_start_time || row.date).format('h:mm A')}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '500' }}>{row.topic || row.batch_name || 'Class Session'}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {row.dyte_meeting_id?.slice(0, 8)}...</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                background: '#eff6ff',
                                                color: '#1d4ed8',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {row.duration_minutes} mins
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#059669', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '500' }}>{row.instructorName}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{row.instructorEmail}</div>
                                        </td>
                                        <td style={tdStyle}>{row.totalClasses}</td>
                                        <td style={tdStyle}>{row.totalHours} hrs</td>
                                        <td style={tdStyle}>{row.activeBatches}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsTable;
