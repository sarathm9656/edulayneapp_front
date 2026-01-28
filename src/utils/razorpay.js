// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ROAnEfLD2zHbeG'; // Replace with your actual key

// Open Razorpay payment modal
export const openRazorpayPayment = (paymentOptions, onSuccess, onError) => {
  // Check if Razorpay is loaded
  if (typeof window.Razorpay === 'undefined') {
    console.error('Razorpay SDK not loaded');
    onError('Payment gateway not available');
    return;
  }

  const options = {
    ...paymentOptions,
    handler: function (response) {
      console.log('Payment successful:', response);
      onSuccess(response);
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled');
        onError('Payment cancelled by user');
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

export default { openRazorpayPayment };
