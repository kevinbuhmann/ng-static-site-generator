import { NgModule, Provider, Type } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { BlogService } from './../services/blog.service';
import { BLOG_PATH, RendererBlogService } from './../services/renderer-blog.service';

const rendererBlogServiceProvider: Provider = {
  provide: BlogService,
  useFactory: (distPath: string) => new RendererBlogService(distPath),
  deps: [BLOG_PATH]
};

export function appRenderModuleFactory<M, C>(appModule: Type<M>, appComponent: Type<C>, blogPath: string): Type<any> {
  @NgModule({
    imports: [
      appModule,
      ServerModule
    ],
    providers: [
      rendererBlogServiceProvider,
      { provide: BLOG_PATH, useValue: blogPath }
    ],
    bootstrap: [
      appComponent
    ]
  })
  class AppRendererModule { }

  return AppRendererModule;
}
