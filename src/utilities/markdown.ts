import * as marked from 'marked';

const options: MarkedOptions = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
};

export function renderMarkdownToHtml(markdown: string) {
  marked.setOptions({
    ...options,
    renderer: new marked.Renderer()
  });

  return marked(markdown);
}
