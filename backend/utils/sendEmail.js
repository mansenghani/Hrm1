const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create reusable transporter object using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'FluidHR'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    console.log(`Sending email to ${options.email} via Gmail SMTP...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("🔥 Gmail SMTP Error:", err.message);
    throw new Error(`Gmail SMTP Error: ${err.message}`);
  }
};

module.exports = sendEmail;

