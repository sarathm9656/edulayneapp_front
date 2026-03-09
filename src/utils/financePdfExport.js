import moment from 'moment';

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatHours = (value) => `${Number(value || 0).toFixed(2)} hrs`;
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
}).format(Number(value || 0));

const getLogDurationMinutes = (row) => {
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

const buildRows = (rows, emptyMessage) => {
    if (!rows.length) {
        return `<tr><td colspan="20" class="empty">${escapeHtml(emptyMessage)}</td></tr>`;
    }

    return rows.join('');
};

export const exportTenantFinanceReport = ({
    month,
    year,
    summary,
    instructors,
    batchBreakdown,
    logs,
    totalInstructorPayout
}) => {
    const reportMonth = moment([year, month - 1]).format('MMMM YYYY');
    const generatedAt = moment().format('DD MMM YYYY, hh:mm A');

    const summaryRows = [
        ['Actual Performance', formatHours(summary?.totalHours)],
        ['Planned Capacity', formatHours(summary?.plannedHours)],
        ['Total Classes', Number(summary?.totalClasses || 0)],
        ['Planned Classes', Number(summary?.plannedClasses || 0)],
        ['Teaching Force', Number(summary?.instructorCount || 0)],
        ['Instructor Payments', formatCurrency(totalInstructorPayout)],
        ['Efficiency Delta', formatHours(summary?.varianceHours)]
    ].map(([label, value]) => `
        <tr>
            <td>${escapeHtml(label)}</td>
            <td>${escapeHtml(value)}</td>
        </tr>
    `).join('');

    const instructorRows = buildRows(
        (instructors || []).map((inst, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(inst?.instructorName || 'N/A')}</td>
                <td>${escapeHtml(inst?.instructorEmail || 'N/A')}</td>
                <td>${escapeHtml(inst?.salaryType || 'N/A')}</td>
                <td>${Number(inst?.batches?.length || inst?.totalBatches || 0)}</td>
                <td>${formatHours(inst?.totalAllocatedHours)}</td>
                <td>${formatHours(inst?.totalConductedHours)}</td>
                <td>${Number(inst?.totalClasses || 0)}</td>
                <td>${formatCurrency(inst?.calculatedPayout || 0)}</td>
                <td>${escapeHtml(inst?.paymentStatus || 'pending')}</td>
            </tr>
        `),
        'No instructor finance data available.'
    );

    const batchRows = buildRows(
        (batchBreakdown || []).map((batch, index) => {
            const actualHours = Number(batch?.totalHours || batch?.hours || 0);
            const plannedHours = Number(batch?.plannedHours || 0);
            const actualClasses = Number(batch?.classes || batch?.totalClasses || 0);
            const plannedClasses = Number(batch?.plannedSessions || batch?.plannedClasses || 0);
            const variance = Number(batch?.varianceHours ?? (actualHours - plannedHours));

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(batch?.batchName || 'N/A')}</td>
                    <td>${actualClasses}</td>
                    <td>${plannedClasses}</td>
                    <td>${actualHours.toFixed(2)} hrs</td>
                    <td>${plannedHours.toFixed(2)} hrs</td>
                    <td>${variance.toFixed(2)} hrs</td>
                </tr>
            `;
        }),
        'No batch analytics available.'
    );

    const logRows = buildRows(
        (logs || []).map((row, index) => {
            const durationMinutes = getLogDurationMinutes(row);
            const instructorName = [
                row?.instructor_id?.user_id?.fname || row?.instructor_id?.fname || '',
                row?.instructor_id?.user_id?.lname || row?.instructor_id?.lname || ''
            ].join(' ').trim() || 'N/A';

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(moment(row?.actual_start_time || row?.scheduled_start_time || row?.created_at).format('DD MMM YYYY'))}</td>
                    <td>${escapeHtml(row?.dyte_meeting_id || 'N/A')}</td>
                    <td>${escapeHtml(instructorName)}</td>
                    <td>${escapeHtml(row?.batch_id?.batch_name || 'Individual Class')}</td>
                    <td>${escapeHtml(row?.topic || 'General Session')}</td>
                    <td>${escapeHtml(row?.tenant_id?.name || row?.tenant_id?.school_name || 'Generic Tenant')}</td>
                    <td>${escapeHtml(row?.actual_start_time ? moment(row.actual_start_time).format('hh:mm A') : (row?.scheduled_start_time ? moment(row.scheduled_start_time).format('hh:mm A') : 'N/A'))}</td>
                    <td>${escapeHtml(row?.actual_end_time ? moment(row.actual_end_time).format('hh:mm A') : 'Live')}</td>
                    <td>${durationMinutes.toFixed(1)} min</td>
                    <td>${escapeHtml(row?.status || 'pending')}</td>
                </tr>
            `;
        }),
        'No session logs available.'
    );

    const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Finance Report - ${escapeHtml(reportMonth)}</title>
            <style>
                :root {
                    color-scheme: light;
                    --ink: #0f172a;
                    --muted: #475569;
                    --line: #cbd5e1;
                    --soft: #e2e8f0;
                    --panel: #f8fafc;
                    --accent: #1d4ed8;
                }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding: 24px;
                    font-family: Arial, sans-serif;
                    color: var(--ink);
                    background: white;
                }
                h1, h2, h3, p { margin: 0; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .meta {
                    color: var(--muted);
                    font-size: 12px;
                    line-height: 1.6;
                }
                .section {
                    margin-top: 24px;
                }
                .section h2 {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }
                .card {
                    background: var(--panel);
                    border: 1px solid var(--soft);
                    border-radius: 8px;
                    padding: 12px;
                }
                .card-label {
                    color: var(--muted);
                    font-size: 11px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }
                .card-value {
                    font-size: 18px;
                    font-weight: 700;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }
                th, td {
                    border: 1px solid var(--line);
                    padding: 8px;
                    font-size: 11px;
                    vertical-align: top;
                    word-break: break-word;
                }
                th {
                    background: var(--panel);
                    text-align: left;
                }
                .empty {
                    text-align: center;
                    color: var(--muted);
                    padding: 16px;
                }
                .footer {
                    margin-top: 20px;
                    color: var(--muted);
                    font-size: 11px;
                }
                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>Finance Report</h1>
                    <p class="meta">Reporting period: ${escapeHtml(reportMonth)}</p>
                    <p class="meta">Generated: ${escapeHtml(generatedAt)}</p>
                </div>
                <div class="meta">Detailed finance export with summary, instructor payout, batch analytics, and session logs.</div>
            </div>

            <div class="section">
                <h2>Summary</h2>
                <div class="summary-grid">
                    <div class="card">
                        <div class="card-label">Actual Hours</div>
                        <div class="card-value">${escapeHtml(formatHours(summary?.totalHours))}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Planned Hours</div>
                        <div class="card-value">${escapeHtml(formatHours(summary?.plannedHours))}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Instructor Payments</div>
                        <div class="card-value">${escapeHtml(formatCurrency(totalInstructorPayout))}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Variance</div>
                        <div class="card-value">${escapeHtml(formatHours(summary?.varianceHours))}</div>
                    </div>
                </div>
                <table style="margin-top: 12px;">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>${summaryRows}</tbody>
                </table>
            </div>

            <div class="section">
                <h2>Instructor Report</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">#</th>
                            <th>Instructor</th>
                            <th>Email</th>
                            <th>Salary Type</th>
                            <th>Batches</th>
                            <th>Allocated</th>
                            <th>Conducted</th>
                            <th>Classes</th>
                            <th>Payout</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${instructorRows}</tbody>
                </table>
            </div>

            <div class="section">
                <h2>Batch Analytics</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">#</th>
                            <th>Batch</th>
                            <th>Actual Classes</th>
                            <th>Planned Classes</th>
                            <th>Conducted Hours</th>
                            <th>Planned Hours</th>
                            <th>Variance</th>
                        </tr>
                    </thead>
                    <tbody>${batchRows}</tbody>
                </table>
            </div>

            <div class="section">
                <h2>Detailed Session Logs</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">#</th>
                            <th>Date</th>
                            <th>Meeting ID</th>
                            <th>Instructor</th>
                            <th>Batch</th>
                            <th>Topic</th>
                            <th>Tenant</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Duration</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${logRows}</tbody>
                </table>
            </div>

            <div class="footer">
                Use the browser print dialog destination "Save as PDF" to download this report as a PDF file.
            </div>
        </body>
        </html>
    `;

    const existingFrame = document.getElementById('finance-report-print-frame');
    if (existingFrame) {
        existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'finance-report-print-frame';
    iframe.title = 'Finance Report Print Frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    const cleanup = () => {
        window.setTimeout(() => {
            iframe.remove();
        }, 1000);
    };

    iframe.onload = () => {
        const frameWindow = iframe.contentWindow;
        if (!frameWindow) {
            cleanup();
            window.alert('Unable to open the finance report for printing.');
            return;
        }

        frameWindow.focus();
        frameWindow.print();
        cleanup();
    };

    document.body.appendChild(iframe);

    const frameDocument = iframe.contentWindow?.document;
    if (!frameDocument) {
        cleanup();
        window.alert('Unable to prepare the finance report for printing.');
        return;
    }

    frameDocument.open();
    frameDocument.write(reportHtml);
    frameDocument.close();
};
