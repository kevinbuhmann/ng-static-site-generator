import { enableProdMode, Provider, ReflectiveInjector, Type } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import { Routes } from '@angular/router';
import * as chalk from 'chalk';
import { readFileSync } from 'fs';
import { join as joinPaths } from 'path';

import { BLOG_PATH, RendererBlogService } from './../services/renderer-blog.service';
import { safeWriteFileSync } from './../utilities/fs.utilities';
import { minifyHtml } from './../utilities/html-minify';
import { appRenderModuleFactory } from './app-renderer-module-factory';
import { templateFilename } from './generate-client-app-webpack-config';
import { getRouteUrls } from './get-route-urls';

export function generateStaticSite<M, C>(appModule: Type<M>, appComponent: Type<C>, routes: Routes, blogPath: string, distPath: string) {
  enableProdMode();

  const providers: Provider[] = [
    RendererBlogService,
    { provide: BLOG_PATH, useValue: blogPath }
  ];

  const injector = ReflectiveInjector.resolveAndCreate(providers);
  const blog: RendererBlogService = injector.get(RendererBlogService);

  const template = readFileSync(joinPaths(distPath, templateFilename)).toString();
  const appRendererModule = appRenderModuleFactory(appModule, appComponent, blogPath);

  const output: string[] = [];

  const blogEntries = blog.getBlogListSync();

  renderBlogJsonData();

  const urls = [
    '/404',
    ...getRouteUrls(routes),
    ...blogEntries.map(blogEntry => blogEntry.url)
  ];

  Promise.all(urls.map(url => renderPage(url, template)))
    .then(() => { exit(); }, error => { exit(error); });

  function renderBlogJsonData() {
    const blogListPath = 'blog/list.json';
    safeWriteFileSync(joinPaths(distPath, blogListPath), JSON.stringify(blogEntries.map(blogEntry => ({ ...blogEntry, body: undefined }))));
    output.push(`rendered ${chalk.green(blogListPath)}`);

    for (const blogEntry of blogEntries) {
      const blogEntryPath = `${blogEntry.url.substr(1)}.json`;
      safeWriteFileSync(joinPaths(distPath, blogEntryPath), JSON.stringify(blogEntry));
      output.push(`rendered ${chalk.green(blogEntryPath)}`);
    }
  }

  function renderPage<M>(url: string, document: string) {
    return renderModule(appRendererModule, { url, document })
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
