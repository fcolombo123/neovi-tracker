const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

export async function draftEmail({ note, owner, ownerEmail, projectName, projectType }) {
  if (!ANTHROPIC_KEY) throw new Error('Anthropic API key not configured');

  const prompt = `You are a project manager at Neovi, a prefab home construction company. Draft a short, professional email about this action item.

Project: ${projectName} (${projectType})
Action item: ${note}
Recipient: ${owner || 'Team member'}

Write a concise email (3-5 sentences) that:
- Has a clear subject line
- States what's needed
- Is friendly but direct
- Signs off as the Neovi PM team

Respond in this exact JSON format:
{"subject": "...", "body": "..."}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('AI request failed: ' + err);
  }

  const data = await response.json();
  let text = data.content[0].text.trim();

  // Strip markdown code fences if present
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    // If JSON parsing fails, use raw text
    return { subject: `${projectName} — Action needed`, body: text };
  }
}
