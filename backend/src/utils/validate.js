export function validateChat(b) {
  if (!b || !Array.isArray(b.messages) || !b.messages.length || b.messages.length > 200) return { error: 'messages must be a non-empty array.' };
  const messages = [];
  for (const m of b.messages) {
    if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 50000) return { error: 'Invalid message.' };
    const atts = Array.isArray(m.attachments) ? m.attachments.slice(0, 5).filter((a) => a && typeof a.name === 'string') : [];
    messages.push({ role: m.role, content: m.content, attachments: atts });
  }
  if (messages[messages.length - 1].role !== 'user') return { error: 'Last message must come from the user.' };
  const model = typeof b.model === 'string' && /^[\w.:-]{1,64}$/.test(b.model) ? b.model : undefined;
  const instructions = typeof b.instructions === 'string' ? b.instructions.slice(0, 2000) : '';
  return { data: { messages, model, instructions, webSearch: b.webSearch === true } };
}
