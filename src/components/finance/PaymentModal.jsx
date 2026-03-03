import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const PaymentModal = ({ isOpen, onClose, instructor, onSave, month, year }) => {
    // Hooks must be called unconditionally
    const [amount, setAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [transactionId, setTransactionId] = useState('');
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('pending');

    useEffect(() => {
        if (instructor) {
            setAmount(instructor.calculatedPayout || (instructor.totalConductedHours * instructor.hourlyRate) || 0);
            setStatus(instructor.paymentStatus !== 'unpaid' && instructor.paymentStatus ? instructor.paymentStatus : 'paid');
        }
    }, [instructor]);

    if (!isOpen || !instructor) return null; // Safe early return for rendering only

    const handleSubmit = async (e) => {
        e.preventDefault();
        const paymentData = {
            instructorId: instructor._id,
            amount: parseFloat(amount),
            paymentMethod,
            transactionId,
            note,
            month: month || new Date().getMonth() + 1,
            year: year || new Date().getFullYear(),
            status
        };
        await onSave(paymentData);
        onClose();
    };

    if (!instructor) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    padding: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999
                }
            }}
        >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Update Payment Status</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Instructor</label>
                    <input type="text" value={instructor.instructorName} disabled style={{ width: '100%', padding: '8px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="processing">Processing</option>
                    </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Payment Method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                        <option value="cash">Cash</option>
                    </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Transaction ID / Ref No.</label>
                    <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required={status === 'paid'}
                        placeholder={status === 'paid' ? 'Required' : 'Optional'}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Note (Optional)</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Update Status</button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentModal;
