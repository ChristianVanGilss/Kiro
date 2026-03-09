import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS preflight successful' });
  }

  console.log('API route called. Method:', req.method);
  
  // 3. Reject non-POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // 4. Safely parse the body
    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse JSON body:', e);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    // Ensure body is an object
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const { name, feedback } = body;
    console.log('Parsed request body:', { name, feedback });

    if (!name || !feedback) {
      return res.status(400).json({ error: 'Name and feedback are required' });
    }

    // 5. Check for API key and instantiate Resend inside the handler
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing from environment variables');
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const resend = new Resend(apiKey);

    // 6. Send the email
    const result = await resend.emails.send({
      from: 'info@kiro.today',
      to: 'info@kiro.today',
      subject: `KIRO Feedback from ${name}`,
      text: `Name: ${name}\n\nFeedback:\n${feedback}`,
    });
    
    console.log('Resend result:', result);

    // Check if Resend returned an error
    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(500).json({ error: result.error.message || 'Failed to send feedback via Resend' });
    }

    return res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Unhandled error in API handler:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}
