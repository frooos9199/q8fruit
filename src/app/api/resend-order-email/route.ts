import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const data = await resend.emails.send({
      from: 'orders@q8fruit.com',
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resend API error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
