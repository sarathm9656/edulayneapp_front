import React from 'react';

const FinanceStatsCard = ({ title, value, icon, color, subtext, trend, size = 'md' }) => {
    const isSmall = size === 'sm';

    const layout = {
        borderRadius: isSmall ? '12px' : '16px',
        padding: isSmall ? '14px' : '18px',
        minWidth: isSmall ? '160px' : '200px',
    };

    const iconBox = {
        width: isSmall ? '40px' : '48px',
        height: isSmall ? '40px' : '48px',
        borderRadius: isSmall ? '10px' : '14px',
        fontSize: isSmall ? '18px' : '22px',
        marginRight: isSmall ? '12px' : '14px',
    };

    const typography = {
        titleSize: isSmall ? '10px' : '11px',
        valueSize: isSmall ? '18px' : '22px',
        subtextSize: isSmall ? '9px' : '10px',
        trendSize: isSmall ? '9px' : '9px',
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: layout.borderRadius,
            padding: layout.padding,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            minWidth: layout.minWidth,
            flex: 1,
            border: '1px solid #f1f5f9',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                width: iconBox.width,
                height: iconBox.height,
                borderRadius: iconBox.borderRadius,
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: iconBox.fontSize,
                marginRight: iconBox.marginRight,
                boxShadow: `0 8px 16px -4px ${color}44`
            }}>
                {icon}
            </div>
            <div style={{ zIndex: 1 }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: typography.titleSize, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</p>
                <h3 style={{ margin: '2px 0', fontSize: typography.valueSize, fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {subtext && <p style={{ margin: 0, color: '#94a3b8', fontSize: typography.subtextSize, fontWeight: '500' }}>{subtext}</p>}
                    {trend && (
                        <span style={{
                            fontSize: typography.trendSize,
                            fontWeight: '700',
                            color: trend.includes('+') || trend.includes('Optimized') ? '#10b981' : '#f43f5e',
                            background: trend.includes('+') || trend.includes('Optimized') ? '#ecfdf5' : '#fff1f2',
                            padding: '2px 6px',
                            borderRadius: '10px'
                        }}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: isSmall ? '44px' : '52px',
                height: isSmall ? '44px' : '52px',
                borderRadius: '50%',
                background: `${color}08`,
                zIndex: 0
            }}></div>
        </div>
    );
};

export default FinanceStatsCard;
