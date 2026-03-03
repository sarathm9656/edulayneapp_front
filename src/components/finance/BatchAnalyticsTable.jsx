import React from 'react';

const BatchAnalyticsTable = ({ data, periodLabel }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#9ca3af' }}>No batch analytics available for this period.</p>
            </div>
        );
    }

    const thStyle = {
        padding: '16px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #f1f5f9'
    };

    const tdStyle = {
        padding: '16px',
        borderBottom: '1px solid #f8fafc',
        fontSize: '14px'
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Batch Performance</h3>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                    {periodLabel || 'This Month'}
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={thStyle}>Batch</th>
                            <th style={thStyle}>Classes</th>
                            <th style={thStyle}>Conducted (Hr)</th>
                            <th style={thStyle}>Planned (Hr)</th>
                            <th style={thStyle}>Variance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((batch, idx) => {
                            const actualHours = Number(batch.totalHours || 0);
                            const plannedHours = Number(batch.plannedHours || 0);
                            const variance = actualHours - plannedHours;
                            const actualClasses = Number(batch.classes || 0);
                            const plannedClasses = Number(batch.plannedSessions || 0);

                            return (
                                <tr key={idx} style={{ transition: 'background 0.2s' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{batch.batchName}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {batch.batchId?.slice(-6) || 'N/A'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{actualClasses}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{plannedClasses} planned</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '800', color: '#4f46e5' }}>{actualHours.toFixed(2)}h</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '800', color: '#64748b' }}>{plannedHours.toFixed(2)}h</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: '900', color: variance >= 0 ? '#059669' : '#dc2626' }}>
                                            {variance > 0 ? '+' : ''}{variance.toFixed(2)}h
                                        </span>
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

export default BatchAnalyticsTable;
