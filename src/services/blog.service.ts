import { Inject, Injectable, InjectionToken } from '@angular/core';
import { readdirSync, readFileSync } from 'fs';
import { safeLoad as parseYaml } from 'js-yaml';
import { join as joinPaths } from 'path';

export const BLOG_PATH = new InjectionToken<string>('BLOG_PATH');

export interface BlogEntryMetadata {
  title: string;
  description: string;
}

export interface BlogEntry extends BlogEntryMetadata {
  date: string;
  url: string;
  body: string;
}

@Injectable()
export class BlogService {
  constructor(@Inject(BLOG_PATH) private blogPath: string) { }

  getBlogList() {
    return readdirSync(this.blogPath).map(filename => this.getBlogEntryByFilename(filename));
  }

  getBlogEntry(date: string, urlSlug: string) {
    const filename = `${date}-${urlSlug}.html`;

    return this.getBlogEntryByFilename(filename);
  }

  private getBlogEntryByFilename(filename: string) {
    const fileContents = readFileSync(joinPaths(this.blogPath, filename)).toString();

    return BlogService.parseBlogFileContents(filename, fileContents);
  }

  private static parseBlogFilename(filename: string) {
    const filenameMatch = /^([0-9]{4}-[0-9]{2}-[0-9]{2})-(.+).html$/g.exec(filename);

    const date = filenameMatch[1];
    const urlSlug = filenameMatch[2];

    return { date, urlSlug };
  }

  private static parseBlogFileContents(filename: string, fileContents: string, setBody = true) {
    const parsedFilename = BlogService.parseBlogFilename(filename);
    const fileContentsMatch = /^---((?:.|\r|\n)+)---((?:.|\r|\n)+)$/g.exec(fileContents);

    const date = parsedFilename.date;
    const url = `/blog/${date}/${parsedFilename.urlSlug}`;
    const metadata: BlogEntryMetadata = parseYaml(fileContentsMatch[1].trim());
    const body = setBody ? fileContentsMatch[2].trim() : undefined;

    return { date, url, body, ...metadata } as BlogEntry;
  }
}
