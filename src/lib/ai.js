const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

export async function draftEmail({ note, owner, ownerEmail, projectName, projectType }) {
  if (!ANTHROPIC_KEY) throw new Error('Anthropic API key not configured');

  const prompt = `Draft a very brief email about this construction project action item.

Project: ${projectName}
Action item: ${note}
To: ${owner || 'Team'}

Rules:
- 1-2 sentences max, no fluff
- Direct and casual-professional (like a quick Slack message but in email form)
- No "I hope this finds you well" or filler
- Short subject line (under 8 words)
- Sign off with just "Thanks," followed by a new line and "Francesca"

Respond as JSON only, no markdown: {"subject": "...", "body": "..."}`;

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
