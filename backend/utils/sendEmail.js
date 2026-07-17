const sendEmail = async (options) => {
  // Make Resend the default provider
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`Sending email to ${options.email} via Resend HTTP API...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${process.env.FROM_NAME || 'FluidHR'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
          to: [options.email],
          subject: options.subject,
          text: options.message,
          html: options.html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }

      console.log(`Email successfully sent to ${options.email} via Resend. ID: ${data.id}`);
      return data;
    } catch (err) {
      console.error("🔥 Resend API Error:", err.message);
      throw new Error(`Resend API Error: ${err.message}`);
    }
  }

  // Local development fallback without Resend API Key
  if (process.env.NODE_ENV === 'development') {
    console.log('\n==================================================');
    console.log('⚠️  LOCAL DEVELOPMENT EMAIL SIMULATION');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('==================================================\n');
    return { simulated: true };
  }

  // If in production and key is missing
  console.error("🔥 Email configuration error: RESEND_API_KEY is missing in production environment.");
  throw new Error("Email provider not configured. Please set RESEND_API_KEY.");
};

module.exports = sendEmail;

