const nodemailer = require('nodemailer');

// Create reusable transporter
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
};

const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'New Alagar Auto Parts';
  const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@alagarautoparts.com';
  return `"${fromName}" <${fromEmail}>`;
};

/**
 * Send Account Registration / Welcome Acknowledgment Email
 */
const sendRegistrationAckEmail = async ({ email, name }) => {
  const recipientName = name || 'Valued Customer';
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
          .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .info-box { background: #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .info-row { font-size: 13px; margin-bottom: 8px; color: #334155; }
          .info-row:last-child { margin-bottom: 0; }
          .info-row strong { color: #0f172a; }
          .button { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 10px; margin-top: 8px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEW ALAGAR AUTO PARTS</h1>
            <p>100% Genuine Spare Parts • Pudukkottai</p>
          </div>
          <div class="content">
            <span class="badge">Registration Confirmed</span>
            <div class="greeting">Welcome to New Alagar Auto Parts, ${recipientName}!</div>
            <p class="message">
              Thank you for registering your account with us. Your account is now active and ready to explore thousands of guaranteed genuine automobile parts for your bike, car, and commercial vehicles.
            </p>
            <div class="info-box">
              <div class="info-row"><strong>Account Email:</strong> ${email}</div>
              <div class="info-row"><strong>Registered On:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
              <div class="info-row"><strong>Store Helpline:</strong> +91 85266 13000</div>
              <div class="info-row"><strong>Store Address:</strong> West Main Street, Old GH Road, Pudukkottai</div>
            </div>
            <p class="message">
              You can now browse precision components, check vehicle fitment compatibility, and order directly for store pickup or express dispatch.
            </p>
            <div style="text-align: center;">
              <a href="https://alagarautoparts.com/products" class="button">Explore Auto Parts Catalog</a>
            </div>
          </div>
          <div class="footer">
            <p>Need assistance? Call or WhatsApp our specialists at <strong>+91 85266 13000</strong></p>
            <p>&copy; ${new Date().getFullYear()} New Alagar Auto Parts, Pudukkottai. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log('\n[Email Service - Simulated Mode]');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to New Alagar Auto Parts - Account Acknowledgment`);
    console.log(`Message: Account created for ${recipientName} (${email}) at ${new Date().toISOString()}`);
    console.log('[Note: Add SMTP_USER and SMTP_PASS in server/.env to send real inbox emails]\n');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Account Registration Confirmed - New Alagar Auto Parts',
      html: htmlContent,
      text: `Welcome to New Alagar Auto Parts, ${recipientName}! Your account (${email}) has been successfully registered. Store helpline: +91 85266 13000.`,
    });
    console.log(`[Email Service] Registration acknowledgment sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Login / Sign-In Acknowledgment Email
 */
const sendLoginAckEmail = async ({ email, name }) => {
  const recipientName = name || 'Customer';
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; }
          .content { padding: 28px 24px; }
          .badge { display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 14px; text-transform: uppercase; }
          .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
          .message { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .info-box { background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 13px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEW ALAGAR AUTO PARTS</h1>
          </div>
          <div class="content">
            <span class="badge">Security Notice</span>
            <div class="greeting">Hello ${recipientName},</div>
            <p class="message">
              This is an acknowledgment that your account was just signed into on New Alagar Auto Parts.
            </p>
            <div class="info-box">
              <div><strong>Account:</strong> ${email}</div>
              <div><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            </div>
            <p class="message" style="font-size: 12px; color: #64748b;">
              If this was you, you can safely ignore this email. If you did not sign in, please contact our helpline at +91 85266 13000 immediately.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} New Alagar Auto Parts, Pudukkottai.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service - Simulated Mode] Login acknowledgment triggered for ${email} at ${new Date().toISOString()}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Security Alert: Sign-In to New Alagar Auto Parts',
      html: htmlContent,
      text: `Hello ${recipientName}, your account (${email}) was just signed into at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}. If this wasn't you, call +91 85266 13000.`,
    });
    console.log(`[Email Service] Login alert sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send login email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Order Placement / Confirmation Acknowledgment Email
 */
const sendOrderConfirmationEmail = async ({ email, name, order }) => {
  const recipientName = name || 'Valued Customer';
  const transporter = getTransporter();

  const orderNum = order.order_number || order.orderNumber || order.id;
  const totalAmount = Number(order.total_amount || order.total || 0).toLocaleString('en-IN');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; text-transform: uppercase; }
          .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .info-box { background: #f8fafc; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .info-row { font-size: 13px; margin-bottom: 8px; color: #334155; }
          .button { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 10px; margin-top: 8px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ORDER CONFIRMED</h1>
            <p>New Alagar Auto Parts • Pudukkottai</p>
          </div>
          <div class="content">
            <span class="badge">Payment Verified</span>
            <div class="greeting">Thank you for your order, ${recipientName}!</div>
            <p class="message">
              We have received your order <strong>#${orderNum}</strong>. Your genuine automotive spare parts are being prepared for dispatch from our Pudukkottai store.
            </p>
            <div class="info-box">
              <div class="info-row"><strong>Order ID:</strong> #${orderNum}</div>
              <div class="info-row"><strong>Total Paid:</strong> ₹${totalAmount}</div>
              <div class="info-row"><strong>Status:</strong> Confirmed & Processing</div>
              <div class="info-row"><strong>Dispatch Location:</strong> West Main Street, Pudukkottai</div>
            </div>
            <div style="text-align: center;">
              <a href="https://alagarautoparts.com/orders/${order.id}" class="button">Track Order Live</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Call / WhatsApp our store specialist at <strong>+91 85266 13000</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service - Simulated Mode] Order confirmation triggered for ${email} (Order #${orderNum})`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: `Order Confirmed #${orderNum} - New Alagar Auto Parts`,
      html: htmlContent,
      text: `Thank you for your order #${orderNum}! Total: ₹${totalAmount}. We are preparing your order at New Alagar Auto Parts. Call: +91 85266 13000.`,
    });
    console.log(`[Email Service] Order confirmation email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send order email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationAckEmail,
  sendLoginAckEmail,
  sendOrderConfirmationEmail,
};
