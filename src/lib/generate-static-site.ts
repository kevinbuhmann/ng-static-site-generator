import { enableProdMode, Provider, ReflectiveInjector, Type } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import * as chalk from 'chalk';
import { readFileSync } from 'fs';
import { join as joinPaths } from 'path';

import { BlogService, BLOG_PATH } from './../services/blog.service';
import { safeWriteFileSync } from './../utilities/fs.utilities';
import { minifyHtml } from './../utilities/html-minify';
import { appServerModuleFactory } from './app-server-module-factory';
import { templateFilename } from './generate-webpack-config';

export function generateStaticSite<M, C>(appModule: Type<M>, appComponent: Type<C>, pageUrls: string[], blogPath: string, distPath: string) {
  enableProdMode();

  const providers: Provider[] = [
    BlogService,
    { provide: BLOG_PATH, useValue: blogPath }
  ];

  const injector = ReflectiveInjector.resolveAndCreate(providers);
  const blog: BlogService = injector.get(BlogService);

  const template = readFileSync(joinPaths(distPath, templateFilename)).toString();
  const appServerModule = appServerModuleFactory(appModule, appComponent, blogPath);

  const urls = [
    '/404',
    ...pageUrls,
    ...blog.getBlogList().map(blogEntry => blogEntry.url)
  ];

  Promise.all(urls.map(url => renderPage(appServerModule, url, template, distPath)))
    .then(() => { exit(); }, error => { exit(error); });
}

function renderPage<M>(appServerModule: Type<M>, url: string, document: string, distPath: string) {
  return renderModule(appServerModule, { url, document })
    .then(html => minifyHtml(html))
    .then(html => {
      const urlWithFilename = url.endsWith('/') ? joinPaths(url, `index.html`) : `${url}.html`;
      const filePath = joinPaths(distPath, urlWithFilename);

      safeWriteFileSync(filePath, html);
      console.log(`${chalk.bold('ng-static-site-generator:')} ${chalk.green(filePath)} written.`);
    });
}

function exit(error?: any) {
  if (error) {
    console.log(error.toString());
  }

  process.exit(error ? 1 : 0);
}
