import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('API route called. Method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Ensure body is parsed
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, feedback } = body;

    console.log('Request body:', { name, feedback });

    if (!name || !feedback) {
      return res.status(400).json({ error: 'Name and feedback are required' });
    }

    const result = await resend.emails.send({
      from: 'info@kiro.today',
      to: 'info@kiro.today',
      subject: `KIRO Feedback from ${name}`,
      text: `Name: ${name}\n\nFeedback:\n${feedback}`,
    });
    
    console.log('Resend result:', result);
    return res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Error in API handler:', error);
    // Ensure we always return JSON
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
}
