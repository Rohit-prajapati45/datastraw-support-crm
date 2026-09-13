export async function createTicketSummary(ticket) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('AI summaries are not configured. Add GEMINI_API_KEY to backend/.env.');
    error.statusCode = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = `Write a concise, support-agent-friendly ticket summary in 2-4 bullet points. Do not invent details.

Ticket ${ticket.ticket_id}
Customer: ${ticket.customer_name} (${ticket.customer_email})
Subject: ${ticket.subject}
Description: ${ticket.description}`;

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
      })
    });
  } catch {
    const error = new Error('AI summary service is currently unavailable. Please try again later.');
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error('AI summary could not be generated. Please verify the Gemini configuration and try again.');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const summary = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!summary) {
    const error = new Error('AI summary could not be generated. Please try again.');
    error.statusCode = 502;
    throw error;
  }
  return summary;
}
