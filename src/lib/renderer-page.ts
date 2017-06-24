import { Type } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import { Observable } from 'rxjs/Observable';

import { minifyHtml } from './../utilities/html-minify';

export function renderPage<M>(appServerModule: Type<M>, url: string, document: string) {
  return Observable.of(undefined)
    .mergeMap(() => renderModule(appServerModule, { url, document }))
    .map(html => ({ url, html: minifyHtml(html) }));
}
