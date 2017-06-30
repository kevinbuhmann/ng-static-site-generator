import { enableProdMode, Type } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import { Routes } from '@angular/router';

import { getInjector } from '../utilities/get-injector';
import { BlogEntry } from './../module/services/blog.service';
import { GeneratorOptions } from './../options';
import { minifyHtml } from './../utilities/html-minify';
import { appRenderModuleFactory } from './app-renderer-module-factory';
import { getRouteUrls } from './get-route-urls';
import { RendererBlogService } from './renderer-blog.service';
import { removeInnerHtmlAttributes, transformHtml } from './transform-html';

export interface RenderedFile {
  path: string;
  contents: string;
}

export async function generateStaticSite<M, C>(appModule: Type<M>, appComponent: Type<C>, routes: Routes, options: GeneratorOptions, production: boolean) {
  enableProdMode();

  const injector = await getInjector(appRenderModuleFactory(appModule, undefined, options, production));
  const blogService: RendererBlogService = injector.get(RendererBlogService);

  const blogEntries = blogService.getBlogListSync(true);

  const appRendererModule = appRenderModuleFactory(appModule, appComponent, options, production);

  const files: RenderedFile[] = [];

  const urls = [
    '/404',
    ...getRouteUrls(routes),
    ...blogEntries.map(blogEntry => blogEntry.url)
  ];

  renderBlogJsonFiles();

  getTemplate()
    .then(template => Promise.all(urls.map(url => renderPage(url, template))))
    .then(() => { exit(); }, error => { exit(error); });

  function getTemplate() {
    return new Promise<string>(resolve => {
      process.on('message', message => {
        if (message.template) {
          resolve(message.template);
        }
      });
    });
  }

  function renderBlogJsonFiles() {
    const blogList: BlogEntry[] = blogEntries.map(blogEntry => ({ ...blogEntry, body: undefined }));
    files.push({ path: 'blog/list.json', contents: JSON.stringify(blogList) });

    for (const blogEntry of blogEntries) {
      files.push({ path: `${blogEntry.url.substr(1)}.json`, contents: JSON.stringify(blogEntry) });
    }
  }

  function renderPage<M>(url: string, document: string) {
    const visitors = [
      removeInnerHtmlAttributes
    ];

    return renderModule(appRendererModule, { url, document })
      .then(html => transformHtml(html, visitors))
      .then(html => production ? minifyHtml(html) : html)
      .then(html => {
        const urlWithFilename = url.endsWith('/') ? `${url}index.html` : `${url}.html`;
        files.push({ path: urlWithFilename.substr(1), contents: html });
      });
  }

  function exit(error?: any) {
    if (error) {
      process.send({ source: 'ng-static-site-generator', error: error.toString() });
    } else {
      process.send({ source: 'ng-static-site-generator', files });
    }

    process.exit(error ? 1 : 0);
  }
}
