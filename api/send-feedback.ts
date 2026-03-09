import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, feedback } = req.body;

  if (!name || !feedback) {
    return res.status(400).json({ error: 'Name and feedback are required' });
  }

  try {
    const result = await resend.emails.send({
      from: 'info@kiro.today',
      to: 'info@kiro.today',
      subject: `KIRO Feedback from ${name}`,
      text: `Name: ${name}\n\nFeedback:\n${feedback}`,
    });
    
    console.log('Resend result:', result);
    return res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send feedback' 
    });
  }
}
