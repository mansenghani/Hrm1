const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use explicit host and port 587 (STARTTLS) to bypass Render's port 465 block
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false for port 587
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
    console.log(`Sending email to ${options.email} via Gmail SMTP (Port 587)...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("🔥 Gmail SMTP Error:", err.message);
    throw new Error(`Gmail SMTP Error: ${err.message}`);
  }
};

module.exports = sendEmail;

