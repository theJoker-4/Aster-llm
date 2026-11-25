import { memo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';

function Pre({ children }) {
  const ref = useRef(); const [ok, setOk] = useState(false);
  const lang = children?.props?.className?.match(/language-([\w-]+)/)?.[1] || 'text';
  const copy = async () => { await navigator.clipboard.writeText(ref.current.innerText); setOk(true); setTimeout(() => setOk(false), 1500); };
  return (
    <div className="code-block">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        <span>{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-white/10">{ok ? <Check size={14} /> : <Copy size={14} />}{ok ? 'Copied' : 'Copy code'}</button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}
const components = { pre: Pre, table: (p) => <div className="overflow-x-auto"><table {...p} /></div>, a: (p) => <a target="_blank" rel="noreferrer noopener" {...p} /> };
export default memo(function Markdown({ text }) {
  return <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>{text}</ReactMarkdown></div>;
});
