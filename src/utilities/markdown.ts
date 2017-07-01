import { highlightAuto } from 'highlight.js';
import * as marked from 'marked';

const options: MarkedOptions = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: (code, lang) => {
    return highlightAuto(code, lang ? [lang] : undefined).value;
  }
};

export function renderMarkdownToHtml(markdown: string) {
  marked.setOptions({
    ...options,
    renderer: new marked.Renderer()
  });

  return marked(markdown);
}
