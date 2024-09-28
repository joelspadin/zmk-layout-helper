import hljs from 'highlight.js';
import dts from 'highlight.js/lib/languages/dts';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('dts', dts);

export const highlight = hljs.highlight;
