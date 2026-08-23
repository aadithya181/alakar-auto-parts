const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_torqspares1234';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'torq_sec_991823719827391';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
} catch (err) {
  console.warn('Razorpay instance initialization note:', err.message);
}

// Utility to verify Razorpay signature securely
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

// Utility to verify webhook signature
function verifyWebhookSignature(bodyString, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret || process.env.RAZORPAY_WEBHOOK_SECRET || 'torq_wh_sec_189237918273')
    .update(bodyString)
    .digest('hex');

  return expectedSignature === signature;
}

module.exports = {
  razorpay: razorpayInstance,
  key_id,
  key_secret,
  verifyRazorpaySignature,
  verifyWebhookSignature,
};
