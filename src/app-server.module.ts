import { NgModule, Type } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { BlogService, BLOG_PATH } from './services/blog.service';

export function createAppServerModule<M, C>(appModule: Type<M>, appComponent: Type<C>, blogPath: string) {
  @NgModule({
    imports: [
      appModule,
      ServerModule
    ],
    providers: [
      BlogService,
      { provide: BLOG_PATH, useValue: blogPath }
    ],
    bootstrap: [
      appComponent
    ]
  })
  class AppServerModule { }

  return AppServerModule;
}
