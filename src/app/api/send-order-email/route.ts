import { NextResponse } from 'next/server';

function getBrevoSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Q8 Fruit',
    email: process.env.BREVO_SENDER_EMAIL || 'orders@q8fruit.com',
  };
}

async function readBrevoError(response: Response) {
  try {
    return await response.json();
  } catch {
    return { message: await response.text() };
  }
}

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();
  const apiKey = process.env.BREVO_API_KEY;
  const sender = getBrevoSender();

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

  const data = res.ok ? await res.json() : await readBrevoError(res);
  if (res.ok) return NextResponse.json({ success: true, data });
  return NextResponse.json({ error: data, sender }, { status: 502 });
}
