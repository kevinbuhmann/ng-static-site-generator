import { NgModule } from '@angular/core';

import { BlogService } from './services/blog.service';

@NgModule({
  providers: [
    BlogService
  ]
})
export class NgStaticSiteGeneratorModule { }
