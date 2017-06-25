import { resolve } from 'path';

module.exports = function blogLoader(blogPath: string) {
  this.addContextDependency(resolve(blogPath));
  return '';
};
