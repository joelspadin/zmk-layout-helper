import hljs from 'highlight.js';
import dts from 'highlight.js/lib/languages/dts';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('dts', dts);
hljs.registerLanguage('json', json);

export const highlight = hljs.highlight;
