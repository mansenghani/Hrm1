const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use custom SMTP settings (defaulting to Brevo SMTP on port 2525 to bypass Render port blocks)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    secure: false, // false for port 2525 / 587
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
    console.log(`Sending email to ${options.email} via SMTP (${transporter.options.host}:${transporter.options.port})...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("🔥 SMTP Error:", err.message);
    throw new Error(`SMTP Error: ${err.message}`);
  }
};

module.exports = sendEmail;

