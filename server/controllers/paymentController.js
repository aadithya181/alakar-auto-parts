const paymentService = require('../services/paymentService');

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    const paymentData = await paymentService.createRazorpayOrder(order_id);
    res.json({
      success: true,
      ...paymentData,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing payment verification credentials' });
    }

    const order = await paymentService.verifyPayment(
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order,
    });
  } catch (err) {
    next(err);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
