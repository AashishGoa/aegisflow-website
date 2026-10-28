const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // 1. Only allow POST requests from your website form
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, business_name, message } = req.body;

  try {
    // 2. Configure Zoho SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.in', // Use smtppro.zoho.com if your Zoho account is global
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'admin@aegisflow.co.in', // Your professional Zoho email
        pass: process.env.ZOHO_PASSWORD, // We will store this securely in Vercel environment variables
      },
    });

    // 3. Email options sent to your Zoho admin inbox
    const mailOptions = {
      from: '"AegisFlow Website" <admin@aegisflow.co.in>',
      to: 'admin@aegisflow.co.in', // Lands straight in your Zoho inbox
      subject: `New Lead: ${business_name || 'Website Inquiry'}`,
      html: `
        <h3>New Inquiry from AegisFlow Website</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Business:</strong> ${business_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Send the email via Zoho
    await transporter.sendMail(mailOptions);

    // 4. (Optional) Forward data to your Make.com Custom Webhook to trigger sheets/auto-responders
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, business_name, message }),
      });
    }

    return res.status(200).json({ success: true, message: 'Inquiry sent successfully!' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return res.status(500).json({ error: 'Internal server error. Failed to send message.' });
  }
}
