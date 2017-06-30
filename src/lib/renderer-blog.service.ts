import { Inject, Injectable } from '@angular/core';
import { readdirSync, readFileSync } from 'fs';
import { safeLoad as parseYaml } from 'js-yaml';
import { join as joinPaths } from 'path';
import { Observable } from 'rxjs/Observable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';

import { minifyHtml } from '../utilities/html-minify';
import { renderMarkdownToHtml } from '../utilities/markdown';
import { GENERATOR_OPTIONS, PRODUCTION } from './../module/injection-tokens';
import { BlogEntry, BlogEntryMetadata, IBlogService } from './../module/services/blog.service';
import { GeneratorOptions } from './../options';

@Injectable()
export class RendererBlogService implements IBlogService {
  constructor(
    @Inject(PRODUCTION) private production: boolean,
    @Inject(GENERATOR_OPTIONS) private generatorOptions: GeneratorOptions) {
  }

  getBlogList(): Observable<BlogEntry[]> {
    return ArrayObservable.of(this.getBlogListSync());
  }

  getBlogEntry(date: string, urlSlug: string): Observable<BlogEntry> {
    const filename = `${date}-${urlSlug}`;

    return ArrayObservable.of(this.getBlogEntryByFilename(filename));
  }

  getBlogListSync(setBody = false) {
    return readdirSync(this.generatorOptions.blogPath)
      .map(filename => this.getBlogEntryByFilename(filename, setBody))
      .sort((entryA, entryB) => entryB.date.localeCompare(entryA.date));
  }

  private getBlogEntryByFilename(blogFilename: string, setBody = true) {
    const filenames = [`${blogFilename}.md`, `${blogFilename}.html`];

    const matchingFilenames = readdirSync(this.generatorOptions.blogPath)
      .filter(filename => filename === blogFilename || filenames.indexOf(filename) >= 0);

    if (matchingFilenames.length === 1) {
      const filename = matchingFilenames[0];
      const fileContents = readFileSync(joinPaths(this.generatorOptions.blogPath, filename)).toString();

      return this.parseBlogFileContents(filename, fileContents, setBody);
    }
  }

  private parseBlogFilename(filename: string) {
    const filenameMatch = /^([0-9]{4}-[0-9]{2}-[0-9]{2})-(.+)\.(md|html)$/g.exec(filename);

    const date = filenameMatch[1];
    const urlSlug = filenameMatch[2];

    return { date, urlSlug };
  }

  private parseBlogFileContents(filename: string, fileContents: string, setBody: boolean) {
    const parsedFilename = this.parseBlogFilename(filename);
    const fileContentsMatch = /^---(?:\r|\n)((?:.|\r|\n)+?)(?:\r|\n)---(?:\r|\n)((?:.|\r|\n)+)$/g.exec(fileContents);

    const date = parsedFilename.date;
    const url = `/blog/${date}/${parsedFilename.urlSlug}`;
    const metadata: BlogEntryMetadata = parseYaml(fileContentsMatch[1].trim());
    const body = setBody ? this.processBody(filename, fileContentsMatch[2].trim()) : undefined;

    return { date, url, body, ...metadata } as BlogEntry;
  }

  private processBody(filename: string, rawBody: string) {
    const html = filename.endsWith('.html') ? rawBody : renderMarkdownToHtml(rawBody);
    return this.production ? minifyHtml(html) : html;
  }
}
