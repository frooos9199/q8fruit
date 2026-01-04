import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();
  const apiKey = process.env.BREVO_API_KEY;
  const sender = { name: 'Q8 Fruit', email: 'orders@q8fruit.com' };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey!,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await res.json();
  if (res.ok) return NextResponse.json({ success: true, data });
  return NextResponse.json({ error: data }, { status: 500 });
}
