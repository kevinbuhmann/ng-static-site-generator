import { InjectionToken } from '@angular/core';
import { readdirSync, readFileSync } from 'fs';
import { safeLoad as parseYaml } from 'js-yaml';
import { join as joinPaths } from 'path';
import { Observable } from 'rxjs/Observable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';

import { minifyHtml } from '../utilities/html-minify';
import { renderMarkdownToHtml } from '../utilities/markdown';
import { BlogEntry, BlogEntryMetadata, IBlogService } from './blog.service';

export const BLOG_PATH = new InjectionToken<string>('BLOG_PATH');

export class RendererBlogService implements IBlogService {
  constructor(private blogPath: string) {
  }

  getBlogList(): Observable<BlogEntry[]> {
    return ArrayObservable.of(this.getBlogListSync());
  }

  getBlogEntry(date: string, urlSlug: string): Observable<BlogEntry> {
    const filename = `${date}-${urlSlug}`;

    return ArrayObservable.of(this.getBlogEntryByFilename(filename));
  }

  getBlogListSync(setBody = false) {
    return readdirSync(this.blogPath).map(filename => this.getBlogEntryByFilename(filename, setBody));
  }

  private getBlogEntryByFilename(blogFilename: string, setBody = true) {
    const filenames = [`${blogFilename}.md`, `${blogFilename}.html`];

    const matchingFilenames = readdirSync(this.blogPath)
      .filter(filename => filename === blogFilename || filenames.indexOf(filename) >= 0);

    if (matchingFilenames.length === 1) {
      const filename = matchingFilenames[0];
      const fileContents = readFileSync(joinPaths(this.blogPath, filename)).toString();

      return RendererBlogService.parseBlogFileContents(filename, fileContents, setBody);
    }
  }

  private static parseBlogFilename(filename: string) {
    const filenameMatch = /^([0-9]{4}-[0-9]{2}-[0-9]{2})-(.+)\.(md|html)$/g.exec(filename);

    const date = filenameMatch[1];
    const urlSlug = filenameMatch[2];

    return { date, urlSlug };
  }

  private static parseBlogFileContents(filename: string, fileContents: string, setBody: boolean) {
    const parsedFilename = RendererBlogService.parseBlogFilename(filename);
    const fileContentsMatch = /^---(?:\r|\n)((?:.|\r|\n)+?)(?:\r|\n)---(?:\r|\n)((?:.|\r|\n)+)$/g.exec(fileContents);

    const date = parsedFilename.date;
    const url = `/blog/${date}/${parsedFilename.urlSlug}`;
    const metadata: BlogEntryMetadata = parseYaml(fileContentsMatch[1].trim());
    const body = setBody ? RendererBlogService.processBody(filename, fileContentsMatch[2].trim()) : undefined;

    return { date, url, body, ...metadata } as BlogEntry;
  }

  private static processBody(filename: string, rawBody: string) {
    const html = filename.endsWith('.html') ? rawBody : renderMarkdownToHtml(rawBody);
    return minifyHtml(html);
  }
}
