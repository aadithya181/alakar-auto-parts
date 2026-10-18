const { razorpay, key_id, verifyRazorpaySignature, verifyWebhookSignature } = require('../config/razorpay');
const orderService = require('./orderService');
const db = require('../config/db');

class PaymentService {
  /**
   * Create Razorpay order from validated pending order
   */
  async createRazorpayOrder(orderId) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new Error('Order not found');

    const amountInPaise = Math.round(order.total_amount * 100);

    if (!razorpay) {
      throw new Error('Razorpay gateway is not configured on the server.');
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        user_id: order.user_id || 'guest',
      },
    };

    const rzpOrder = await razorpay.orders.create(options);
    const razorpayOrderId = rzpOrder.id;

    // Save Razorpay order ID to our internal order
    db.prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ?').run(razorpayOrderId, orderId);

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: razorpayOrderId,
      amount: order.total_amount,
      amountInPaise: amountInPaise,
      currency: 'INR',
      keyId: key_id,
    };
  }

  /**
   * Verify cryptographic signature and finalize order
   */
  async verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Missing payment verification parameters');
    }

    // Cryptographic verification via HMAC SHA-256
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      // Mark payment failed in database
      db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(orderId);
      throw new Error('Payment signature verification failed: Transaction not authorized by bank');
    }

    // Finalize order (payment_status = paid, order_status = confirmed)
    const confirmedOrder = orderService.completeOrder(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    return confirmedOrder;
  }

  /**
   * Confirm Cash on Delivery order
   */
  async confirmCodOrder(orderId) {
    return orderService.confirmCodOrder(orderId);
  }

  /**
   * Webhook processing
   */
  async handleWebhook(payload, signature) {
    const isWebhookValid = verifyWebhookSignature(JSON.stringify(payload), signature);
    if (!isWebhookValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = payload.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const rzpPayment = payload.payload.payment.entity;
      const rzpOrderId = rzpPayment.order_id;
      const order = db.prepare('SELECT id FROM orders WHERE razorpay_order_id = ?').get(rzpOrderId);
      if (order) {
        orderService.completeOrder(order.id, rzpOrderId, rzpPayment.id, 'webhook_verified');
      }
    }
    return { status: 'processed' };
  }
}

module.exports = new PaymentService();
