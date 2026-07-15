const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If Resend API Key is provided, use HTTPS API (never blocked by Render)
  if (process.env.RESEND_API_KEY) {
    const axios = require('axios');
    try {
      await axios.post('https://api.resend.com/emails', {
        from: `${process.env.FROM_NAME || 'FluidHR'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: [options.email],
        subject: options.subject,
        text: options.message,
        html: options.html
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return;
    } catch (err) {
      console.error("🔥 Resend API Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  // Use Ethereal for testing if no actual SMTP is provided
  let transporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      connectionTimeout: 10000, // 10 seconds
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Generate test account for ethereal if not configured
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'FluidHR'} <${process.env.FROM_EMAIL || 'noreply@fluidhr.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  if (!process.env.SMTP_HOST) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
