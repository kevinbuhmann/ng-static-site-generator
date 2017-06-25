import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';

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
  constructor(private http: Http = null) { }

  getBlogList(): Observable<BlogEntry[]> {
    return map.call(this.http.get('/blog/list.json'), (response: Response) => response.json());
  }

  getBlogEntry(date: string, urlSlug: string): Observable<BlogEntry> {
    return map.call(this.http.get(`/blog/${date}/${urlSlug}.json`), (response: Response) => response.json());
  }
}
