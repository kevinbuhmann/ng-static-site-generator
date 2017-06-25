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

  const output: string[] = [];

  Promise.all(urls.map(url => renderPage(url, template)))
    .then(() => { exit(); }, error => { exit(error); });

  function renderPage<M>(url: string, document: string) {
    return renderModule(appServerModule, { url, document })
      .then(html => minifyHtml(html))
      .then(html => {
        const urlWithFilename = url.endsWith('/') ? `${url}index.html` : `${url}.html`;
        const filePath = joinPaths(distPath, urlWithFilename);

        safeWriteFileSync(filePath, html);
        output.push(`rendered ${chalk.green(urlWithFilename.substr(1))}`);
      });
  }

  function exit(error?: any) {
    if (error) {
      console.log(error.toString());
    } else {
      console.log(`\n${chalk.gray.bold('ng-static-site-generator results:')}\n\n${output.join('\n')}`);
    }

    process.exit(error ? 1 : 0);
  }
}
