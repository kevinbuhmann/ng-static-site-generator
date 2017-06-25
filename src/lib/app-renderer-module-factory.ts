import { NgModule, Type } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { BlogService } from './../services/blog.service';
import { BLOG_PATH, RendererBlogService } from './../services/renderer-blog.service';

export function appRenderModuleFactory<M, C>(appModule: Type<M>, appComponent: Type<C>, blogPath: string): Type<any> {
  @NgModule({
    imports: [
      appModule,
      ServerModule
    ],
    providers: [
      { provide: BLOG_PATH, useValue: blogPath },
      { provide: BlogService, useClass: RendererBlogService }
    ],
    bootstrap: [
      appComponent
    ]
  })
  class AppRendererModule { }

  return AppRendererModule;
}
