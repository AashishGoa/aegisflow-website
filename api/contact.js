module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { business_name, name, phone, email, message } = req.body;

  try {
    if (!process.env.MAKE_WEBHOOK_URL) {
      throw new Error('MAKE_WEBHOOK_URL is not configured in Vercel environment variables.');
    }

    // Forward form data directly to Make.com Webhook
    const webhookResponse = await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        business_name, 
        domain: name, 
        phone, 
        email: email || 'Not provided', 
        message: message || 'System Diagnostic & Audit Requested via Website',
        timestamp: new Date().toISOString()
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error('Failed to trigger automation webhook.');
    }

    return res.status(200).json({ success: true, message: 'Audit request submitted successfully!' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
