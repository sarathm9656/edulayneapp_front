import React from 'react';

const FinanceFilters = ({ month, year, onMonthChange, onYearChange }) => {
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <select
                value={month}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '150px'
                }}
            >
                {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                ))}
            </select>

            <select
                value={year}
                onChange={(e) => onYearChange(Number(e.target.value))}
                style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
};

export default FinanceFilters;
