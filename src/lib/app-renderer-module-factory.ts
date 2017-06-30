import { NgModule, Type } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { BlogService } from './../services/blog.service';
import { PostProcessBlogEntryFunction, RendererBlogService } from './../services/renderer-blog.service';

export function appRenderModuleFactory<M, C>(
  appModule: Type<M>,
  appComponent: Type<C>,
  blogPath: string,
  production: boolean,
  postProcessblogEntry: PostProcessBlogEntryFunction): Type<any> {
  const blogService = new RendererBlogService(blogPath, production, postProcessblogEntry);

  @NgModule({
    imports: [
      appModule,
      ServerModule
    ],
    providers: [
      { provide: BlogService, useValue: blogService }
    ],
    bootstrap: [
      appComponent
    ]
  })
  class AppRendererModule { }

  return AppRendererModule;
}
