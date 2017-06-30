import { NgModule, Type } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { GENERATOR_OPTIONS, PRODUCTION } from './../module/injection-tokens';
import { BlogService } from './../module/services/blog.service';
import { GeneratorOptions } from './../options';
import { RendererBlogService } from './renderer-blog.service';

export function appRenderModuleFactory<M, C>(appModule: Type<M>, appComponent: Type<C>, options: GeneratorOptions, production: boolean): Type<any> {
  @NgModule({
    imports: [
      appModule,
      ServerModule
    ],
    providers: [
      RendererBlogService,
      { provide: PRODUCTION, useValue: production },
      { provide: GENERATOR_OPTIONS, useValue: options },
      { provide: BlogService, useClass: RendererBlogService }
    ],
    bootstrap: [
      ...(appComponent ? [appComponent] : [])
    ]
  })
  class AppRendererModule {
    ngDoBootstrap() { }
  }

  return AppRendererModule;
}
