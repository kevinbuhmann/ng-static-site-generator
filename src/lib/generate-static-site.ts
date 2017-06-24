import { enableProdMode, Provider, ReflectiveInjector, Type } from '@angular/core';
import { readFileSync } from 'fs';
import { join as joinPaths } from 'path';
import { Observable } from 'rxjs/Observable';

import { BlogService, BLOG_PATH } from './../services/blog.service';
import { safeWriteFileSync } from './../utilities/fs.utilities';
import { appServerModuleFactory } from './app-server-module-factory';
import { renderPage } from './renderer-page';

export function generateStaticSite<M, C>(appModule: Type<M>, appComponent: Type<C>, pageUrls: string[], blogPath: string, distPath: string) {
  enableProdMode();

  const providers: Provider[] = [
    BlogService,
    { provide: BLOG_PATH, useValue: blogPath }
  ];

  const injector = ReflectiveInjector.resolveAndCreate(providers);
  const blog: BlogService = injector.get(BlogService);

  const document = readFileSync(joinPaths(distPath, 'index.html')).toString();
  const appServerModule = appServerModuleFactory(appModule, appComponent, blogPath);

  const renderPages = Observable.from([...pageUrls, '/404'])
    .mergeMap(url => renderPage(appServerModule, url, document))
    .do(page => { savePage(distPath, page.url, page.html); });

  const renderBlog = Observable.from(blog.getBlogList())
    .mergeMap(blogEntry => renderPage(appServerModule, blogEntry.url, document))
    .do(page => { savePage(distPath, page.url, page.html); });

  Observable.forkJoin(renderPages, renderBlog)
    .subscribe(() => { }, error => { exit(error); }, () => { exit(); });
}

function savePage(distPath: string, url: string, html: string) {
  const urlWithFilename = url.endsWith('/') ? joinPaths(url, `index.html`) : `${url}.html`;
  const filePath = joinPaths(distPath, urlWithFilename);

  safeWriteFileSync(filePath, html);
}

function exit(error?: any) {
  if (error) {
    console.log(error.toString());
  }

  process.exit(error ? 1 : 0);
}
