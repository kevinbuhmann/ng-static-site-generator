import { minify, Options } from 'html-minifier';

const options: Options = {
  caseSensitive: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true
};

export function minifyHtml(html: string) {
  return minify(html, options);
}
