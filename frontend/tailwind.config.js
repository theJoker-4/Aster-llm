const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { bg: c('bg'), side: c('side'), card: c('card'), line: c('line'), ink: c('ink'), muted: c('muted'), accent: c('accent'), accent2: c('accent2') },
    fontFamily: { sans: ['Figtree', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'ui-monospace', 'monospace'] },
  } },
};
