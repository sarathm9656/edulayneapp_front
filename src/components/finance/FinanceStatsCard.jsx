import React from 'react';

const FinanceStatsCard = ({ title, value, icon, color, subtext }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            minWidth: '240px',
            flex: 1
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: color || '#e0e7ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '20px'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{title}</p>
                <h3 style={{ margin: '4px 0', fontSize: '24px', fontWeight: 700, color: '#111827' }}>{value}</h3>
                {subtext && <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>{subtext}</p>}
            </div>
        </div>
    );
};

export default FinanceStatsCard;
