const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
export function exportChat(chat, fmt) {
  const rows = chat.messages.map((m) => ({ who: m.role === 'user' ? 'You' : 'Aster', text: m.content }));
  if (fmt === 'pdf') {
    const w = window.open('', '_blank'); if (!w) return alert('Allow pop-ups to export as PDF, then choose "Save as PDF" in the print dialog.');
    w.document.write(`<html><head><title>${esc(chat.title)}</title><style>body{font:14px/1.6 system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 16px}pre{white-space:pre-wrap;font:inherit;margin:0}h4{margin:20px 0 4px}</style></head><body><h2>${esc(chat.title)}</h2>${rows.map((r) => `<h4>${r.who}</h4><pre>${esc(r.text)}</pre>`).join('')}</body></html>`);
    w.document.close(); w.focus(); w.print(); return;
  }
  const text = fmt === 'md' ? `# ${chat.title}\n\n` + rows.map((r) => `### ${r.who}\n\n${r.text}`).join('\n\n') : rows.map((r) => `${r.who}:\n${r.text}`).join('\n\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = `${chat.title.replace(/[^\w-]+/g, '_').slice(0, 40) || 'chat'}.${fmt === 'md' ? 'md' : 'txt'}`;
  a.click(); URL.revokeObjectURL(a.href);
}
